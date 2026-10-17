import {createHmac} from 'node:crypto';
import {sql} from '@payloadcms/db-postgres';
import {getCMS} from './client';
import {allowedOrigins} from './security-origins';

export async function requestGuard(request:Request,scope:string,limit=20,windowSeconds=60){
  const origin=request.headers.get('origin');
  if(origin && !allowedOrigins().includes(origin))return Response.json({error:'This request is not permitted.'},{status:403});
  // Only trust IP headers installed/overwritten by the deployment's reverse proxy.
  // Without a configured trusted proxy, all traffic shares a conservative bucket.
  const header=process.env.VERCEL?'x-vercel-forwarded-for':process.env.TRUSTED_PROXY_IP_HEADER;
  const address=header?request.headers.get(header)?.split(',')[0]?.trim() || 'unknown':'local';
  try{
    const payload=await getCMS();
    for(const rule of [{scope:'all-api',limit:60,seconds:60},{scope,limit,seconds:windowSeconds}]){
      const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/rule.seconds);
      const key=createHmac('sha256',process.env.PAYLOAD_SECRET!).update(`${rule.scope}:${rule.seconds}:${bucket}:${address}`).digest('hex');
      const result=await payload.db.drizzle.execute(sql`INSERT INTO request_limits (key, count, expires_at, created_at, updated_at) VALUES (${key},1,NOW()+INTERVAL '1 day',NOW(),NOW()) ON CONFLICT (key) DO UPDATE SET count=request_limits.count+1, updated_at=NOW() WHERE request_limits.count<${rule.limit} RETURNING count`);
      if(!result.rows.length)return Response.json({error:'Too many requests. Please try again later.'},{status:429,headers:{'Retry-After':String(rule.seconds-now%rule.seconds)}});
    }
    if(Math.floor(Date.now()/60000)%60===0)await payload.db.drizzle.execute(sql`DELETE FROM request_limits WHERE expires_at<NOW()`);
    return null;
  }catch{return Response.json({error:'The service is temporarily unavailable. Please try again.'},{status:503});}
}
