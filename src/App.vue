<script setup>
import { computed } from 'vue'
import { useCatalog } from './composables/useCatalog.js'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import CategoryTabs from './components/catalog/CategoryTabs.vue'
import BranchChips from './components/catalog/BranchChips.vue'
import SearchBar from './components/common/SearchBar.vue'
import PartGrid from './components/catalog/PartGrid.vue'
import PartDetailPanel from './components/detail/PartDetailPanel.vue'
import AssemblyHeroView from './components/catalog/AssemblyHeroView.vue'

const {
  categories,
  branches,
  parts,
  branchesMap,
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
} = useCatalog()

const hasActiveFilters = computed(() => {
  return (
    (selectedCategory.value !== 'landing' && selectedCategory.value !== 'all') ||
    selectedBranches.value.length > 0 ||
    searchQuery.value.trim() !== '' ||
    selectedFunction.value !== '' ||
    selectedMaterial.value !== '' ||
    selectedAutomotive.value !== ''
  )
})

function handleCategoryDrilldown(catId) {
  selectedCategory.value = catId
  selectedBranches.value = []
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function returnToAssemblyLanding() {
  selectedCategory.value = 'landing'
  selectedBranches.value = []
  searchQuery.value = ''
  selectedFunction.value = ''
  selectedMaterial.value = ''
  selectedAutomotive.value = ''
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-industrial-offwhite-bg dark:bg-industrial-charcoal text-industrial-charcoal dark:text-industrial-offwhite transition-colors font-sans selection:bg-industrial-amber/30">
    <!-- Header -->
    <Header
      :total-parts="parts.length"
      :filtered-count="filteredParts.length"
    />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Breadcrumb / Back button when in Drilldown mode -->
      <div v-if="selectedCategory !== 'landing'" class="flex items-center justify-between border-b border-industrial-steel-soft dark:border-industrial-steel-gray pb-3">
        <button
          type="button"
          @click="returnToAssemblyLanding"
          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-gunmetal hover:border-industrial-amber hover:text-industrial-amber transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke 3 Assembly Set
        </button>

        <div class="text-xs font-mono text-industrial-slate-gray dark:text-industrial-cool-gray flex items-center gap-2">
          <span>Kategori Aktif:</span>
          <span class="font-bold text-industrial-copper dark:text-industrial-amber uppercase">{{ selectedCategory }}</span>
        </div>
      </div>

      <!-- VIEW 1: LANDING PAGE - 3 ASSEMBLY SETS -->
      <section v-if="selectedCategory === 'landing'" class="space-y-6">
        <AssemblyHeroView
          :categories="categories"
          :category-counts="categoryCounts"
          :branches="branches"
          @select-category="handleCategoryDrilldown"
        />
      </section>

      <!-- VIEW 2: DRILLDOWN CATALOG VIEW (CABANG & PARTS) -->
      <section v-else class="space-y-6">
        <!-- Top Controls: Tabs & Search/Filter Section -->
        <section class="space-y-4">
          <!-- Category Tabs -->
          <CategoryTabs
            :categories="categories"
            :selected-category="selectedCategory"
            :category-counts="categoryCounts"
            @select="selectedCategory = $event"
          />

          <!-- Branch Chips (for active category) -->
          <BranchChips
            :branches="availableBranches"
            :selected-branches="selectedBranches"
            @toggle="toggleBranch"
            @clear="selectedBranches = []"
          />

          <!-- Search Bar and Facets -->
          <SearchBar
            v-model:searchQuery="searchQuery"
            v-model:selectedFunction="selectedFunction"
            v-model:selectedMaterial="selectedMaterial"
            v-model:selectedAutomotive="selectedAutomotive"
            :facets="facets"
            :has-active-filters="hasActiveFilters"
            @reset="resetFilters"
          />
        </section>

        <!-- Part Grid & Empty State -->
        <PartGrid
          :parts="filteredParts"
          :branches-map="branchesMap"
          @select-part="selectPart($event)"
          @reset="resetFilters"
        />
      </section>
    </main>

    <!-- Part Detail Panel (Drawer / Modal) -->
    <PartDetailPanel
      :part="currentPart"
      :model="currentModel"
      :related-parts="currentRelatedParts"
      :branches-map="branchesMap"
      :can-go-back="canGoBack"
      :can-go-forward="canGoForward"
      @close="closeDetail"
      @select-part="selectPart($event)"
      @back="goBack"
      @forward="goForward"
    />

    <!-- Footer -->
    <Footer />
  </div>
</template>
