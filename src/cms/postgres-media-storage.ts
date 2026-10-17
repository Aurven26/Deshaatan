import {cloudStoragePlugin} from '@payloadcms/plugin-cloud-storage';
import type {Adapter} from '@payloadcms/plugin-cloud-storage/types';
import path from 'node:path';

type StoredFile={data:Buffer;mime_type:string;size_bytes:number};

const adapter:Adapter=({collection})=>({
  name:'postgres-media-storage',
  generateURL:({filename,prefix})=>`/cms-api/${collection.slug}/file/${encodeURIComponent(filename)}${prefix?`?prefix=${encodeURIComponent(prefix)}`:''}`,
  handleUpload:async({file,storageFilePath,req})=>{
    await req.payload.db.pool.query(
      'INSERT INTO "cms_media_blobs" ("collection_slug", "storage_path", "filename", "mime_type", "size_bytes", "data", "updated_at") VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT ("collection_slug", "storage_path") DO UPDATE SET "filename" = EXCLUDED."filename", "mime_type" = EXCLUDED."mime_type", "size_bytes" = EXCLUDED."size_bytes", "data" = EXCLUDED."data", "updated_at" = NOW()',
      [collection.slug,storageFilePath,path.posix.basename(storageFilePath),file.mimeType,file.buffer.length,file.buffer],
    );
  },
  handleDelete:async({storageFilePath,req})=>{
    await req.payload.db.pool.query('DELETE FROM "cms_media_blobs" WHERE "collection_slug" = $1 AND "storage_path" = $2',[collection.slug,storageFilePath]);
  },
  staticHandler:async(req,{params:{filename,prefix},headers})=>{
    if(collection.slug==='private-files' && (!req.user || !['admin','editor','support'].includes(req.user.role)))return new Response('Forbidden',{status:403});
    const safeFilename=path.posix.basename(filename);
    const storagePath=prefix?path.posix.join(prefix,safeFilename):safeFilename;
    const result=await req.payload.db.pool.query<StoredFile>('SELECT "data", "mime_type", "size_bytes" FROM "cms_media_blobs" WHERE "collection_slug" = $1 AND "storage_path" = $2 LIMIT 1',[collection.slug,storagePath]);
    const file=result.rows[0];
    if(!file)return new Response('Not found',{status:404});
    const privateFile=collection.slug==='private-files';
    const responseHeaders=new Headers(headers);
    responseHeaders.set('Content-Type',file.mime_type);
    responseHeaders.set('Content-Length',String(file.size_bytes));
    responseHeaders.set('Cache-Control',privateFile?'private, no-store':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    responseHeaders.set('X-Content-Type-Options','nosniff');
    if(privateFile)responseHeaders.set('Content-Disposition',`attachment; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
    return new Response(new Uint8Array(file.data),{headers:responseHeaders});
  },
});

export const postgresMediaStorage=()=>cloudStoragePlugin({
  alwaysInsertFields:true,
  collections:{
    media:{adapter,disableLocalStorage:true},
    'private-files':{adapter,prefix:'private',disableLocalStorage:true},
  },
});
