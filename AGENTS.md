# AGENTS.md — Katalog Part Tooling Manufaktur Otomotif

Panduan untuk AI agent / developer yang membangun website **Katalog Part Tooling Otomotif**: satu halaman yang menampilkan part dari tiga kategori utama (**Dies**, **Mold**, **Jig & Fixture**), lengkap dengan model 3D, detail, dan relasi antar part.

---

## 1. Tujuan Produk

- Satu halaman (single page) untuk menjelajahi part tooling industri manufaktur otomotif.
- Tiga kategori utama: **DIES** (stamping), **MOLD** (cetakan plastik/die casting), **JIG & FIXTURE** (alat bantu pegang/posisi/cek).
- Tiap kategori punya banyak **cabang** (tipe tooling), tiap cabang punya banyak **part** (komponen).
- Setiap part punya: model 3D interaktif, deskripsi, fungsi, material, spesifikasi umum, aplikasi otomotif, dan **part terkait** (bisa lintas cabang dan lintas kategori).
- Target pengguna: mahasiswa teknik, engineer tooling, purchasing, dan teknisi produksi.

## 2. Tech Stack (Wajib: Static Website)

- **Vue.js 3** menggunakan Composition API (`<script setup>`) dan **JavaScript biasa**, tanpa TypeScript.
- **Tailwind CSS** untuk seluruh styling dan implementasi design tokens industrial.
- **Vite** hanya sebagai development server dan build tool untuk menghasilkan file HTML/CSS/JavaScript statis.
- **Tidak menggunakan backend, database, server aplikasi, CMS, API eksternal, maupun autentikasi.** Jangan memasang atau mengonfigurasi Supabase, Firebase, MySQL, PostgreSQL, Express, Laravel, atau layanan sejenis.
- **Tidak membutuhkan Vue Router atau Pinia.** Gunakan `ref`, `computed`, dan composable Vue untuk state UI; gunakan URL hash serta event `hashchange` bawaan browser untuk deep link `#/part/<id>` pada halaman tunggal.
- `@google/model-viewer` diperbolehkan sebagai **web component khusus viewer 3D `.glb`**, bukan framework/backend tambahan.
- **Seluruh data katalog berasal dari file JSON lokal** di `src/data/` dan diimpor pada build. Model 3D, poster, dan aset lain disimpan secara lokal di `public/`.
- Deploy sebagai **static site** (mis. Vercel, Netlify, GitHub Pages, atau Cloudflare Pages); folder `dist/` harus dapat disajikan oleh static hosting tanpa server runtime.

### 2.1 Prinsip Arsitektur Static

- Aplikasi adalah **single-page catalog** yang berjalan sepenuhnya di browser setelah aset statis dimuat.
- Pencarian, filter, relasi part, navigasi detail, dan mode terang/gelap diproses **di sisi klien**, tanpa request ke database atau endpoint API.
- Data katalog bersifat **read-only** bagi pengguna situs. Untuk menambah/mengubah part, edit file JSON di repository lalu **build dan deploy ulang**; tidak perlu dashboard admin atau CRUD.
- Preferensi tema boleh disimpan di `localStorage` jika diperlukan, tetapi **jangan gunakan localStorage sebagai database katalog**.
- Jangan membuat endpoint `/api`, server-side rendering, serverless functions, ataupun konfigurasi environment yang mensyaratkan secret.
- Website tetap dapat menampilkan katalog tanpa koneksi internet setelah seluruh aset berhasil diunduh, selama tidak mengandalkan aset eksternal. Gunakan font yang di-bundle secara lokal jika perlu untuk pengalaman yang konsisten.

## 3. Struktur Folder

```text
/
├─ AGENTS.md
├─ index.html
├─ package.json
├─ vite.config.js
├─ public/
│  ├─ models/                 # model 3D .glb lokal
│  └─ posters/                # gambar/poster part lokal
├─ src/
│  ├─ assets/
│  │  └─ styles.css           # Tailwind + design tokens industrial
│  ├─ components/
│  │  ├─ layout/              # Header, Footer, SidebarFilter
│  │  ├─ catalog/             # CategoryTabs, BranchChips, PartGrid, PartCard
│  │  ├─ detail/              # PartDetailPanel, ModelViewer, SpecTable, RelatedParts
│  │  └─ common/              # SearchBar, Badge, EmptyState, Skeleton
│  ├─ composables/
│  │  └─ useCatalog.js        # state lokal kategori, part, pencarian, filter
│  ├─ data/
│  │  ├─ categories.json
│  │  ├─ branches.json
│  │  ├─ parts.json
│  │  └─ models.json          # metadata + lisensi model 3D
│  ├─ utils/
│  │  ├─ relations.js         # resolver relasi dua arah
│  │  └─ catalog.js           # filter, pencarian, helper katalog
│  ├─ App.vue
│  └─ main.js
├─ scripts/
│  └─ validate-data.js        # validasi referensi antar file JSON
└─ docs/
   └─ MODEL_SOURCES.md        # daftar sumber + atribusi model 3D
```

