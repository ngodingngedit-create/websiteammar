<script setup>
defineProps({
  relatedParts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-part'])

const categoryLabels = {
  dies: 'DIES',
  mold: 'MOLD',
  'jig-fixture': 'JIG'
}
</script>

<template>
  <div v-if="relatedParts.length > 0" class="space-y-3">
    <div class="flex items-center justify-between border-b border-industrial-steel-soft dark:border-industrial-steel-gray pb-2">
      <h4 class="font-mono text-xs font-bold text-industrial-slate-gray dark:text-industrial-cool-gray uppercase tracking-wider">
        Part Terkait ({{ relatedParts.length }})
      </h4>
      <span class="text-[10px] font-mono text-industrial-slate-gray dark:text-industrial-cool-gray">
        Relasi 2-Arah
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <button
        v-for="relPart in relatedParts"
        :key="relPart.id"
        type="button"
        @click="emit('select-part', relPart.id)"
        class="group flex flex-col p-2.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-gunmetal hover:border-industrial-copper dark:hover:border-industrial-amber text-left transition-colors focus:outline-none focus:ring-1 focus:ring-industrial-amber"
      >
        <div class="flex items-center justify-between gap-1 mb-1">
          <span class="font-mono text-[10px] text-industrial-slate-gray dark:text-industrial-cool-gray">
            #{{ relPart.id }}
          </span>
          <span
            v-if="relPart.categoryIds?.[0]"
            class="text-[9px] font-mono font-bold px-1 rounded bg-industrial-steel-light dark:bg-industrial-steel-deep text-industrial-slate-gray dark:text-industrial-cool-gray uppercase"
          >
            {{ categoryLabels[relPart.categoryIds[0]] || relPart.categoryIds[0] }}
          </span>
        </div>

        <h5 class="text-xs font-bold text-industrial-charcoal dark:text-industrial-offwhite group-hover:text-industrial-copper dark:group-hover:text-industrial-amber transition-colors line-clamp-1">
          {{ relPart.name }}
        </h5>

        <p class="text-[11px] text-industrial-slate-gray dark:text-industrial-cool-gray line-clamp-1 mt-0.5">
          {{ relPart.summary }}
        </p>
      </button>
    </div>
  </div>
</template>
