import nextEnv from '@next/env';
import {spawnSync} from 'node:child_process';

const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd());
const connectionString=process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if(!connectionString)throw new Error('DATABASE_URL is required to run CMS migrations.');
const hostname=new URL(connectionString).hostname;
if(hostname.endsWith('.neon.tech') && hostname.includes('-pooler.')){
  throw new Error('Set DATABASE_URL_UNPOOLED to the direct Neon connection before running CMS migrations.');
}
const result=spawnSync(process.execPath,['node_modules/payload/bin.js','migrate',...process.argv.slice(2)],{
  stdio:'inherit',
  env:{...process.env,NODE_ENV:'production',DATABASE_URL:connectionString},
});
if(result.error)throw result.error;
process.exit(result.status ?? 1);
