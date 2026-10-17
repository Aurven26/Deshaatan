/** Enforce the byte limit while reading, including requests without Content-Length. */
export async function readRequestText(request: Request, limit: number): Promise<string | Response> {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return Response.json({error: 'The request is too large.'}, {status: 413});
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString('utf8');
  } catch {
    return Response.json({error: 'Please provide valid request details.'}, {status: 400});
  } finally {
    reader.releaseLock();
  }
}
