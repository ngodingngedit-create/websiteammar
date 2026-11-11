<script setup>
const props = defineProps({
  part: {
    type: Object,
    required: true
  },
  branchesMap: {
    type: Map,
    default: () => new Map()
  }
})

const emit = defineEmits(['select'])

const categoryMeta = {
  dies: {
    label: 'DIES',
    badgeClass: 'bg-industrial-dies-blue/15 text-industrial-dies-blue dark:bg-industrial-dies-blue/25 dark:text-[#88B0CD] border-industrial-dies-blue/30'
  },
  mold: {
    label: 'MOLD',
    badgeClass: 'bg-industrial-mold-green/15 text-industrial-mold-green dark:bg-industrial-mold-green/25 dark:text-[#90B598] border-industrial-mold-green/30'
  },
  'jig-fixture': {
    label: 'JIG & FIXTURE',
    badgeClass: 'bg-industrial-jig-copper/15 text-industrial-jig-copper dark:bg-industrial-jig-copper/25 dark:text-[#D99A61] border-industrial-jig-copper/30'
  }
}

function getBranchName(branchId) {
  const branch = props.branchesMap.get(branchId)
  return branch ? branch.name : branchId
}
</script>

<template>
  <article
    role="button"
    tabindex="0"
    @click="emit('select', part.id)"
    @keydown.enter="emit('select', part.id)"
    @keydown.space.prevent="emit('select', part.id)"
    class="group relative flex flex-col justify-between p-4 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-gunmetal hover:border-industrial-copper dark:hover:border-industrial-amber hover:shadow-md transition-all text-left focus:outline-none focus:ring-2 focus:ring-industrial-amber cursor-pointer"
  >
    <div>
      <!-- Thumbnail Frame -->
      <div class="relative w-full aspect-video rounded overflow-hidden border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-offwhite-bg dark:bg-industrial-charcoal mb-3 flex items-center justify-center">
        <!-- SVG schematic preview icon based on category -->
        <div class="p-4 text-center">
          <svg class="w-12 h-12 mx-auto text-industrial-slate-gray/40 dark:text-industrial-cool-gray/30 group-hover:text-industrial-copper dark:group-hover:text-industrial-amber transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span class="block mt-1 text-[10px] font-mono tracking-wider text-industrial-slate-gray dark:text-industrial-cool-gray uppercase">
            3D PREVIEW
          </span>
        </div>

        <!-- 3D Indicator pill -->
        <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-white/80 dark:bg-industrial-gunmetal/80 text-[10px] font-mono text-industrial-slate-gray dark:text-industrial-cool-gray flex items-center gap-1 backdrop-blur-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-industrial-copper dark:bg-industrial-amber"></span>
          GLB
        </div>
      </div>

      <!-- Categories & ID Header -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="font-mono text-[11px] text-industrial-slate-gray dark:text-industrial-cool-gray">
          #{{ part.id }}
        </span>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="catId in part.categoryIds"
            :key="catId"
            class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase"
            :class="categoryMeta[catId]?.badgeClass"
          >
            {{ categoryMeta[catId]?.label || catId }}
          </span>
        </div>
      </div>

      <!-- Part Name -->
      <h3 class="text-base font-bold text-industrial-charcoal dark:text-industrial-offwhite group-hover:text-industrial-copper dark:group-hover:text-industrial-amber transition-colors font-sans mb-1">
        {{ part.name }}
      </h3>

      <!-- 1 Line Summary -->
      <p class="text-xs text-industrial-slate-gray dark:text-industrial-cool-gray line-clamp-2 leading-relaxed mb-3">
        {{ part.summary }}
      </p>
    </div>

    <!-- Footer: Branch tags & Functions -->
    <div class="space-y-2 border-t border-industrial-steel-soft/60 dark:border-industrial-steel-gray/60 pt-2.5">
      <!-- Branches -->
      <div class="flex flex-wrap gap-1 text-[10px] font-mono text-industrial-slate-gray dark:text-industrial-cool-gray">
        <span
          v-for="branchId in part.branchIds.slice(0, 2)"
          :key="branchId"
          class="px-1.5 py-0.5 rounded bg-industrial-steel-light dark:bg-industrial-steel-deep"
        >
          {{ getBranchName(branchId) }}
        </span>
        <span
          v-if="part.branchIds.length > 2"
          class="px-1 py-0.5 text-industrial-slate-gray dark:text-industrial-cool-gray"
        >
          +{{ part.branchIds.length - 2 }}
        </span>
      </div>

      <!-- Action hint -->
      <div class="flex items-center justify-between text-[11px] font-mono pt-1 text-industrial-copper dark:text-industrial-amber">
        <span>Buka spesifikasi</span>
        <span class="transform group-hover:translate-x-0.5 transition-transform">&rarr;</span>
      </div>
    </div>
  </article>
</template>
