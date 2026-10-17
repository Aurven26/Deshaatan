/** Only configured origins are trusted; never derive trust from a request Host header. */
export function allowedOrigins(): string[] {
  const values = (process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000').split(',');
  return values.map(value => {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Configure valid ALLOWED_ORIGINS.');
    return url.origin;
  });
}