## 4. Layout Halaman (satu halaman)

Urutan dari atas ke bawah:

1. **Header**: logo, judul, `SearchBar` (cari nama part, fungsi, material).
2. **Category Tabs**: `Semua | Dies | Mold | Jig & Fixture` (dengan jumlah part).
3. **Branch Chips**: cabang dari kategori aktif (contoh Dies: Blanking, Piercing, Bending, Drawing, Progressive, Transfer). Bisa multi-select.
4. **Filter tambahan**: material, fungsi (Pembentuk, Pemandu, Penjepit, Pengeluar, Pendingin, Pengukur), aplikasi otomotif (Body panel, Bumper, Interior, Engine, Chassis).
5. **Part Grid**: kartu part (thumbnail 3D/poster, nama, kategori, cabang, 1 baris ringkasan).
6. **Part Detail Panel** (drawer kanan di desktop, bottom sheet di mobile) saat kartu diklik:
   - Model 3D interaktif (rotate, zoom, auto-rotate, tombol reset)
   - Nama, kategori, cabang, badge fungsi
   - Deskripsi lengkap, cara kerja, material umum, perawatan/failure mode umum
   - Tabel spesifikasi
   - Contoh aplikasi pada komponen otomotif
   - **Part Terkait**: kartu kecil yang bisa diklik untuk pindah ke part tersebut tanpa menutup panel
   - Atribusi model 3D (wajib, lihat bagian 7)
7. **Footer**: sumber data, lisensi, disclaimer.

Aturan UX:
- Semua part dari 3 kategori harus bisa terlihat di satu halaman (tab "Semua" = default).
- Klik part terkait mengganti detail panel, menambah item ke riwayat (tombol Back/Forward kecil di panel), dan memperbarui URL hash `#/part/<id>`.
- Hover di PartCard menampilkan nama cabang lain yang terhubung.
- Responsif: mobile (1 kolom), tablet (2 kolom), desktop (3–4 kolom).
- Aksesibel: fokus keyboard, `aria-label`, kontras cukup, `prefers-reduced-motion` mematikan auto-rotate.

## 5. Skema Data JSON Lokal

**Tidak perlu file TypeScript, ORM, tabel database, maupun endpoint API.** Gunakan empat file JSON lokal sebagai sumber data katalog. Berikut kontrak struktur data yang harus dipertahankan pada objek di masing-masing file:

| File | Field yang wajib | Field opsional / catatan |
| --- | --- | --- |
| `categories.json` | `id`, `name`, `summary` | `id`: `dies`, `mold`, atau `jig-fixture` |
| `branches.json` | `id`, `categoryId`, `name`, `summary` | `categoryId` harus merujuk kategori yang ada |
| `parts.json` | `id`, `name`, `categoryIds`, `branchIds`, `functions`, `summary`, `description`, `howItWorks`, `materials`, `specs`, `automotiveUse`, `commonIssues`, `related`, `modelId` | `alias` opsional (array string); `specs` array objek `{ "label": "...", "value": "..." }` |
| `models.json` | `id`, `file`, `source`, `sourceUrl`, `author`, `license`, `attributionText`, `isPlaceholder` | `poster` opsional; `file` adalah path lokal, mis. `/models/punch.glb` |

