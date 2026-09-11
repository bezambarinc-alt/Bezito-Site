export function parseProductName(name: string): { title: string; variant: string | null } {
  const idx = name.indexOf('|')
  if (idx === -1) return { title: name.trim(), variant: null }
  return { title: name.slice(0, idx).trim(), variant: name.slice(idx + 1).trim() }
}
