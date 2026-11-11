<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  totalParts: {
    type: Number,
    default: 0
  },
  filteredCount: {
    type: Number,
    default: 0
  }
})

const isDark = ref(true)
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
const deferredPrompt = ref(null)
const canInstall = ref(false)

function initTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

async function installPwa() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    canInstall.value = false
  }
  deferredPrompt.value = null
}

onMounted(() => {
  initTheme()
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    canInstall.value = false
    deferredPrompt.value = null
  })
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<template>
  <header class="border-b border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-gunmetal transition-colors sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Title & Branding -->
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 flex items-center justify-center rounded border border-industrial-amber/40 bg-industrial-steel-light dark:bg-industrial-steel-deep text-industrial-copper dark:text-industrial-amber font-mono font-bold text-sm tracking-wider">
          TL
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold tracking-tight text-industrial-charcoal dark:text-industrial-offwhite flex items-center gap-2 font-sans">
            KATALOG TOOLING OTOMOTIF
          </h1>
          <p class="text-xs font-mono text-industrial-slate-gray dark:text-industrial-cool-gray tracking-wide">
            Dies &bull; Mold &bull; Jig &amp; Fixture
          </p>
        </div>
      </div>

      <!-- Quick stats, PWA controls & Theme Toggle -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Online/Offline Badge -->
        <div
          class="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border text-[11px] font-mono tracking-tight"
          :class="isOnline ? 'border-industrial-steel-soft dark:border-industrial-steel-gray text-industrial-slate-gray dark:text-industrial-cool-gray bg-industrial-steel-light/40 dark:bg-industrial-steel-deep/40' : 'border-amber-600/50 bg-amber-500/10 text-industrial-amber font-medium'"
          :title="isOnline ? 'Terhubung ke jaringan' : 'Mode Offline Aktif (Cache PWA)'"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="isOnline ? 'bg-emerald-500' : 'bg-industrial-amber animate-pulse'"
          ></span>
          <span class="hidden sm:inline">{{ isOnline ? 'ONLINE' : 'OFFLINE MODE' }}</span>
        </div>

        <!-- Part Count -->
        <div class="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-steel-light/60 dark:bg-industrial-steel-deep text-xs font-mono text-industrial-slate-gray dark:text-industrial-cool-gray">
          <span>PART:</span>
          <span class="font-semibold text-industrial-charcoal dark:text-industrial-offwhite">{{ filteredCount }}</span>
          <span v-if="filteredCount !== totalParts" class="text-industrial-slate-gray dark:text-industrial-cool-gray">/ {{ totalParts }}</span>
        </div>

        <!-- Install PWA Button -->
        <button
          v-if="canInstall"
          type="button"
          @click="installPwa"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-industrial-amber bg-industrial-amber/10 hover:bg-industrial-amber/20 text-industrial-copper dark:text-industrial-amber text-xs font-mono font-medium transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">INSTALL</span>
        </button>

        <!-- Theme Toggle Button -->
        <button
          type="button"
          @click="toggleTheme"
          :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'"
          class="inline-flex items-center justify-center p-2 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-white dark:bg-industrial-steel-deep text-industrial-charcoal dark:text-industrial-offwhite hover:border-industrial-copper dark:hover:border-industrial-amber transition-colors focus:outline-none focus:ring-2 focus:ring-industrial-amber"
        >
          <!-- Sun Icon (when dark) -->
          <svg v-if="isDark" class="w-4 h-4 text-industrial-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- Moon Icon (when light) -->
          <svg v-else class="w-4 h-4 text-industrial-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
