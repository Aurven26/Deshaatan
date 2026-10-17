import {Redis} from '@upstash/redis';

let client:Redis|null|undefined;
const versionKey='deshaatan:cache:version';

function getRedis(){
  if(client!==undefined)return client;
  const url=process.env.UPSTASH_REDIS_REST_URL;
  const token=process.env.UPSTASH_REDIS_REST_TOKEN;
  client=url&&token?new Redis({url,token}):null;
  return client;
}

export async function getCachedCMS<T>(key:string,ttlSeconds:number,load:()=>Promise<T>):Promise<T>{
  const redis=getRedis();
  if(!redis)return load();
  let version:string|number='0';
  try{
    version=await redis.get<string|number>(versionKey) ?? '0';
    const value=await redis.get<T>(`deshaatan:cms:v1:${version}:${key}`);
    if(value!==null)return value;
  }catch(error){
    console.warn('CMS cache read failed; loading from PostgreSQL.',error instanceof Error?error.message:'unknown error');
    return load();
  }
  const value=await load();
  try{await redis.set(`deshaatan:cms:v1:${version}:${key}`,value,{ex:ttlSeconds});}
  catch(error){console.warn('CMS cache write failed; using PostgreSQL result.',error instanceof Error?error.message:'unknown error');}
  return value;
}

export async function invalidateCMSCache(){
  const redis=getRedis();
  if(!redis)return;
  try{await redis.incr(versionKey);}
  catch(error){console.warn('CMS cache invalidation failed; cached entries will expire.',error instanceof Error?error.message:'unknown error');}
}
