<script setup>
import PartCard from './PartCard.vue'

defineProps({
  parts: {
    type: Array,
    required: true
  },
  branchesMap: {
    type: Map,
    default: () => new Map()
  }
})

const emit = defineEmits(['select-part', 'reset'])
</script>

<template>
  <section aria-label="Daftar Part Tooling">
    <!-- Grid if items exist -->
    <div
      v-if="parts.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <PartCard
        v-for="part in parts"
        :key="part.id"
        :part="part"
        :branches-map="branchesMap"
        @select="emit('select-part', $event)"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-16 px-4 text-center border border-dashed border-industrial-steel-soft dark:border-industrial-steel-gray rounded bg-white dark:bg-industrial-gunmetal transition-colors"
    >
      <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-industrial-steel-light dark:bg-industrial-steel-deep text-industrial-slate-gray dark:text-industrial-cool-gray">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-industrial-charcoal dark:text-industrial-offwhite uppercase tracking-wider mb-1">
        Tidak ada part yang cocok
      </h3>
      <p class="text-xs text-industrial-slate-gray dark:text-industrial-cool-gray max-w-sm mx-auto mb-4">
        Coba ubah kata kunci pencarian atau sesuaikan kombinasi filter kategori dan cabang.
      </p>
      <button
        type="button"
        @click="emit('reset')"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-industrial-copper dark:border-industrial-amber bg-industrial-copper dark:bg-industrial-amber text-white dark:text-industrial-charcoal text-xs font-mono font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-amber"
      >
        <span>Reset Semua Filter</span>
      </button>
    </div>
  </section>
</template>
