<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategory: {
    type: String,
    required: true
  },
  categoryCounts: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select'])

const tabs = [
  { id: 'landing', name: 'Ringkasan Assembly' },
  { id: 'all', name: 'Semua Part' },
  { id: 'dies', name: 'Dies' },
  { id: 'mold', name: 'Mold' },
  { id: 'jig-fixture', name: 'Jig & Fixture' }
]
</script>

<template>
  <nav class="flex items-center space-x-1 sm:space-x-2 border-b border-industrial-steel-soft dark:border-industrial-steel-gray overflow-x-auto pb-1" aria-label="Kategori Tooling">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      @click="emit('select', tab.id)"
      :aria-selected="selectedCategory === tab.id"
      class="group relative flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-amber rounded-t"
      :class="[
        selectedCategory === tab.id
          ? 'text-industrial-copper dark:text-industrial-amber border-b-2 border-industrial-copper dark:border-industrial-amber -mb-px bg-industrial-steel-light/50 dark:bg-industrial-steel-deep/40'
          : 'text-industrial-slate-gray dark:text-industrial-cool-gray hover:text-industrial-charcoal dark:hover:text-industrial-offwhite hover:bg-industrial-steel-light/30 dark:hover:bg-industrial-steel-deep/20'
      ]"
    >
      <span>{{ tab.name }}</span>
      <span
        v-if="tab.id !== 'landing'"
        class="text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors"
        :class="[
          selectedCategory === tab.id
            ? 'border-industrial-copper/40 dark:border-industrial-amber/40 bg-industrial-copper/10 dark:bg-industrial-amber/10 text-industrial-copper dark:text-industrial-amber'
            : 'border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-steel-deep text-industrial-slate-gray dark:text-industrial-cool-gray'
        ]"
      >
        {{ categoryCounts[tab.id] ?? 0 }}
      </span>
    </button>
  </nav>
</template>
