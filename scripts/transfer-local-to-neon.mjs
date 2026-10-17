import {readFile,mkdir,stat,chmod} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {Pool} from 'pg';

// One-time transfer only: never replace an existing target schema or its data.
const [sourceFile,targetFile,archiveFile]=process.argv.slice(2);
if(!sourceFile || !targetFile || !archiveFile)throw new Error('Usage: node scripts/transfer-local-to-neon.mjs <source.env> <target.env> <backup.dump>');
const sourceEnv=parseEnv(await readFile(sourceFile,'utf8'));
const targetEnv=parseEnv(await readFile(targetFile,'utf8'));
const sourceURL=new URL(sourceEnv.DATABASE_URL_UNPOOLED || sourceEnv.DATABASE_URL);
const targetURL=new URL(targetEnv.DATABASE_URL_UNPOOLED || targetEnv.DATABASE_URL);
if(!['127.0.0.1','localhost'].includes(sourceURL.hostname))throw new Error('Source must be the original local PostgreSQL database.');
if(!targetURL.hostname.endsWith('.neon.tech') || targetURL.hostname.includes('-pooler.'))throw new Error('Target must be a direct Neon database connection.');
const source=new Pool({connectionString:sourceURL.href,max:2});
const target=new Pool({connectionString:targetURL.href,max:2,connectionTimeoutMillis:15000});
const bin=sourceEnv.POSTGRES_BIN || '/opt/homebrew/opt/postgresql@17/bin';
const pgEnv=(url)=>({...process.env,PGHOST:url.hostname,PGPORT:url.port || '5432',PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password),PGDATABASE:decodeURIComponent(url.pathname.slice(1)),PGSSLMODE:url.searchParams.get('sslmode') || 'prefer'});
const run=(command,args,url)=>{
  const result=spawnSync(`${bin}/${command}`,args,{env:pgEnv(url),encoding:'utf8'});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error(`${command} failed: ${result.stderr}`);
};
const tableNames=async(pool)=>(await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(row=>row.tablename);
const counts=async(pool,names)=>{
  const result={};
  for(const name of names){
    const table='"'+name.replaceAll('"','""')+'"';
    result[name]=(await pool.query(`SELECT count(*)::text AS count FROM public.${table}`)).rows[0].count;
  }
  return result;
};
try{
  const existing=await tableNames(target);
  if(existing.length)throw new Error('Target already contains public tables. Transfer refused to preserve existing data.');
  const names=await tableNames(source);
  if(!names.length)throw new Error('Source is empty.');
  const sourceCounts=await counts(source,names);
  try{await stat(archiveFile);console.log('Using the existing local backup archive.');}
  catch(error){
    if(error.code!=='ENOENT')throw error;
    await mkdir(new URL('.',new URL(archiveFile,`file://${process.cwd()}/`)),{recursive:true});
    run('pg_dump',['--format=custom','--no-owner','--no-privileges','--file',archiveFile],sourceURL);
    await chmod(archiveFile,0o600);
    console.log('Created a consistent local PostgreSQL backup.');
  }
  run('pg_restore',['--no-owner','--no-privileges','--exit-on-error','--single-transaction',`--dbname=${decodeURIComponent(targetURL.pathname.slice(1))}`,archiveFile],targetURL);
  const restoredNames=await tableNames(target);
  if(JSON.stringify(names)!==JSON.stringify(restoredNames))throw new Error('Restored table names differ from source.');
  const restoredCounts=await counts(target,restoredNames);
  const differences=names.filter(name=>sourceCounts[name]!==restoredCounts[name]);
  if(differences.length)throw new Error('Row counts differ for: '+differences.join(', '));
  console.log(`Transfer verified: ${names.length} tables, all row counts match.`);
  console.log(JSON.stringify(Object.fromEntries(['users','itineraries','leads','media'].filter(name=>name in restoredCounts).map(name=>[name,Number(restoredCounts[name])]))));
}finally{await Promise.all([source.end(),target.end()]);}
