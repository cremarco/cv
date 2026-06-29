/* Asset URL helpers. The deck can be served from a sub-path (GitHub Pages
   mounts it at /AIPP/), so every asset URL must be resolved against
   BASE_URL at runtime instead of being hard-coded. */

export function withBase(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = path.replace(/^\/+/, '')
  return `${normalizedBase}${normalizedPath}`
}

export function imageUrl(path: string) {
  return withBase(`images/${path}`)
}

export function cssUrl(path: string) {
  return `url("${imageUrl(path)}")`
}