Bentuk field:
- `id`, `name`, `summary`, `description`, `howItWorks`, `modelId`, `source`, `sourceUrl`, `author`, `attributionText`, dan `file` bertipe string.
- `categoryIds`, `branchIds`, `functions`, `materials`, `automotiveUse`, `commonIssues`, `related`, dan `alias` adalah array string.
- `specs` adalah array objek dengan `label` dan `value` string; `isPlaceholder` adalah boolean.
- Lisensi model yang diizinkan pada metadata: `CC0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `Public Domain`, `Apache-2.0`, atau `MIT`, **dengan pengecekan ketentuan setiap aset**.

Aturan data:
- `related` ditulis satu arah di JSON; `src/utils/relations.js` membuat relasi **dua arah** otomatis dan menghapus duplikat saat aplikasi berjalan di browser.
- Part yang dipakai di banyak kategori (contoh: *Guide Pin & Bushing*, *Locating Pin*, *Spring*) ditulis **sekali** dengan banyak `categoryIds`/`branchIds`, bukan diduplikasi.
- ID harus kebab-case, stabil, dan unik.
- Impor JSON secara lokal melalui JavaScript (contoh: `import parts from './data/parts.json'`), tanpa `fetch` ke layanan atau database eksternal.

## 6. Konten Awal (Seed Data)

Agent wajib membuat data awal berikut (boleh ditambah). Setiap part harus punya `description`, `howItWorks`, `materials`, `specs`, `automotiveUse`, `commonIssues`, dan `related` yang terisi. Jangan mengarang angka presisi; gunakan rentang umum dan tulis "tipikal" bila perlu.

### 6.1 DIES (Stamping Die — pembentukan pelat logam)

Cabang:
- **Blanking Die**: memotong kontur luar dari pelat (contoh: blank panel pintu).
- **Piercing Die**: melubangi pelat (contoh: lubang baut pada bracket).
- **Bending / Flanging Die**: menekuk atau membentuk flens (contoh: flens pintu).
- **Drawing Die**: menarik pelat jadi bentuk cekung (contoh: fender, oil pan).
- **Forming Die**: membentuk kontur 3D/emboss/coining.
- **Trimming Die**: memotong sisa material setelah drawing.
- **Progressive Die**: banyak stasiun dalam satu die, strip bergerak per langkah (bracket, terminal).
- **Transfer Die**: banyak die terpisah, part dipindahkan oleh transfer finger (panel besar).

Part minimal:
`punch`, `die-block-insert`, `die-set-upper-lower`, `stripper-plate`, `blank-holder-binder`, `guide-pin-bushing`, `die-spring`, `nitrogen-gas-spring`, `pilot-pin`, `stopper-gauge-block`, `cam-unit`, `lifter-pad`, `strip-guide`, `wear-plate`, `shim`.

### 6.2 MOLD (Cetakan: injection mold plastik & die casting aluminium)

Cabang:
- **Two-Plate Mold**: konfigurasi paling umum, satu bidang pisah (parting line).
- **Three-Plate Mold**: runner terpisah dari part, gate pin-point.
- **Hot Runner Mold**: runner dipanaskan, tanpa sisa runner (bumper, panel instrumen).
- **Slide / Lifter Mold**: untuk undercut (clip, snap-fit interior).
- **Die Casting Mold**: aluminium bertekanan tinggi (rumah transmisi, bracket mesin).

Part minimal:
`cavity`, `core`, `mold-base`, `sprue-bushing`, `locating-ring`, `runner-gate`, `ejector-pin`, `ejector-plate`, `return-pin`, `guide-pillar-bushing`, `cooling-channel`, `slide-core`, `angled-lifter`, `hot-runner-manifold`, `hot-runner-nozzle`, `vent`.

### 6.3 JIG & FIXTURE (Alat bantu produksi & inspeksi)

Cabang:
- **Welding Jig**: memposisikan dan menahan panel saat pengelasan body-in-white.
- **Assembly Jig**: perakitan komponen (dashboard, wiring harness board).
- **Drilling Jig**: memandu mata bor lewat drill bushing.
- **Machining Fixture**: penahan benda kerja di CNC (blok mesin, head, knuckle).
- **Checking Fixture (Gauge)**: pengecekan dimensi part pres/plastik.
- **Inspection / CMM Fixture**: dudukan untuk pengukuran CMM.

Part minimal:
`base-plate`, `locating-pin-round`, `locating-pin-diamond`, `v-block`, `support-pad-rest-button`, `toggle-clamp`, `swing-clamp`, `hydraulic-clamp`, `drill-bushing`, `clamping-strap`, `go-no-go-gauge-pin`, `contour-gauge-profile-block`, `quick-change-plate`, `fixture-key-tenon`.

### 6.4 Contoh Relasi Lintas Cabang/Kategori

- `punch` ↔ `die-block-insert`, `stripper-plate`, `guide-pin-bushing`, `pilot-pin`
- `cavity` ↔ `core`, `ejector-pin`, `cooling-channel`, `vent`, `runner-gate`
- `guide-pin-bushing` ↔ `die-set-upper-lower`, `guide-pillar-bushing`, `drill-bushing` (konsep pemandu presisi serupa, lintas kategori)
- `die-spring` ↔ `nitrogen-gas-spring`, `stripper-plate`, `blank-holder-binder`
- `locating-pin-round` ↔ `locating-pin-diamond`, `base-plate`, `support-pad-rest-button`, `pilot-pin`
- `toggle-clamp` ↔ `swing-clamp`, `hydraulic-clamp`, `clamping-strap`
- `slide-core` ↔ `angled-lifter`, `cam-unit` (mekanisme gerak samping serupa antara mold dan die)
- `hot-runner-manifold` ↔ `hot-runner-nozzle`, `runner-gate`, `sprue-bushing`
- `checking-fixture` part (`go-no-go-gauge-pin`, `contour-gauge-profile-block`) ↔ hasil dari `die-block-insert` dan `cavity` (verifikasi part)

### 6.5 Contoh Entri Lengkap (acuan gaya penulisan)

```json
{
  "id": "punch",
  "name": "Punch",
  "alias": ["Pons", "Piercing punch"],
  "categoryIds": ["dies"],
  "branchIds": ["dies-piercing", "dies-blanking", "dies-progressive"],
  "functions": ["Pembentuk", "Pemotong"],
  "summary": "Komponen bergerak yang menekan pelat masuk ke die untuk memotong atau membentuk.",
  "description": "Punch adalah komponen jantan pada die stamping. Saat ram press turun, punch menekan pelat hingga terjadi geser (shear) dan material terpotong atau terbentuk sesuai kontur ujungnya. Kualitas tepi potong sangat dipengaruhi clearance antara punch dan die.",
  "howItWorks": "Punch dipasang pada punch holder di die set atas. Ketika press turun, ujung punch menembus pelat dan masuk ke lubang die block. Clearance tipikal sekitar 5–10% dari tebal pelat, tergantung material.",
  "materials": ["SKD11", "SKD61", "Tool steel (D2)", "Karbida tungsten (untuk volume tinggi)"],
  "specs": [
    { "label": "Kekerasan tipikal", "value": "58–62 HRC" },
    { "label": "Perlakuan permukaan", "value": "Nitriding / coating TiN, TiCN (opsional)" },
    { "label": "Kontrol dimensi", "value": "Toleransi ketat, grinding presisi" }
  ],
  "automotiveUse": ["Lubang baut pada bracket", "Lubang mounting pada reinforcement pintu"],
  "commonIssues": ["Aus dan chipping di ujung", "Burr berlebih akibat clearance tidak tepat", "Galling pada pelat berlapis"],
  "related": ["die-block-insert", "stripper-plate", "guide-pin-bushing", "pilot-pin"],
  "modelId": "model-punch"
}
```

Gaya konten: Bahasa Indonesia yang jelas, istilah teknis Inggris dicantumkan dalam kurung/alias, hindari klaim yang tidak bisa diverifikasi, tambahkan disclaimer bahwa nilai spesifikasi bersifat umum/tipikal.

## 7. Model 3D dari Library Publik

Aturan utama: **hanya pakai model yang lisensinya mengizinkan penggunaan ulang**, dan selalu simpan atribusi.

Sumber yang diperbolehkan (periksa lisensi per model, jangan asumsi):
- **Sketchfab** — filter *Downloadable* + lisensi **CC0** atau **CC-BY** (atribusi wajib untuk CC-BY). Hindari lisensi NC/ND jika situs berpotensi komersial.
- **Poly Pizza** — model low-poly CC0/CC-BY.
- **Smithsonian Open Access (3D)** dan koleksi **Public Domain / CC0** lain.
- **Khronos glTF Sample Models** — untuk model uji/placeholder (cek lisensi tiap model).
- **Thingiverse / Printables** — hanya yang berlisensi CC dan konversi STL → GLB bila perlu.
- **GrabCAD / TraceParts** — **jangan** di-bundle atau di-hotlink kecuali syarat lisensinya jelas mengizinkan; default: tidak dipakai.

Aturan implementasi:
1. Unduh/convert ke **`.glb`** (glTF binary), simpan di `public/models/`. Jangan hotlink langsung ke situs sumber.
2. Optimasi: target < 2 MB per model (gunakan `gltf-transform` untuk compress/Draco/meshopt, texture max 1024px).
3. Setiap model wajib punya entri di `src/data/models.json` dan `docs/MODEL_SOURCES.md` berisi: sumber, URL halaman model, nama author, lisensi, tanggal unduh.
4. UI wajib menampilkan atribusi (nama model, author, lisensi, link sumber) di bawah viewer; untuk CC0 tetap tampilkan sumber sebagai kebiasaan baik.
5. Jika tidak ada model yang cocok dan berlisensi aman untuk suatu part, gunakan **placeholder generik** (bentuk sederhana buatan sendiri di Blender/three.js, lisensi milik proyek) dengan `isPlaceholder: true` dan label "Model ilustrasi" di UI. **Jangan** memakai model berlisensi tidak jelas demi melengkapi.
6. Agent tidak boleh mengarang URL atau lisensi. Jika tidak bisa memverifikasi, tandai `TODO: verify` di `MODEL_SOURCES.md` dan gunakan placeholder.
7. Viewer: `<model-viewer>` dengan `camera-controls`, `auto-rotate` (dimatikan jika `prefers-reduced-motion`), `shadow-intensity`, `loading="lazy"`, `poster` untuk thumbnail, dan fallback gambar bila WebGL tidak tersedia.
8. Daftar kartu (grid) memakai poster/thumbnail statis, bukan viewer hidup, agar halaman tetap ringan. Viewer hidup hanya di Detail Panel.

## 8. Fitur & Perilaku

Wajib (MVP):
- Tab kategori, chip cabang, pencarian teks (nama, alias, fungsi, material), filter fungsi/material/aplikasi.
- Detail panel dengan viewer 3D, spesifikasi, penjelasan, atribusi.
- Part terkait yang bisa diklik, riwayat navigasi (back/forward), deep link `#/part/<id>`.
- Skeleton loading, empty state ("Tidak ada part yang cocok"), error state untuk model gagal dimuat.
- Mode terang/gelap.

