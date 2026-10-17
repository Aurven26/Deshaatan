import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {Pool} from 'pg';

// Adopt an existing dev-pushed schema only after it matches the committed snapshot.
const envFile=process.argv[2];
if(!envFile)throw new Error('Usage: node scripts/baseline-cms-migrations.mjs <target.env> [--apply]');
const env=parseEnv(await readFile(envFile,'utf8'));
const url=new URL(env.DATABASE_URL_UNPOOLED || env.DATABASE_URL);
if(!url.hostname.endsWith('.neon.tech') || url.hostname.includes('-pooler.'))throw new Error('Use a direct Neon connection.');
const names=(await readdir('src/migrations')).filter(name=>/^\d.*\.ts$/.test(name)).map(name=>name.slice(0,-3)).sort();
const snapshot=JSON.parse(await readFile(`src/migrations/${names.at(-1)}.json`,'utf8'));
const normalize=type=>type.replaceAll('character varying','varchar').replace(/^serial$/,'integer').replaceAll('"','');
const expected=Object.values(snapshot.tables).flatMap(table=>Object.values(table.columns).map(column=>`${table.name}.${column.name}:${normalize(column.type)}:${column.notNull}`)).sort();
const pool=new Pool({connectionString:url.href,max:1,connectionTimeoutMillis:15000});
try{
  const actual=await pool.query(`SELECT c.relname AS table_name,a.attname AS column_name,format_type(a.atttypid,a.atttypmod) AS type,a.attnotnull AS not_null FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped`);
  const columns=actual.rows.map(column=>`${column.table_name}.${column.column_name}:${normalize(column.type)}:${column.not_null}`).sort();
  assert.deepEqual(columns,expected,'Database columns must match the latest migration snapshot before baselining.');
  const enumRows=(await pool.query("SELECT t.typname,e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' ORDER BY t.typname,e.enumsortorder")).rows;
  const enums=Object.groupBy(enumRows,row=>row.typname);
  const actualEnums=Object.fromEntries(Object.entries(enums).map(([name,rows])=>[name,rows.map(row=>row.enumlabel)]));
  const expectedEnums=Object.fromEntries(Object.values(snapshot.enums).map(value=>[value.name,value.values]));
  assert.deepEqual(actualEnums,expectedEnums,'Database enums must match the latest migration snapshot.');
  console.log(`Schema verified against committed snapshot: ${Object.keys(snapshot.tables).length} tables and ${columns.length} columns.`);
  const history=(await pool.query('SELECT name,batch FROM payload_migrations ORDER BY id')).rows;
  const applied=history.filter(row=>Number(row.batch)>=0).map(row=>row.name).sort();
  if(JSON.stringify(applied)===JSON.stringify(names)){console.log('Migration baseline already recorded.');}
  else{
    assert.ok(history.every(row=>row.name==='dev' && Number(row.batch)===-1),'Unexpected migration history: manual review required.');
    if(!process.argv.includes('--apply'))console.log(`Ready to baseline ${names.length} existing migrations. Pass --apply to record them.`);
    else{
      const client=await pool.connect();
      try{
        await client.query('BEGIN');
        await client.query("DELETE FROM payload_migrations WHERE name='dev' AND batch=-1");
        for(const name of names)await client.query('INSERT INTO payload_migrations (name,batch) VALUES ($1,1)',[name]);
        await client.query('COMMIT');
        console.log(`Recorded ${names.length} existing migrations; application records unchanged.`);
      }catch(error){await client.query('ROLLBACK');throw error;}
      finally{client.release();}
    }
  }
}finally{await pool.end();}
