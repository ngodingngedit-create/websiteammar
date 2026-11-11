<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    default: null
  },
  partName: {
    type: String,
    default: ''
  }
})

const viewerRef = ref(null)
const hasError = ref(false)
const isLoading = ref(true)
const prefersReducedMotion = ref(false)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function resetCamera() {
  if (viewerRef.value && typeof viewerRef.value.resetTurntable === 'function') {
    viewerRef.value.resetTurntable()
  } else if (viewerRef.value) {
    viewerRef.value.cameraOrbit = '0deg 75deg 105%'
    viewerRef.value.fieldOfView = 'auto'
  }
}

function handleLoad() {
  isLoading.value = false
  hasError.value = false
}

function handleError() {
  isLoading.value = false
  hasError.value = true
}
</script>

<template>
  <div class="space-y-2">
    <!-- 3D Canvas Box -->
    <div class="relative w-full aspect-[4/3] rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-offwhite-bg dark:bg-industrial-charcoal overflow-hidden flex items-center justify-center">
      <!-- Loading indicator -->
      <div
        v-if="isLoading && !hasError && model"
        class="absolute inset-0 flex items-center justify-center bg-industrial-offwhite-bg/80 dark:bg-industrial-charcoal/80 z-10 font-mono text-xs text-industrial-slate-gray dark:text-industrial-cool-gray"
      >
        <span class="animate-pulse">MEMUAT MODEL 3D...</span>
      </div>

      <!-- model-viewer element -->
      <model-viewer
        v-if="model && !hasError"
        ref="viewerRef"
        :src="model.file"
        :alt="`Model 3D ${partName}`"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        exposure="1"
        loading="lazy"
        :auto-rotate="!prefersReducedMotion"
        auto-rotate-delay="1000"
        rotation-per-second="15deg"
        @load="handleLoad"
        @error="handleError"
        class="w-full h-full"
      >
      </model-viewer>

      <!-- Fallback Error or Missing Model -->
      <div
        v-if="hasError || !model"
        class="text-center p-6 space-y-2 max-w-xs"
      >
        <div class="w-10 h-10 mx-auto rounded border border-industrial-steel-soft dark:border-industrial-steel-gray flex items-center justify-center text-industrial-copper dark:text-industrial-amber">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-xs font-mono font-semibold text-industrial-charcoal dark:text-industrial-offwhite">
          {{ hasError ? 'Model 3D Tidak Dapat Dimuat' : 'Model 3D Belum Tersedia' }}
        </p>
        <p class="text-[11px] text-industrial-slate-gray dark:text-industrial-cool-gray">
          Aset GLB lokal sedang disiapkan atau perangkat tidak mendukung WebGL.
        </p>
      </div>

      <!-- Overlay Controls -->
      <div v-if="model && !hasError" class="absolute bottom-2 right-2 flex items-center gap-1.5 z-20">
        <button
          type="button"
          @click="resetCamera"
          title="Reset Sudut Pandang Kamera"
          class="px-2 py-1 text-[10px] font-mono rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-white/90 dark:bg-industrial-gunmetal/90 text-industrial-charcoal dark:text-industrial-offwhite hover:border-industrial-copper dark:hover:border-industrial-amber backdrop-blur-sm transition-colors"
        >
          Reset Kamera
        </button>
      </div>

      <!-- Placeholder Badge -->
      <div
        v-if="model?.isPlaceholder"
        class="absolute top-2 left-2 px-2 py-0.5 rounded border border-industrial-amber/40 bg-industrial-amber/15 text-industrial-copper dark:text-industrial-amber text-[10px] font-mono font-bold tracking-wide backdrop-blur-sm"
      >
        Model Ilustrasi
      </div>
    </div>

    <!-- Attribution Card -->
    <div
      v-if="model"
      class="p-2.5 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-steel-light/40 dark:bg-industrial-steel-deep/40 text-[11px] font-mono space-y-1"
    >
      <div class="flex items-center justify-between text-industrial-slate-gray dark:text-industrial-cool-gray">
        <span>LISENSI: <span class="text-industrial-charcoal dark:text-industrial-offwhite font-bold">{{ model.license }}</span></span>
        <span v-if="model.author">KREATOR: <span class="text-industrial-charcoal dark:text-industrial-offwhite">{{ model.author }}</span></span>
      </div>
      <div class="text-industrial-slate-gray dark:text-industrial-cool-gray flex items-center justify-between gap-2">
        <span class="truncate">{{ model.attributionText || model.source }}</span>
        <a
          v-if="model.sourceUrl && model.sourceUrl !== '#'"
          :href="model.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-industrial-copper dark:text-industrial-amber underline whitespace-nowrap"
        >
          Sumber &rarr;
        </a>
      </div>
    </div>
  </div>
</template>
