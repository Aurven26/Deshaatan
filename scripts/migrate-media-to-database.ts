import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {getPayload} from 'payload';
import config from '@payload-config';

const mimeTypes:Record<string,string>={
  '.avif':'image/avif','.gif':'image/gif','.jpeg':'image/jpeg','.jpg':'image/jpeg',
  '.pdf':'application/pdf','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp',
};

async function listFiles(directory:string):Promise<string[]>{
  let entries;
  try{entries=await readdir(directory,{withFileTypes:true});}
  catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return [];throw error;}
  const nested=await Promise.all(entries.map(async entry=>{
    const filePath=path.join(directory,entry.name);
    return entry.isDirectory()?listFiles(filePath):entry.isFile()?[filePath]:[];
  }));
  return nested.flat();
}

const payload=await getPayload({config});
let copied=0;
let skipped=0;
try{
  for(const collection of ['media','private-files'] as const){
    const directory=path.resolve(process.cwd(),'.data',collection);
    for(const filePath of await listFiles(directory)){
      const relativePath=path.relative(directory,filePath).split(path.sep).join('/');
      const storagePath=collection==='private-files'?path.posix.join('private',relativePath):relativePath;
      const filename=path.posix.basename(storagePath);
      const extension=path.extname(filename).toLowerCase();
      const mimeType=mimeTypes[extension];
      if(!mimeType){console.warn(`Skipping unsupported file type: ${collection}/${storagePath}`);skipped++;continue;}
      const data=await readFile(filePath);
      await payload.db.pool.query(
        'INSERT INTO "cms_media_blobs" ("collection_slug", "storage_path", "filename", "mime_type", "size_bytes", "data", "updated_at") VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT ("collection_slug", "storage_path") DO UPDATE SET "filename" = EXCLUDED."filename", "mime_type" = EXCLUDED."mime_type", "size_bytes" = EXCLUDED."size_bytes", "data" = EXCLUDED."data", "updated_at" = NOW()',
        [collection,storagePath,filename,mimeType,data.length,data],
      );
      copied++;
      if(copied%25===0)console.log(`Copied ${copied} files to Neon...`);
    }
  }
  console.log(`Database media migration complete: ${copied} files copied; ${skipped} unsupported files skipped.`);
}finally{
  await payload.db.destroy();
}
