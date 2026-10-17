import {randomBytes} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const project=process.cwd();
const directory=path.join(project,'.data','postgres');
const cluster=path.join(directory,'cluster');
const bin=process.env.POSTGRES_BIN || '/opt/homebrew/opt/postgresql@17/bin';
const port=5433;
const run=(command,args,options={})=>{
  const result=spawnSync(path.join(bin,command),args,{encoding:'utf8',...options});
  if(result.status!==0)throw new Error(`${command} failed: ${result.stderr || result.stdout || result.error}`);
  return result.stdout;
};
await mkdir(directory,{recursive:true,mode:0o700});
let adminPassword;
try{adminPassword=(await readFile(path.join(directory,'admin-password'),'utf8')).trim();}
catch(error){
  if(error.code!=='ENOENT')throw error;
  adminPassword=randomBytes(32).toString('hex');
  await writeFile(path.join(directory,'admin-password'),adminPassword,{mode:0o600,flag:'wx'});
}
try{await readFile(path.join(cluster,'PG_VERSION'));}
catch(error){
  if(error.code!=='ENOENT')throw error;
  run('initdb',['-D',cluster,'-U','deshaatan_admin','--encoding=UTF8','--auth-local=scram-sha-256','--auth-host=scram-sha-256','--pwfile',path.join(directory,'admin-password')]);
}
const status=spawnSync(path.join(bin,'pg_ctl'),['-D',cluster,'status'],{encoding:'utf8'});
if(status.status!==0)run('pg_ctl',['-D',cluster,'-l',path.join(directory,'server.log'),'-o',`-p ${port} -h 127.0.0.1 -k ${directory}`,'-w','start']);
const env={...process.env,PGPASSWORD:adminPassword};
const sql=(query)=>run('psql',['-h','127.0.0.1','-p',String(port),'-U','deshaatan_admin','-d','postgres','-v','ON_ERROR_STOP=1','-At','-c',query],{env});
let appPassword;
try{appPassword=(await readFile(path.join(directory,'app-password'),'utf8')).trim();}
catch(error){
  if(error.code!=='ENOENT')throw error;
  appPassword=randomBytes(32).toString('hex');
  await writeFile(path.join(directory,'app-password'),appPassword,{mode:0o600,flag:'wx'});
}
if(!sql("SELECT 1 FROM pg_roles WHERE rolname='deshaatan_app'").trim())sql(`CREATE ROLE deshaatan_app LOGIN PASSWORD '${appPassword}' NOSUPERUSER NOCREATEDB NOCREATEROLE`);
if(!sql("SELECT 1 FROM pg_database WHERE datname='deshaatan'").trim())sql('CREATE DATABASE deshaatan OWNER deshaatan_app');
const filename=path.join(project,'.env.local');
let existing='';
try{existing=await readFile(filename,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
const variables={DATABASE_URL:`postgresql://deshaatan_app:${appPassword}@127.0.0.1:${port}/deshaatan`,PAYLOAD_SECRET:randomBytes(48).toString('hex'),NEXT_PUBLIC_SERVER_URL:'http://127.0.0.1:3000'};
const additions=Object.entries(variables).filter(([key])=>!new RegExp(`^${key}=`, 'm').test(existing)).map(([key,value])=>`${key}=${value}`).join('\n');
if(additions)await writeFile(filename,`${existing}${existing && !existing.endsWith('\n')?'\n':''}${additions}\n`,{mode:0o600});
const connection=run('psql',['-h','127.0.0.1','-p',String(port),'-U','deshaatan_app','-d','deshaatan','-v','ON_ERROR_STOP=1','-At','-c','SELECT current_database(), current_user'],{env:{...process.env,PGPASSWORD:appPassword}});
console.log(`PostgreSQL ready on 127.0.0.1:${port}. ${connection.trim()}`);
console.log('Connection settings saved privately in .env.local.');
