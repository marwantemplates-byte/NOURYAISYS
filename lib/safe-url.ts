/** Only allow http(s) links (blocks javascript:, data:, etc. coming from user data). */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : null;
}
