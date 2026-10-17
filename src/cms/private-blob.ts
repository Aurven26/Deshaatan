import path from 'node:path';
import {cloudStoragePlugin} from '@payloadcms/plugin-cloud-storage';
import type {Adapter} from '@payloadcms/plugin-cloud-storage/types';
import {getFilePrefix} from '@payloadcms/plugin-cloud-storage/utilities';
import {put,get,del} from '@vercel/blob';

// The stock Vercel adapter only supports public files. This adapter keeps
// resumes and unmoderated review photos private and serves them through Payload.
const adapter:Adapter=({collection,prefix=''})=>({
  name:'private-vercel-blob',
  generateURL:({filename})=>`/cms-api/private-files/file/${encodeURIComponent(filename)}`,
  handleUpload:async({file,storageFilePath})=>{
    await put(storageFilePath,file.buffer,{access:'private',token:process.env.PRIVATE_BLOB_READ_WRITE_TOKEN,addRandomSuffix:false,allowOverwrite:true,contentType:file.mimeType});
  },
  handleDelete:async({storageFilePath})=>{await del(storageFilePath,{token:process.env.PRIVATE_BLOB_READ_WRITE_TOKEN});},
  staticHandler:async(req,{doc,params:{filename}})=>{
    if(!req.user || !['admin','editor','support'].includes(req.user.role))return new Response('Forbidden',{status:403});
    try{
      const filePrefix=await getFilePrefix({collection,collectionPrefix:prefix,doc,filename,req,useCompositePrefixes:false});
      const blob=await get(path.posix.join(filePrefix,filename),{access:'private',token:process.env.PRIVATE_BLOB_READ_WRITE_TOKEN,useCache:false});
      if(!blob || blob.statusCode!==200 || !blob.stream)return new Response('Not found',{status:404});
      return new Response(blob.stream,{headers:{'Content-Type':blob.blob.contentType,'Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
    }catch{return new Response('Unable to retrieve this file.',{status:503});}
  },
});
export const privateBlobStorage=()=>cloudStoragePlugin({enabled:!!process.env.PRIVATE_BLOB_READ_WRITE_TOKEN,alwaysInsertFields:true,collections:{'private-files':{adapter,prefix:'private',disableLocalStorage:true}}});
