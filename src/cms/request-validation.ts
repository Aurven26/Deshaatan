/** Form fields arrive as decimal strings; reject coercions such as true, null, and arrays. */
export function requestInteger(value: unknown): number {
  if (typeof value === 'number') return Number.isSafeInteger(value) ? value : NaN;
  if (typeof value === 'string' && /^\d{1,3}$/.test(value)) return Number(value);
  return NaN;
}
