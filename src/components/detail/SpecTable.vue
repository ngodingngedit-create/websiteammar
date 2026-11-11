<script setup>
defineProps({
  part: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="space-y-6 text-xs sm:text-sm font-sans">
    <!-- Deskripsi & Cara Kerja -->
    <section class="space-y-3">
      <div>
        <h4 class="font-mono text-xs font-bold text-industrial-slate-gray dark:text-industrial-cool-gray uppercase tracking-wider mb-1">
          Deskripsi Komponen
        </h4>
        <p class="text-industrial-charcoal dark:text-industrial-offwhite leading-relaxed">
          {{ part.description }}
        </p>
      </div>

      <div v-if="part.howItWorks">
        <h4 class="font-mono text-xs font-bold text-industrial-slate-gray dark:text-industrial-cool-gray uppercase tracking-wider mb-1">
          Prinsip Kerja
        </h4>
        <p class="text-industrial-charcoal dark:text-industrial-offwhite leading-relaxed">
          {{ part.howItWorks }}
        </p>
      </div>
    </section>

    <!-- Tabel Spesifikasi Teknis -->
    <section v-if="part.specs && part.specs.length > 0">
      <h4 class="font-mono text-xs font-bold text-industrial-slate-gray dark:text-industrial-cool-gray uppercase tracking-wider mb-2">
        Spesifikasi Rekayasa (Tipikal)
      </h4>
      <div class="border border-industrial-steel-soft dark:border-industrial-steel-gray rounded overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-industrial-steel-light dark:bg-industrial-steel-deep font-mono text-[11px] text-industrial-slate-gray dark:text-industrial-cool-gray border-b border-industrial-steel-soft dark:border-industrial-steel-gray">
              <th class="py-2 px-3 font-semibold uppercase">Parameter</th>
              <th class="py-2 px-3 font-semibold uppercase text-right">Nilai / Keterangan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-industrial-steel-soft dark:divide-industrial-steel-gray font-mono text-xs">
            <tr
              v-for="(spec, idx) in part.specs"
              :key="idx"
              class="hover:bg-industrial-steel-light/30 dark:hover:bg-industrial-steel-deep/30 transition-colors"
            >
              <td class="py-2 px-3 text-industrial-slate-gray dark:text-industrial-cool-gray font-medium">
                {{ spec.label }}
              </td>
              <td class="py-2 px-3 text-industrial-charcoal dark:text-industrial-offwhite text-right">
                {{ spec.value }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-[10px] font-mono text-industrial-slate-gray dark:text-industrial-cool-gray mt-1.5 italic">
        * Nilai spesifikasi bersifat tipikal untuk acuan desain awal.
      </p>
    </section>

    <!-- Material & Aplikasi -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <!-- Material Umum -->
      <section v-if="part.materials && part.materials.length > 0">
        <h4 class="font-mono text-xs font-bold text-industrial-slate-gray dark:text-industrial-cool-gray uppercase tracking-wider mb-2">
          Material Umum
        </h4>
        <ul class="space-y-1.5">
          <li
            v-for="(mat, idx) in part.materials"
            :key="idx"
            class="flex items-center gap-2 font-mono text-xs text-industrial-charcoal dark:text-industrial-offwhite"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-industrial-copper dark:bg-industrial-amber"></span>
            <span>{{ mat }}</span>
          </li>
        </ul>
      </section>

      <!-- Aplikasi Komponen Otomotif -->
      <section v-if="part.automotiveUse && part.automotiveUse.length > 0">
        <h4 class="font-mono text-xs font-bold text-industrial-slate-gray dark:text-industrial-cool-gray uppercase tracking-wider mb-2">
          Aplikasi Otomotif
        </h4>
        <ul class="space-y-1.5">
          <li
            v-for="(use, idx) in part.automotiveUse"
            :key="idx"
            class="flex items-start gap-2 text-xs text-industrial-charcoal dark:text-industrial-offwhite"
          >
            <span class="text-industrial-copper dark:text-industrial-amber font-mono">&bull;</span>
            <span>{{ use }}</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- Common Issues & Maintenance -->
    <section v-if="part.commonIssues && part.commonIssues.length > 0" class="p-3 rounded border border-industrial-steel-soft dark:border-industrial-steel-gray bg-industrial-steel-light/30 dark:bg-industrial-steel-deep/20">
      <h4 class="font-mono text-xs font-bold text-industrial-slate-gray dark:text-industrial-cool-gray uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <span class="w-2 h-2 rounded bg-amber-500"></span>
        Failure Mode &amp; Isu Umum
      </h4>
      <ul class="space-y-1 text-xs text-industrial-charcoal dark:text-industrial-offwhite">
        <li
          v-for="(issue, idx) in part.commonIssues"
          :key="idx"
          class="flex items-start gap-2"
        >
          <span class="text-industrial-slate-gray dark:text-industrial-cool-gray font-mono">-</span>
          <span>{{ issue }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
