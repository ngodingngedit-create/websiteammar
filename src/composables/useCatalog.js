import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import rawCategories from '../data/categories.json'
import rawBranches from '../data/branches.json'
import rawParts from '../data/parts.json'
import rawModels from '../data/models.json'
import { buildBidirectionalRelations } from '../utils/relations.js'
import { filterParts, extractFacetOptions } from '../utils/catalog.js'

export function useCatalog() {
  const categories = ref(rawCategories)
  const branches = ref(rawBranches)
  const parts = ref(rawParts)
  const models = ref(rawModels)

  // Map relasi 2 arah
  const bidirectionalRelations = buildBidirectionalRelations(rawParts)

  // Quick lookup maps
  const partsMap = new Map(rawParts.map((p) => [p.id, p]))
  const modelsMap = new Map(rawModels.map((m) => [m.id, m]))
  const branchesMap = new Map(rawBranches.map((b) => [b.id, b]))
  const categoriesMap = new Map(rawCategories.map((c) => [c.id, c]))

  // Filter & Search states
  const selectedCategory = ref('landing') // 'landing' | 'all' | 'dies' | 'mold' | 'jig-fixture'
  const selectedBranches = ref([]) // array of branchId
  const searchQuery = ref('')
  const selectedFunction = ref('')
  const selectedMaterial = ref('')
  const selectedAutomotive = ref('')

  // Detail Drawer state
  const selectedPartId = ref(null)
  const navigationHistory = ref([])
  const historyIndex = ref(-1)

  // Facet options for filters
  const facets = computed(() => extractFacetOptions(rawParts))

  // Cabang yang relevan dengan kategori aktif
  const availableBranches = computed(() => {
    if (selectedCategory.value === 'all' || selectedCategory.value === 'landing') {
      return branches.value
    }
    return branches.value.filter((b) => b.categoryId === selectedCategory.value)
  })

  // Part yang sudah difilter
  const filteredParts = computed(() => {
    const categoryForFilter = selectedCategory.value === 'landing' ? 'all' : selectedCategory.value
    return filterParts(parts.value, {
      category: categoryForFilter,
      branches: selectedBranches.value,
      query: searchQuery.value,
      functionFilter: selectedFunction.value,
      materialFilter: selectedMaterial.value,
      automotiveFilter: selectedAutomotive.value,
    })
  })

  // Hitungan part per kategori
  const categoryCounts = computed(() => {
    const counts = { all: parts.value.length, dies: 0, mold: 0, 'jig-fixture': 0 }
    for (const p of parts.value) {
      for (const cid of p.categoryIds) {
        if (counts[cid] !== undefined) counts[cid]++
      }
    }
    return counts
  })

  // Detail part aktif
  const currentPart = computed(() => {
    if (!selectedPartId.value) return null
    return partsMap.get(selectedPartId.value) || null
  })

  // Model untuk part aktif
  const currentModel = computed(() => {
    if (!currentPart.value) return null
    return modelsMap.get(currentPart.value.modelId) || null
  })

  // Part terkait (dua arah) untuk part aktif
  const currentRelatedParts = computed(() => {
    if (!selectedPartId.value) return []
    const relatedIds = bidirectionalRelations.get(selectedPartId.value) || []
    return relatedIds.map((id) => partsMap.get(id)).filter(Boolean)
  })

  // Reset filter cabang bila kategori berubah
  watch(selectedCategory, () => {
    selectedBranches.value = []
  })

  // Navigasi detail part
  function selectPart(partId, pushHistory = true) {
    if (!partId || !partsMap.has(partId)) {
      selectedPartId.value = null
      updateHash(null)
      return
    }

    if (pushHistory) {
      if (historyIndex.value < navigationHistory.value.length - 1) {
        navigationHistory.value = navigationHistory.value.slice(0, historyIndex.value + 1)
      }
      navigationHistory.value.push(partId)
      historyIndex.value = navigationHistory.value.length - 1
    }

    selectedPartId.value = partId
    updateHash(partId)
  }

  function closeDetail() {
    selectedPartId.value = null
    updateHash(null)
  }

  function goBack() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      const prevId = navigationHistory.value[historyIndex.value]
      selectedPartId.value = prevId
      updateHash(prevId)
    }
  }

  function goForward() {
    if (historyIndex.value < navigationHistory.value.length - 1) {
      historyIndex.value++
      const nextId = navigationHistory.value[historyIndex.value]
      selectedPartId.value = nextId
      updateHash(nextId)
    }
  }

  const canGoBack = computed(() => historyIndex.value > 0)
  const canGoForward = computed(() => historyIndex.value < navigationHistory.value.length - 1)

  function toggleBranch(branchId) {
    const idx = selectedBranches.value.indexOf(branchId)
    if (idx >= 0) {
      selectedBranches.value.splice(idx, 1)
    } else {
      selectedBranches.value.push(branchId)
    }
  }

  function resetFilters() {
    selectedCategory.value = 'all'
    selectedBranches.value = []
    searchQuery.value = ''
    selectedFunction.value = ''
    selectedMaterial.value = ''
    selectedAutomotive.value = ''
  }

  // Deep linking URL hash #/part/<id>
  function updateHash(partId) {
    if (typeof window === 'undefined') return
    if (partId) {
      if (window.location.hash !== `#/part/${partId}`) {
        window.history.replaceState(null, '', `#/part/${partId}`)
      }
    } else {
      if (window.location.hash.startsWith('#/part/')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
  }

  function parseHash() {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (hash && hash.startsWith('#/part/')) {
      const partId = hash.replace('#/part/', '').trim()
      if (partsMap.has(partId)) {
        selectPart(partId, true)
      }
    }
  }

  function handleHashChange() {
    parseHash()
  }

  onMounted(() => {
    parseHash()
    window.addEventListener('hashchange', handleHashChange)
  })

  onUnmounted(() => {
    window.removeEventListener('hashchange', handleHashChange)
  })

  return {
    categories,
    branches,
    parts,
    models,
    partsMap,
    modelsMap,
    branchesMap,
    categoriesMap,
    selectedCategory,
    selectedBranches,
    searchQuery,
    selectedFunction,
    selectedMaterial,
    selectedAutomotive,
    facets,
    availableBranches,
    filteredParts,
    categoryCounts,
    selectedPartId,
    currentPart,
    currentModel,
    currentRelatedParts,
    canGoBack,
    canGoForward,
    selectPart,
    closeDetail,
    goBack,
    goForward,
    toggleBranch,
    resetFilters,
  }
}
