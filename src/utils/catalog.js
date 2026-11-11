/**
 * Helper pencarian dan pemfilteran katalog tooling
 */

/**
 * Normalisasi string untuk pencarian fuzzy sederhana
 */
export function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Memfilter daftar parts berdasarkan kriteria:
 * - category: 'all' | 'dies' | 'mold' | 'jig-fixture'
 * - branches: string[] (array branch id yang dipilih)
 * - query: string (nama, alias, ringkasan, material, fungsi)
 * - functionFilter: string (opsional)
 * - materialFilter: string (opsional)
 * - automotiveFilter: string (opsional)
 */
export function filterParts(parts, options = {}) {
  const {
    category = 'all',
    branches = [],
    query = '',
    functionFilter = '',
    materialFilter = '',
    automotiveFilter = '',
  } = options

  const q = normalize(query)
  const fFilter = normalize(functionFilter)
  const mFilter = normalize(materialFilter)
  const aFilter = normalize(automotiveFilter)
  const selectedBranches = new Set(branches)

  return parts.filter((part) => {
    // 1. Kategori
    if (category !== 'all' && category !== 'landing' && !part.categoryIds.includes(category)) {
      return false
    }

    // 2. Cabang (jika ada cabang yang dipilih, part harus punya setidaknya 1 kecocokan)
    if (selectedBranches.size > 0) {
      const matchBranch = part.branchIds.some((b) => selectedBranches.has(b))
      if (!matchBranch) return false
    }

    // 3. Filter Fungsi spesifik
    if (fFilter) {
      const hasFunc = (part.functions || []).some((f) => normalize(f).includes(fFilter))
      if (!hasFunc) return false
    }

    // 4. Filter Material spesifik
    if (mFilter) {
      const hasMat = (part.materials || []).some((m) => normalize(m).includes(mFilter))
      if (!hasMat) return false
    }

    // 5. Filter Aplikasi Otomotif spesifik
    if (aFilter) {
      const hasAuto = (part.automotiveUse || []).some((a) => normalize(a).includes(aFilter))
      if (!hasAuto) return false
    }

    // 6. Pencarian Teks Bebas
    if (q) {
      const inName = normalize(part.name).includes(q)
      const inSummary = normalize(part.summary).includes(q)
      const inAlias = (part.alias || []).some((al) => normalize(al).includes(q))
      const inDesc = normalize(part.description).includes(q)
      const inFunc = (part.functions || []).some((f) => normalize(f).includes(q))
      const inMat = (part.materials || []).some((m) => normalize(m).includes(q))
      const inAuto = (part.automotiveUse || []).some((a) => normalize(a).includes(q))

      if (!inName && !inSummary && !inAlias && !inDesc && !inFunc && !inMat && !inAuto) {
        return false
      }
    }

    return true
  })
}

/**
 * Ekstraksi daftar unik filter dari kumpulan parts
 */
export function extractFacetOptions(parts) {
  const functions = new Set()
  const materials = new Set()
  const automotive = new Set()

  for (const part of parts) {
    ;(part.functions || []).forEach((f) => functions.add(f))
    ;(part.materials || []).forEach((m) => {
      // Ambil kode material pokok (cth: "SKD11" dari "SKD11 (58-60 HRC)")
      const clean = m.split('(')[0].trim()
      if (clean) materials.add(clean)
    })
    ;(part.automotiveUse || []).forEach((a) => automotive.add(a))
  }

  return {
    functions: Array.from(functions).sort(),
    materials: Array.from(materials).sort(),
    automotive: Array.from(automotive).sort(),
  }
}
