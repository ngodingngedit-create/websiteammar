<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  categoryCounts: {
    type: Object,
    default: () => ({})
  },
  branches: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selectCategory'])

const prefersReducedMotion = ref(false)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function getBranchCount(catId) {
  return props.branches.filter(b => b.categoryId === catId).length
}

function getBadgeColor(catId) {
  switch (catId) {
    case 'dies':
      return 'border-[#55748A]/60 text-[#8BB1CE] bg-[#55748A]/15'
    case 'mold':
      return 'border-[#617967]/60 text-[#96C2A0] bg-[#617967]/15'
    case 'jig-fixture':
      return 'border-[#A77344]/60 text-[#DFAC7E] bg-[#A77344]/15'
    default:
      return 'border-industrial-amber/60 text-industrial-amber bg-industrial-amber/10'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="text-center max-w-3xl mx-auto space-y-2.5 pt-2 pb-1">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded border border-industrial-amber/40 bg-industrial-steel-light dark:bg-industrial-steel-deep text-xs font-mono tracking-widest text-industrial-copper dark:text-industrial-amber uppercase">
        <span class="w-2 h-2 rounded-full bg-industrial-amber animate-pulse"></span>
        TOOLING ASSEMBLY SYSTEMS &bull; LIVE 3D
      </div>
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-industrial-charcoal dark:text-industrial-offwhite font-sans">
        Pilih 1 Set Assembly Komponen
      </h2>
      <p class="text-sm sm:text-base text-industrial-slate-gray dark:text-industrial-cool-gray">
        Jelajahi arsitektur 3 kategori utama tooling manufaktur otomotif. Model 3D di bawah interaktif (dapat diputar dan diperbesar). Klik salah satu kartu untuk menjelajahi cabang dan komponen penyusunnya.
      </p>
    </div>

    <!-- 3 Assembly Sets Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pt-2">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="group rounded-lg border-2 border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-gunmetal hover:border-industrial-amber dark:hover:border-industrial-amber transition-all duration-200 flex flex-col overflow-hidden shadow-sm hover:shadow-xl"
      >
        <!-- 3D Interactive Model Viewer Container -->
        <div class="relative w-full aspect-[4/3] bg-industrial-charcoal overflow-hidden border-b border-industrial-steel-soft dark:border-industrial-steel-gray">
          <model-viewer
            :src="cat.modelFile"
            :poster="cat.poster"
            :alt="`${cat.name} 3D Assembly Model`"
            camera-controls
            touch-action="pan-y"
            shadow-intensity="1.2"
            exposure="1.05"
            loading="eager"
            :auto-rotate="!prefersReducedMotion"
            auto-rotate-delay="1000"
            rotation-per-second="18deg"
            camera-orbit="25deg 75deg 105%"
            class="w-full h-full cursor-grab active:cursor-grabbing"
          >
          </model-viewer>

          <!-- Category Badge overlay -->
          <div class="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
            <span
              class="px-2.5 py-1 text-xs font-mono font-bold tracking-wider rounded border uppercase backdrop-blur-sm"
              :class="getBadgeColor(cat.id)"
            >
              {{ cat.name }}
            </span>
          </div>

          <!-- Interaction hint badge overlay -->
          <div class="absolute top-3 right-3 pointer-events-none px-2 py-0.5 rounded bg-industrial-charcoal/85 border border-industrial-steel-gray text-[10px] font-mono text-industrial-amber backdrop-blur-sm flex items-center gap-1.5">
            <svg class="w-3 h-3 animate-spin text-industrial-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>DRAG &bull; ROTATE 3D</span>
          </div>

          <!-- Subtitle hint bar overlay -->
          <div class="absolute inset-x-0 bottom-0 pointer-events-none p-2.5 bg-gradient-to-t from-industrial-charcoal via-industrial-charcoal/80 to-transparent flex items-center justify-between text-xs font-mono text-industrial-offwhite">
            <span class="text-industrial-cool-gray text-[11px] truncate max-w-[70%]">{{ cat.subtitle }}</span>
            <span class="text-industrial-amber text-[10px] font-semibold">1:1 SCALE</span>
          </div>
        </div>

        <!-- Card Body Content -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-industrial-charcoal dark:text-industrial-offwhite group-hover:text-industrial-amber transition-colors font-sans tracking-tight">
                {{ cat.name }}
              </h3>
              <div class="flex items-center gap-2 text-xs font-mono text-industrial-slate-gray dark:text-industrial-cool-gray">
                <span class="px-2 py-0.5 rounded bg-industrial-steel-light dark:bg-industrial-steel-deep font-semibold text-industrial-charcoal dark:text-industrial-offwhite">
                  {{ getBranchCount(cat.id) }} Cabang
                </span>
                <span class="px-2 py-0.5 rounded bg-industrial-steel-light dark:bg-industrial-steel-deep font-semibold text-industrial-copper dark:text-industrial-amber">
                  {{ categoryCounts[cat.id] || 0 }} Part
                </span>
              </div>
            </div>

            <p class="text-xs sm:text-sm text-industrial-slate-gray dark:text-industrial-cool-gray line-clamp-3 leading-relaxed">
              {{ cat.summary }}
            </p>
          </div>

          <!-- Highlights -->
          <div v-if="cat.highlights" class="pt-3 border-t border-industrial-steel-soft dark:border-industrial-steel-gray/60">
            <div class="text-[11px] font-mono uppercase tracking-wider text-industrial-slate-gray dark:text-industrial-cool-gray mb-1.5">
              Komponen Kunci:
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="item in cat.highlights"
                :key="item"
                class="px-2 py-0.5 text-[11px] font-mono rounded bg-industrial-steel-light dark:bg-industrial-steel-deep text-industrial-charcoal dark:text-industrial-offwhite border border-industrial-steel-soft dark:border-industrial-steel-gray"
              >
                {{ item }}
              </span>
            </div>
          </div>

          <!-- Action Button to Drilldown -->
          <button
            type="button"
            @click="emit('selectCategory', cat.id)"
            class="w-full mt-2 py-2.5 px-3 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-steel-light dark:bg-industrial-steel-deep hover:bg-industrial-amber hover:border-industrial-amber hover:text-industrial-charcoal dark:hover:bg-industrial-amber dark:hover:text-industrial-charcoal text-industrial-charcoal dark:text-industrial-offwhite font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Buka Cabang &amp; Komponen {{ cat.name }}</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
