import {randomUUID} from 'node:crypto';
import {APIError, type CollectionBeforeOperationHook} from 'payload';
import sharp from 'sharp';

/** Runs before Payload generates filenames or writes either local or cloud files. */
export const secureUpload: CollectionBeforeOperationHook = async ({args, collection, operation, req}) => {
  if (!['create', 'update'].includes(operation) || !req.file) return args;
  const file = req.file;
  const ext = file.name.split('.').pop()?.toLowerCase();
  const types: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'], 'image/png': ['png'], 'image/webp': ['webp'], 'image/avif': ['avif'], 'application/pdf': ['pdf'],
  };
  const media = collection.slug === 'media';
  const max = media ? 5 * 1024 * 1024 : file.mimetype === 'application/pdf' ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
  const invalid = () => new APIError('Please upload a valid supported file within the size limit.', 400);
  if (!ext || !types[file.mimetype]?.includes(ext) || !file.data.length || file.data.length > max || file.size !== file.data.length || media && file.mimetype === 'application/pdf') throw invalid();
  if (file.mimetype === 'application/pdf') {
    if (file.data.subarray(0, 5).toString() !== '%PDF-') throw invalid();
  } else {
    try {
      const metadata = await sharp(file.data, {limitInputPixels: 40_000_000}).metadata();
      const expected = {'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'heif'}[file.mimetype];
      if (metadata.format !== expected || !metadata.width || !metadata.height || metadata.width * metadata.height > 40_000_000) throw invalid();
    } catch {throw invalid();}
  }
  file.name = `${randomUUID()}.${ext === 'jpeg' ? 'jpg' : ext}`;
  return args;
};
