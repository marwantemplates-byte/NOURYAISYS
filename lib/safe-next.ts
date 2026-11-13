/** Only allow internal redirects ("/app/..."), never to another site. */
export function safeNext(next: string | string[] | undefined | null, fallback = "/app") {
  const v = Array.isArray(next) ? next[0] : next;
  return v && v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : fallback;
}
