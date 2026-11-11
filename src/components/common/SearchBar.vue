<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  selectedFunction: {
    type: String,
    default: ''
  },
  selectedMaterial: {
    type: String,
    default: ''
  },
  selectedAutomotive: {
    type: String,
    default: ''
  },
  facets: {
    type: Object,
    default: () => ({ functions: [], materials: [], automotive: [] })
  },
  hasActiveFilters: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedFunction',
  'update:selectedMaterial',
  'update:selectedAutomotive',
  'reset'
])
</script>

<template>
  <div class="space-y-3 p-3.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-gunmetal transition-colors">
    <!-- Row 1: Search input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-industrial-slate-gray dark:text-industrial-cool-gray">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        type="search"
        :value="searchQuery"
        @input="emit('update:searchQuery', $event.target.value)"
        placeholder="Cari part, kode, alias, fungsi, material..."
        aria-label="Cari part tooling"
        class="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-offwhite-bg dark:bg-industrial-charcoal text-industrial-charcoal dark:text-industrial-offwhite placeholder-industrial-slate-gray dark:placeholder-industrial-cool-gray focus:outline-none focus:ring-1 focus:ring-industrial-amber focus:border-industrial-amber font-sans"
      />

      <button
        v-if="searchQuery"
        type="button"
        @click="emit('update:searchQuery', '')"
        aria-label="Hapus teks pencarian"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-industrial-slate-gray dark:text-industrial-cool-gray hover:text-industrial-charcoal dark:hover:text-industrial-offwhite"
      >
        &times;
      </button>
    </div>

    <!-- Row 2: Facet selects & Reset -->
    <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 text-xs">
      <!-- Fungsi -->
      <div>
        <label for="filter-function" class="block font-mono text-[11px] text-industrial-slate-gray dark:text-industrial-cool-gray uppercase mb-1">
          Fungsi
        </label>
        <select
          id="filter-function"
          :value="selectedFunction"
          @change="emit('update:selectedFunction', $event.target.value)"
          class="w-full px-2.5 py-1.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-offwhite-bg dark:bg-industrial-charcoal text-industrial-charcoal dark:text-industrial-offwhite focus:outline-none focus:ring-1 focus:ring-industrial-amber"
        >
          <option value="">Semua Fungsi</option>
          <option v-for="f in facets.functions" :key="f" :value="f">{{ f }}</option>
        </select>
      </div>

      <!-- Material -->
      <div>
        <label for="filter-material" class="block font-mono text-[11px] text-industrial-slate-gray dark:text-industrial-cool-gray uppercase mb-1">
          Material
        </label>
        <select
          id="filter-material"
          :value="selectedMaterial"
          @change="emit('update:selectedMaterial', $event.target.value)"
          class="w-full px-2.5 py-1.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-offwhite-bg dark:bg-industrial-charcoal text-industrial-charcoal dark:text-industrial-offwhite focus:outline-none focus:ring-1 focus:ring-industrial-amber"
        >
          <option value="">Semua Material</option>
          <option v-for="m in facets.materials" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <!-- Aplikasi Otomotif -->
      <div>
        <label for="filter-automotive" class="block font-mono text-[11px] text-industrial-slate-gray dark:text-industrial-cool-gray uppercase mb-1">
          Aplikasi Otomotif
        </label>
        <select
          id="filter-automotive"
          :value="selectedAutomotive"
          @change="emit('update:selectedAutomotive', $event.target.value)"
          class="w-full px-2.5 py-1.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-offwhite-bg dark:bg-industrial-charcoal text-industrial-charcoal dark:text-industrial-offwhite focus:outline-none focus:ring-1 focus:ring-industrial-amber"
        >
          <option value="">Semua Aplikasi</option>
          <option v-for="a in facets.automotive" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>

      <!-- Reset button -->
      <div class="sm:col-span-3 lg:col-span-1 flex items-end">
        <button
          type="button"
          v-if="hasActiveFilters"
          @click="emit('reset')"
          class="w-full py-1.5 px-3 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-steel-light dark:bg-industrial-steel-deep text-industrial-charcoal dark:text-industrial-offwhite hover:border-industrial-copper dark:hover:border-industrial-amber text-xs font-mono transition-colors"
        >
          Reset Filter &times;
        </button>
      </div>
    </div>
  </div>
</template>
