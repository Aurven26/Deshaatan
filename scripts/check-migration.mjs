import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';

const name=`deshaatan_migration_check_${randomBytes(4).toString('hex')}`;
const adminPassword=(await readFile('.data/postgres/admin-password','utf8')).trim();
const appPassword=(await readFile('.data/postgres/app-password','utf8')).trim();
const psql=(query,database='postgres',user='deshaatan_admin',password=adminPassword)=>{
  const result=spawnSync('/opt/homebrew/opt/postgresql@17/bin/psql',['-h','127.0.0.1','-p','5433','-U',user,'-d',database,'-v','ON_ERROR_STOP=1','-At','-c',query],{encoding:'utf8',env:{...process.env,PGPASSWORD:password}});
  if(result.status!==0)throw new Error(result.stderr);
  return result.stdout;
};
psql(`CREATE DATABASE ${name} OWNER deshaatan_app`);
const result=spawnSync(process.execPath,['--env-file=.env.local','node_modules/payload/bin.js','migrate'],{encoding:'utf8',env:{...process.env,NODE_ENV:'production',DATABASE_URL:`postgresql://deshaatan_app:${appPassword}@127.0.0.1:5433/${name}`}});
if(result.status!==0)throw new Error(result.stderr || result.stdout);
const count=psql("SELECT count(*) FROM information_schema.tables WHERE table_schema='public'",name,'deshaatan_app',appPassword).trim();
if(Number(count)<20)throw new Error('Migration did not create the expected tables.');
console.log(`Initial production migration passed against a fresh PostgreSQL database (${count} tables).`);
console.log(`Verification database retained locally: ${name}`);
