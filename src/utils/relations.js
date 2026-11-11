/**
 * Menghasilkan map relasi dua arah (bidirectional) antar part tanpa duplikasi.
 * @param {Array} parts - Daftar part katalog
 * @returns {Map<string, string[]>} Map ID part ke array ID part terkait dua arah
 */
export function buildBidirectionalRelations(parts) {
  const relationMap = new Map()

  for (const part of parts) {
    if (!relationMap.has(part.id)) {
      relationMap.set(part.id, new Set())
    }
  }

  for (const part of parts) {
    const targets = part.related || []
    for (const targetId of targets) {
      if (relationMap.has(targetId) && targetId !== part.id) {
        relationMap.get(part.id).add(targetId)
        relationMap.get(targetId).add(part.id)
      }
    }
  }

  const result = new Map()
  for (const [id, set] of relationMap.entries()) {
    result.set(id, Array.from(set))
  }
  return result
}