Nilai tambah (setelah MVP):
- Tampilan "Peta Relasi" (graph kecil: node part, edge relasi) di detail panel.
- Bandingkan 2 part berdampingan.
- Ekspor daftar part terpilih ke CSV/PDF.
- Glosarium istilah.
- Tambahkan part/cabang baru melalui pembaruan file JSON lokal dan deploy ulang, tanpa panel admin.

## 9. Desain Visual

### 9.1 Arah Desain Industrial

- **Wajib menggunakan identitas visual industrial yang formal, profesional, presisi, dan modern**, terinspirasi dari mesin manufaktur, tooling, baja, logam, gambar teknik, dan lingkungan engineering otomotif.
- Dominasi warna netral industrial: **graphite, charcoal, gunmetal, steel gray**, serta aksen **safety orange/amber** yang digunakan secukupnya. Hindari warna mencolok, pastel dekoratif, neon, gradient pelangi, dan efek glow berlebihan.
- Pertahankan hierarki yang tegas, komposisi rapi, ruang kosong konsisten, garis pemisah tipis, dan detail antarmuka yang terasa seperti katalog teknik profesional, **bukan dashboard gaming atau template SaaS generik**.
- Ikon sebaiknya sederhana, tegas, dan konsisten. Motif garis blueprint, grid teknik, atau tekstur logam boleh digunakan secara sangat halus sebagai aksen, bukan latar dominan.

