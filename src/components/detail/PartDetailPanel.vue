<script setup>
import { onMounted, onUnmounted } from 'vue'
import ModelViewer from './ModelViewer.vue'
import SpecTable from './SpecTable.vue'
import RelatedParts from './RelatedParts.vue'

const props = defineProps({
  part: {
    type: Object,
    default: null
  },
  model: {
    type: Object,
    default: null
  },
  relatedParts: {
    type: Array,
    default: () => []
  },
  branchesMap: {
    type: Map,
    default: () => new Map()
  },
  canGoBack: {
    type: Boolean,
    default: false
  },
  canGoForward: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select-part', 'back', 'forward'])

const categoryLabels = {
  dies: 'DIES',
  mold: 'MOLD',
  'jig-fixture': 'JIG & FIXTURE'
}

function handleKeydown(e) {
  if (e.key === 'Escape' && props.part) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function getBranchName(branchId) {
  return props.branchesMap.get(branchId)?.name || branchId
}
</script>

<template>
  <div>
    <!-- Backdrop overlay on mobile -->
    <div
      v-if="part"
      @click="emit('close')"
      class="fixed inset-0 bg-industrial-charcoal/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
    ></div>

    <!-- Panel Drawer -->
    <aside
      v-if="part"
      class="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[540px] xl:w-[600px] bg-white dark:bg-industrial-gunmetal border-l border-industrial-steel-soft dark:border-industrial-steel-gray shadow-2xl flex flex-col transition-transform transform duration-200 ease-out"
      role="dialog"
      :aria-label="`Detail part ${part.name}`"
      aria-modal="true"
    >
      <!-- Panel Header -->
      <div class="px-5 py-3.5 border-b border-industrial-steel-soft dark:border-industrial-steel-gray flex items-center justify-between gap-3 bg-industrial-steel-light/30 dark:bg-industrial-steel-deep/40">
        <!-- Navigation Back/Forward buttons -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            @click="emit('back')"
            :disabled="!canGoBack"
            title="Kembali ke part sebelumnya"
            aria-label="Kembali ke part sebelumnya"
            class="p-1.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray text-industrial-charcoal dark:text-industrial-offwhite disabled:opacity-30 disabled:cursor-not-allowed hover:border-industrial-copper dark:hover:border-industrial-amber transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            @click="emit('forward')"
            :disabled="!canGoForward"
            title="Maju ke part berikutnya"
            aria-label="Maju ke part berikutnya"
            class="p-1.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray text-industrial-charcoal dark:text-industrial-offwhite disabled:opacity-30 disabled:cursor-not-allowed hover:border-industrial-copper dark:hover:border-industrial-amber transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span class="font-mono text-xs text-industrial-slate-gray dark:text-industrial-cool-gray ml-2">
            #{{ part.id }}
          </span>
        </div>

        <!-- Close button -->
        <button
          type="button"
          @click="emit('close')"
          aria-label="Tutup panel detail"
          class="p-1.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray text-industrial-charcoal dark:text-industrial-offwhite hover:border-industrial-copper dark:hover:border-industrial-amber focus:outline-none focus:ring-1 focus:ring-industrial-amber transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Panel Scrollable Body -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <!-- Title & Badges -->
        <div>
          <div class="flex flex-wrap items-center gap-1.5 mb-2">
            <span
              v-for="cid in part.categoryIds"
              :key="cid"
              class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-steel-light dark:bg-industrial-steel-deep text-industrial-charcoal dark:text-industrial-offwhite"
            >
              {{ categoryLabels[cid] || cid }}
            </span>
            <span
              v-for="f in part.functions"
              :key="f"
              class="px-2 py-0.5 rounded text-[10px] font-mono border border-industrial-copper/30 dark:border-industrial-amber/30 text-industrial-copper dark:text-industrial-amber bg-industrial-copper/5 dark:bg-industrial-amber/5"
            >
              {{ f }}
            </span>
          </div>

          <h2 class="text-xl sm:text-2xl font-bold text-industrial-charcoal dark:text-industrial-offwhite font-sans">
            {{ part.name }}
          </h2>

          <p v-if="part.alias && part.alias.length" class="text-xs font-mono text-industrial-slate-gray dark:text-industrial-cool-gray mt-1">
            Alias: {{ part.alias.join(', ') }}
          </p>

          <div class="flex flex-wrap gap-1 mt-2 text-[11px] font-mono text-industrial-slate-gray dark:text-industrial-cool-gray">
            <span class="text-industrial-charcoal dark:text-industrial-offwhite font-semibold">Cabang:</span>
            <span
              v-for="bid in part.branchIds"
              :key="bid"
              class="after:content-[','] last:after:content-none"
            >
              {{ getBranchName(bid) }}
            </span>
          </div>
        </div>

        <!-- 3D Model Viewer section -->
        <ModelViewer :model="model" :part-name="part.name" />

        <!-- Specifications & Technical details -->
        <SpecTable :part="part" />

        <!-- Related parts section -->
        <RelatedParts
          :related-parts="relatedParts"
          @select-part="emit('select-part', $event)"
        />
      </div>
    </aside>
  </div>
</template>
