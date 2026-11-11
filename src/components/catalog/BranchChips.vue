<script setup>
defineProps({
  branches: {
    type: Array,
    required: true
  },
  selectedBranches: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['toggle', 'clear'])
</script>

<template>
  <div v-if="branches.length" class="flex flex-wrap items-center gap-1.5 py-1">
    <span class="text-xs font-mono font-medium text-industrial-slate-gray dark:text-industrial-cool-gray mr-1 uppercase tracking-wider">
      Cabang:
    </span>

    <button
      v-for="branch in branches"
      :key="branch.id"
      type="button"
      @click="emit('toggle', branch.id)"
      :aria-pressed="selectedBranches.includes(branch.id)"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border transition-colors focus:outline-none focus:ring-1 focus:ring-industrial-amber"
      :class="[
        selectedBranches.includes(branch.id)
          ? 'bg-industrial-copper dark:bg-industrial-amber text-white dark:text-industrial-charcoal border-industrial-copper dark:border-industrial-amber font-semibold shadow-sm'
          : 'bg-white dark:bg-industrial-gunmetal border-industrial-steel-soft dark:border-industrial-steel-gray text-industrial-charcoal dark:text-industrial-offwhite hover:border-industrial-copper/60 dark:hover:border-industrial-amber/60'
      ]"
    >
      <span>{{ branch.name }}</span>
      <span
        v-if="selectedBranches.includes(branch.id)"
        class="text-[10px] leading-none opacity-80"
      >&times;</span>
    </button>

    <button
      v-if="selectedBranches.length > 0"
      type="button"
      @click="emit('clear')"
      class="text-xs font-mono text-industrial-slate-gray dark:text-industrial-cool-gray hover:text-industrial-copper dark:hover:text-industrial-amber underline ml-2 py-1"
    >
      Reset cabang
    </button>
  </div>
</template>