### 9.2 Palet Warna Industrial (Design Tokens)

**Mode gelap — default:**

| Token | Warna | Hex | Penggunaan |
| --- | --- | --- | --- |
| `background` | Industrial charcoal | `#101820` | Latar utama halaman |
| `surface` | Gunmetal | `#19252F` | Header, sidebar, panel, dan kartu |
| `surface-elevated` | Deep steel | `#263640` | Hover, dropdown, input, panel aktif |
| `border` | Steel gray | `#405160` | Border dan divider |
| `text-primary` | Off-white steel | `#E9EFF2` | Judul dan isi utama |
| `text-secondary` | Cool gray | `#A8B7BE` | Deskripsi sekunder dan metadata |
| `accent` | Safety amber | `#E5A34B` | Tombol utama, tab aktif, indikator pilihan, focus ring |

**Mode terang:**

| Token | Warna | Hex | Penggunaan |
| --- | --- | --- | --- |
| `background` | Industrial off-white | `#F3F5F6` | Latar utama halaman |
| `surface` | White | `#FFFFFF` | Kartu dan panel |
| `surface-elevated` | Light steel | `#E7ECEF` | Hover dan elemen bertingkat |
| `border` | Soft steel | `#CAD2D7` | Border dan divider |
| `text-primary` | Graphite | `#203039` | Judul dan isi utama |
| `text-secondary` | Slate gray | `#5B6C76` | Deskripsi sekunder dan metadata |
| `accent` | Industrial copper | `#9C5A16` | Teks/ikon aktif dan elemen penekanan |

