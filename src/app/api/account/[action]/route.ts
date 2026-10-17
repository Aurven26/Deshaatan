import {cookies} from 'next/headers';
import {getCMS} from '@/cms/client';
import {requestGuard} from '@/cms/request-security';
import {readRequestText} from '@/cms/request-body';
import {observePublicRoute} from '@/cms/secured-route';

export async function POST(request:Request,{params}:{params:Promise<{action:string}>}){
  return observePublicRoute(request => handlePOST(request, {params}))(request);
}
async function handlePOST(request:Request,{params}:{params:Promise<{action:string}>}){
  const {action}=await params;
  if(!['login','register','logout','forgot-password'].includes(action))return Response.json({error:'Not found.'},{status:404});
  try{
    const rejection=await requestGuard(request,`account:${action}`,5,900);if(rejection)return rejection;
    const store=await cookies();
    if(action==='logout'){store.delete('payload-token');return Response.json({success:true});}
    const raw=await readRequestText(request,4096);if(raw instanceof Response)return raw;
    const data:unknown=JSON.parse(raw);
    if(!data || typeof data!=='object' || Array.isArray(data))return Response.json({error:'Please provide valid account details.'},{status:400});
    const input=data as Record<string,unknown>;
    const text=(key:string)=>typeof input[key]==='string'?String(input[key]).trim():'';
    const password=typeof input.password==='string'?input.password:'';
    const payload=await getCMS();
    let email=text('email');
    if(action==='register'){
      const name=text('name'),phone=text('phone'),callingCode=text('callingCode');
      if(!name || name.length>100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || !/^\d{4,14}$/.test(phone) || !/^\+\d{1,4}$/.test(callingCode) || password.length<8 || password.length>128 || !/\d/.test(password) || input.terms!=='on')return Response.json({error:'Please complete the registration fields and accept the terms.'},{status:400});
      await payload.create({collection:'users',overrideAccess:true,data:{name,email,password,phone:callingCode+phone,role:'customer',offersConsent:input.offers==='on',termsAcceptedAt:new Date().toISOString()}});
    } else if(action==='forgot-password'){
      if(!process.env.SMTP_HOST)return Response.json({error:'Password recovery is not configured yet. Contact care@deshaatan.com.'},{status:503});
      if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:'Please enter your email address.'},{status:400});
      await payload.forgotPassword({collection:'users',data:{email}});
      return Response.json({success:true,message:'If an account exists, a reset email will be sent.'});
    } else {
      const identifier=text('identifier');
      if(!identifier || identifier.length>254 || !password || password.length>128)return Response.json({error:'Enter your email or mobile number and password.'},{status:400});
      if(identifier.includes('@'))email=identifier;
      else{const users=await payload.find({collection:'users',overrideAccess:true,where:{phone:{equals:identifier.startsWith('+')?identifier:`+91${identifier}`}},limit:1});email=users.docs[0]?.email || 'missing@invalid.local';}
    }
    const result=await payload.login({collection:'users',data:{email,password}});
    if(!result.token || !result.user)throw new Error('Login failed');
    store.set('payload-token',result.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:3600});
    return Response.json({success:true,user:{id:result.user.id,name:result.user.name,email:result.user.email}});
  }catch{return Response.json({error:action==='register'?'Unable to create this account. Check your details or try logging in.':'Unable to log in. Check your credentials and try again.'},{status:400});}
}