Aturan penggunaan warna:
- Gunakan **satu warna aksen utama** untuk aksi dan navigasi aktif. Warna status (sukses, peringatan, error) hanya dipakai sesuai makna, bukan sebagai dekorasi.
- Badge kategori memakai warna industrial yang konsisten dan *muted*: **Dies = steel blue** (`#55748A`), **Mold = machine green** (`#617967`), **Jig & Fixture = burnished copper** (`#A77344`). Pastikan teks badge tetap kontras dengan latarnya.
- Untuk tombol dengan latar safety amber di mode gelap, pakai teks charcoal (`#101820`); pada mode terang pastikan kombinasi tombol dan teks juga memenuhi kontras minimum.
- Semua teks dan kontrol harus memenuhi **WCAG AA**: target kontras minimal **4.5:1 untuk teks normal** dan **3:1 untuk teks besar serta komponen UI**. Jangan mengandalkan warna saja untuk menyampaikan status.
- Implementasikan warna melalui **semantic design tokens/CSS variables** atau konfigurasi tema Tailwind, bukan hex yang diulang langsung di banyak komponen. Jaga konsistensi pada mode terang dan gelap.

### 9.3 Tipografi Formal Industrial

- **Font utama wajib `IBM Plex Sans`** untuk judul, navigasi, tombol, label, dan body text. Alternatif jika font tidak tersedia: `Inter`, `Arial`, lalu `sans-serif`. Kesan yang dituju adalah engineering, formal, modern, mudah dibaca, bukan futuristik atau dekoratif.
- **Font teknis wajib `IBM Plex Mono`** untuk nomor part, kode, ID, angka dimensi, spesifikasi, toleransi, dan data tabular; fallback `Consolas`, `monospace`.
- Heading gunakan bobot **600–700**, body **400–500**, dan label teknis **500–600**. Pertahankan hierarki ukuran yang jelas, line-height nyaman, dan alignment konsisten.
- Gunakan huruf kapital seperlunya untuk label pendek seperti **DIES / MOLD / JIG & FIXTURE**; hindari seluruh paragraf uppercase, font bergaya gaming, tulisan condensed ekstrem, atau letter-spacing berlebihan.
- Angka pada tabel spesifikasi dibuat mudah dibandingkan, sebaiknya menggunakan **tabular numerals** dan perataan kanan untuk nilai numerik jika relevan.

### 9.4 Penerapan pada Komponen

- **Header & navigasi**: latar gunmetal/putih industrial, batas tipis steel gray, penanda tab aktif memakai safety amber/copper secara terkendali.
- **PartCard**: surface bersih, border tipis, thumbnail/model poster dominan, tipografi formal, metadata terstruktur; hover cukup mengubah border/elevasi secara halus.
- **Part Detail Panel & tabel**: kelompokkan informasi dengan heading jelas, divider rapi, label dan nilai mudah dipindai, serta font monospace untuk kode dan spesifikasi.
- **Search, filter, chips, dan tombol**: ukuran dan radius konsisten; gunakan sudut sedikit membulat (sekitar 6–10px), tidak terlalu pill-shaped untuk semua elemen. State default, hover, active, disabled, dan focus harus dapat dibedakan.
- **Model 3D**: gunakan latar viewer netral dengan pencahayaan lembut agar geometri dan detail part jelas; jangan memakai background atau efek yang mengalihkan perhatian dari model.
- Animasi/transisi halus **150–250 ms** untuk panel dan filter; hormati `prefers-reduced-motion`.
- Seluruh halaman harus tetap responsif, mudah dibaca, dan konsisten di desktop, tablet, serta mobile.

## 10. Standar Kode

- Gunakan **JavaScript ES Modules** dan Vue 3 Single File Components (`.vue`), tanpa TypeScript (`.ts`/`.tsx`).
- Komponen kecil, satu tanggung jawab; validasi props dan emit sesuai kebutuhan menggunakan fitur Vue.
- Logika data (filter, pencarian, resolver relasi) berada di `utils/` dan `composables/`, bukan bercampur di komponen tampilan.
- Penamaan: komponen `PascalCase`, file util `camelCase`, ID data `kebab-case`.
- Lint + format: ESLint + Prettier. Commit message gaya Conventional Commits.
- Tidak ada API key atau secret di repo. Jangan menambahkan integrasi database, backend, fungsi serverless, atau pemanggilan API yang tidak dibutuhkan.
- Performa diprioritaskan: aset 3D lokal, lazy loading, serta build statis yang ringan.

## 11. Pengujian & Kriteria Selesai

Selesai jika:
- [ ] Ketiga kategori tampil di satu halaman dan tab "Semua" menampilkan part dari ketiganya.
- [ ] Setiap cabang punya minimal 3 part; total seed minimal 45 part unik.
- [ ] Setiap part punya deskripsi, cara kerja, material, spesifikasi, aplikasi otomotif, dan minimal 2 part terkait.
- [ ] Relasi dua arah bekerja dan klik part terkait berpindah detail tanpa reload.
- [ ] Setiap part punya model 3D (asli berlisensi atau placeholder berlabel) dengan atribusi tampil.
- [ ] `docs/MODEL_SOURCES.md` lengkap dan tidak ada model tanpa lisensi jelas.
- [ ] Tidak ada ID relasi yang menunjuk part yang tidak ada (validasi script `npm run validate:data`).
- [ ] Lighthouse mobile: Performance ≥ 80, Accessibility ≥ 90.
- [ ] Berfungsi di Chrome, Firefox, Safari, dan mobile.
- [ ] Unit test untuk resolver relasi, filter, dan pencarian (Vitest).
- [ ] Seluruh katalog dirender dari `src/data/*.json` lokal; pencarian dan filter berjalan sepenuhnya di browser.
- [ ] `npm run build` menghasilkan `dist/` yang berjalan di static hosting tanpa database, backend, atau API.
- [ ] Tidak ada file `.ts`/`.tsx`, Vue Router, atau Pinia yang tidak diperlukan untuk website satu halaman.

## 12. Urutan Kerja yang Disarankan untuk Agent

1. Inisialisasi proyek **Vite + Vue 3 (JavaScript) + Tailwind CSS**, setup lint/format; tanpa TypeScript, backend, atau database.
2. Tetapkan struktur JSON lokal dan buat script `validate:data` (`scripts/validate-data.js`).
3. Isi `categories.json`, `branches.json`, lalu `parts.json` bertahap per kategori.
4. Bangun composable Vue untuk state, resolver relasi, filter, dan pencarian + test; semuanya berjalan di browser.
5. Bangun layout halaman, grid, kartu, dan detail panel dengan placeholder model.
6. Cari, unduh, optimasi model 3D berlisensi aman; isi `models.json` dan `MODEL_SOURCES.md`.
7. Integrasi `<model-viewer>`, atribusi, fallback.
8. Polish visual industrial, aksesibilitas, performa, lalu jalankan `npm run build` dan deploy hasil `dist/` ke static hosting.

## 13. Hal yang Tidak Boleh Dilakukan

- Memakai model 3D tanpa lisensi jelas atau yang melarang penggunaan ulang.
- Hotlink model/gambar dari situs pihak ketiga.
- Menyalin teks deskripsi mentah dari situs/katalog vendor; tulis ulang dengan kata sendiri.
- Mengarang spesifikasi presisi, merek, atau standar yang tidak bisa diverifikasi.
- Menduplikasi part yang sama di banyak cabang; gunakan relasi banyak-ke-banyak.
- Memasang database, backend, CMS, serverless function, autentikasi, atau API untuk menyajikan data katalog yang sudah tersedia di JSON lokal.

## 14. Disclaimer di Footer

"Informasi bersifat edukatif dan umum. Spesifikasi aktual bergantung pada desain, material, dan standar masing-masing pabrikan. Model 3D milik masing-masing pembuat sesuai lisensi yang tercantum."
