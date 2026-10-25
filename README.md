# SCRATCH

Arsip puisi pribadi: satu pembuka sinematik, carousel gambar yang bisa digeser tanpa henti,
dan satu halaman untuk setiap puisi. Semua isi disimpan di dalam repo — tanpa database, tanpa CMS,
tanpa panel admin. Setiap `git push` ke `main` akan membangun ulang situs secara otomatis.

Dibangun dengan [Astro](https://astro.build) dan CSS/JS biasa. Tidak ada framework UI atau
library animasi.

---

## Menjalankan di komputer

Butuh **Node.js 22.23.4 atau lebih baru** (Node 24 disarankan).

```bash
npm install
npm run dev
```

Buka `http://localhost:4321`.

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Server pengembangan dengan hot reload |
| `npm run build` | Membuat situs statis ke folder `dist/` |
| `npm run check` | Memeriksa TypeScript dan file Astro |
| `npm test` | Memeriksa impor naskah, koleksi, pembungkusan kartu, dan geometri carousel |
| `npm run preview` | Melihat hasil build lokal |

---

## Cara menjelajah

- **SERIES ↗** di samping BACK membuka koleksi puisi, dengan cover abstrak, nama, dan jumlah puisi.
  Pilih series untuk melihat gambar, nomor, judul, dan cuplikan puisi dalam grid biasa:
  tiga kolom di desktop, dua di tablet, satu di ponsel. Tautan sebelumnya/selanjutnya
  pada halaman baca mengikuti urutan series dan tetap berfungsi tanpa JavaScript.
- **Pembuka** tampil sekali per sesi. Klik tombol panah di samping judul untuk masuk.
- Di halaman arsip, **gulir** di atas kartu, **seret** ke samping, atau gunakan **tombol panah**
  kiri/kanan untuk menggeser carousel. Kartu aktif besar di tengah, dengan tetangga lebih kecil di kedua sisi.
- Setiap puisi bernomor **01–40**; nomor terlihat di archive dan di atas judul halaman bacaan.
- **Klik gambar di tengah** untuk membuka puisinya, diiringi bunyi singkat. Klik kartu samping untuk membawanya ke tengah.
  Di bawah setiap puisi tersedia tautan **PUISI SEBELUMNYA / SELANJUTNYA** beserta judul,
  mengikuti urutan naskah dan berputar pada ujung koleksi. **ARCHIVE ↗** kembali ke galeri.
- Tombol **← / →** di bawah carousel juga bisa memilih puisi. Perpindahan halus mereda
  lalu berhenti sepenuhnya; pengaturan reduced motion dihormati.
- Perpindahan kartu diiringi **rekaman asli hanger yang digeser**, diambil sebagai dua
  potongan pendek dan ringan. Sumber serta lisensi CC0 tercatat di `src/assets/audio/SOURCES.md`.
  Suara selalu aktif setelah browser menerima klik, sentuhan, atau tombol pertama.
- Scroll dan seret memakai gerak dengan percepatan serta perlambatan halus; satu
  gerakan wheel menempuh sekitar 2,25 kali jarak versi awal.
- Hanya **maksimal sembilan kartu** yang dibuat di halaman. Slot dipakai ulang saat menjelajah,
  sehingga jumlah kartu yang dianimasikan tidak bertambah bersama koleksi.
- Di ponsel, judul dan carousel sudah diatur agar **muat dalam satu layar tanpa digulir**;
  kartu digeser dengan jari.
- Untuk kembali ke pembuka, klik **BACK ←** di kanan atas atau buka `/?intro=1`.

---

## Menambah puisi

Setiap puisi terdiri dari **satu file Markdown** dan **satu gambar 4:5**.

### 1. Siapkan gambar

- Rasio **4:5** (potret). Ukuran yang disarankan **1200 × 1500 px**, format JPG/WebP/PNG.
- Simpan di `src/assets/puisi/`, misalnya `hujan-bulan-ini.jpg`.
- Astro akan mengompres dan membuat beberapa ukuran secara otomatis saat build. Tidak perlu
  membuat thumbnail manual.
- Gambar akan dipotong mengikuti rasio 4:5, jadi usahakan bagian penting tidak terlalu mepet tepi.

### 2. Buat file puisi

Buat file baru di `src/content/puisi/`. **Nama file menjadi alamat URL**, jadi gunakan huruf
kecil dan tanda hubung:

```
src/content/puisi/hujan-bulan-ini.md  →  /puisi/hujan-bulan-ini/
```

Isi contoh:

```md
---
title: "Hujan Bulan Ini"
date: 2026-10-24
image: "../../assets/puisi/hujan-bulan-ini.jpg"
imageAlt: "Jendela basah dengan lampu jalan di kejauhan"
excerpt: "Hujan datang lagi, dan aku masih menyimpan payung yang bukan milikku."
draft: false
---

Hujan datang lagi
tanpa bertanya apakah aku siap.

Aku membuka jendela
dan membiarkan kamar ini
belajar basah.
```

| Field | Wajib | Keterangan |
| --- | --- | --- |
| `title` | ya | Judul puisi, maksimal 100 karakter |
| `date` | ya | Tanggal `YYYY-MM-DD`; dipakai untuk urutan arsip |
| `order` | tidak | Urutan di dalam tanggal yang sama, default `0` |
| `lang` | tidak | Bahasa larik `id` atau `en`, default `id` |
| `image` | ya | Path relatif dari file Markdown ke gambar |
| `imageAlt` | ya | Deskripsi gambar untuk pembaca layar |
| `excerpt` | ya | Kutipan singkat, maksimal 260 karakter |
| `draft` | tidak | `true` menyembunyikan puisi saat build produksi |

Catatan menulis:

- **Setiap baris baru di badan puisi menjadi baris baru di halaman.** Ini disengaja agar tulisan
  terasa seperti puisi, bukan paragraf HTML.
- Beri **satu baris kosong** antarbait.
- Urutan arsip selalu dari tanggal terbaru. Puisi terbaru otomatis menjadi puisi unggulan di
  halaman utama.
- Kalau path gambar salah, build akan gagal dan menunjukkan nama file yang bermasalah.

### 3. Koleksi saat ini

**Arsip Cahaya yang Salah Arah** (edisi terpadu) terdiri dari 40 puisi. Sumber lengkap tersimpan di
`content-source/arsip-cahaya-yang-salah-arah.txt`; halaman hanya memuat sajak, tanpa
judul bagian atau catatan redaksi. Urutan mengikuti nomor naskah.

Setiap puisi mendapat ilustrasi bertema abstrak yang senada, disimpan sebagai
WebP 1200 × 1500 di `src/assets/puisi/`. Prompt dan deskripsi tiap gambar tercatat di
`scripts/poetry-art.json`. Gambar kartu memakai versi responsif 320–800 px; gambar
besar tersedia pada halaman puisi.

Untuk mengimpor ulang edisi naskah ini setelah memperbarui sumber dan gambarnya:

```bash
node scripts/import-poems.mjs
```

Importer memvalidasi 40 nomor dan pasangan gambar lebih dahulu, mencadangkan koleksi
lama ke direktori sementara, lalu mengganti berkas puisi. Untuk menambah puisi satu
per satu, cukup ikuti langkah 1–2 di atas; tidak perlu menjalankan importer.

---

## Struktur singkat

```
src/
├─ assets/puisi/          gambar asli (4:5)
├─ components/            Header, Intro, Archive
├─ content/puisi/         isi puisi (.md)
├─ layouts/Base.astro     <head>, font, meta, skip intro
├─ lib/                  urutan, jendela kartu, geometri, dan audio
├─ scripts/gallery.ts    interaksi browser dan animasi carousel
├─ pages/
│  ├─ index.astro         halaman utama + carousel kartu
│  ├─ puisi/[id].astro    halaman detail per puisi
│  └─ 404.astro
├─ styles/global.css      seluruh tampilan
└─ content.config.ts      aturan field frontmatter
public/                   favicon, robots.txt, og.jpg
scripts/                  pembuat gambar contoh & OG cadangan
```

Hal kecil yang mungkin ingin diubah:

- Teks pembuka: `src/components/Intro.astro`
- Copyright: paragraf `.copyright` langsung di setiap halaman, tanpa komponen footer
- Goresan logo di kanan atas: `src/components/Header.astro` (satu garis SVG)
- Warna dan ukuran kartu: `src/styles/global.css`; posisi dan skala kartu: `src/lib/gallery.js`
- Deskripsi situs dan meta: `src/layouts/Base.astro`

### Tipografi

- **Fredoka** (500) untuk tulisan "scratch", judul puisi, dan angka besar. Semuanya ditampilkan
  dalam huruf kecil supaya terasa bulat dan lembut.
- **DM Sans** untuk label, meta, dan navigasi.
- **Newsreader** khusus untuk larik puisi dan kutipan.

Ketiganya dimuat lokal lewat paket Fontsource, jadi tidak ada permintaan ke Google Fonts.

Latar halaman memakai satu gradasi menyatu (`--paper-grad` di `src/styles/global.css`). Ukuran kartu
mengikuti tinggi area carousel, sehingga kartu dan kontrol muat tanpa scroll di semua
ukuran layar.

### Tentang animasi pembuka

Intro muncul sekali per sesi browser. Setelah masuk, intro tidak diulang saat berpindah halaman.
Untuk memutar ulang, klik **BACK ←** di kanan atas, atau buka `/?intro=1`. Kalau JavaScript
dimatikan, intro dilewati dan daftar puisi tetap bisa dibaca.

---

## Deploy otomatis

Alurnya: tulis puisi → `git push` ke `main` → layanan hosting menjalankan `npm run build` →
situs baru tayang. Tidak ada langkah upload manual.

### Cloudflare Pages (disarankan)

Cocok untuk situs statis yang banyak gambar karena bandwidth tidak dihitung per GB.

1. Buat repo di GitHub, lalu dorong proyek ini:

   ```bash
   git init
   git add .
   git commit -m "SCRATCH: versi awal"
   git branch -M main
   git remote add origin git@github.com:USERNAME/SCRATCH.git
   git push -u origin main
   ```

2. Buka dashboard Cloudflare → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, lalu pilih repo.
3. Isi pengaturan build:

   | Pengaturan | Nilai |
   | --- | --- |
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | `24` (environment variable `NODE_VERSION=24`) |

4. Klik **Save and Deploy**. Setiap push ke `main` akan memicu deploy baru; pull request mendapat
   URL preview sendiri.
5. Tambahkan domain sendiri di tab **Custom domains** kalau sudah ada. Cloudflare mengurus HTTPS.

### Vercel (alternatif)

Sama-sama bisa dan lebih sederhana untuk preview. Import repo di Vercel, pilih preset **Astro**,
build command `npm run build`, output `dist`, dan set Node 24. Push ke `main` juga otomatis deploy.
Catatan: paket Hobby membatasi bandwidth bulanan; untuk situs gambar yang ramai, Cloudflare Pages
lebih longgar.

### Setelah punya domain

Buka `astro.config.mjs`, aktifkan baris `site`:

```js
export default defineConfig({
  site: 'https://namadomain.com',
  // ...
});
```

Ini membuat canonical URL dan gambar OG memakai alamat yang benar. Setelah itu build ulang dan
push.

---

## Catatan

- Situs ini sepenuhnya statis. Tidak ada data pengunjung yang disimpan.
- Semua yang ada di repo akan tampil publik setelah deploy, termasuk teks dan gambar. Jangan
  simpan draf pribadi di repo; gunakan `draft: true` atau simpan di luar folder `src/content`.

Selamat menulis.

### Uji browser opsional

Setelah build, jalankan `npm run preview` di terminal pertama. Uji interaksi membutuhkan
Playwright yang tersedia di lingkungan pengembangan (`npm install --no-save playwright`,
lalu `npx playwright install chromium`). Di terminal lain:

```bash
npm run test:browser
# Jika preview memakai port berbeda atau Chrome sistem:
BASE_URL=http://127.0.0.1:4323 CHROME_PATH=/usr/bin/google-chrome npm run test:browser
```

Uji ini mencakup navigasi berulang, tautan/gambar aktif, rekaman suara yang selalu aktif, berhentinya
animasi, swipe sentuh, replay intro, reduced motion, tampilan ponsel, dan fallback tanpa JS.

Header halaman puisi ikut bergulir bersama isi dan memakai latar transparan, sehingga
tidak membentuk bilah warna/blur di atas gradasi. Satu tali galeri diikat pada tiang kayu bertekstur fotorealistis
di desktop. Di layar sampai 900 px, tiang dan lilitan disembunyikan; tali berlanjut
langsung sampai tepi layar. Aset kayu transparan disimpan di `src/assets/decor/wooden-post.webp`
dan hanya dimuat pada desktop. Prompt ImageGen ada di `scripts/wooden-post-art.json`.

## Mengelola series

Setiap series disimpan di `src/content/series/<slug>.md`. Cover ada di `src/assets/series/`.
Daftar `poems` berisi ID file puisi dalam urutan baca yang diinginkan. Untuk menambahkan
series kedua, buat satu file baru beserta cover; kartu dan halaman series dibuat otomatis.
Puisi boleh menjadi anggota beberapa series. Puisi draft dikecualikan pada build produksi;
series kosong atau draft tidak ditampilkan. Referensi puisi yang hilang dan anggota duplikat
akan menggagalkan build agar tidak menghasilkan koleksi yang tidak lengkap.

```yaml
---
title: "Nama Series"
order: 2
cover: "../../assets/series/nama-series.webp"
coverAlt: "Deskripsi cover"
poems:
  - halaman-nol
  - grafit
draft: false
---
```

Cover pertama dibuat memakai built-in ImageGen; prompt ada di `scripts/series-art.json`.
Semua 40 puisi saat ini masuk **refraction**, di `/series/refraction/`. Teks dan gambar puisi
menggunakan berkas yang sama dengan archive, tanpa salinan isi atau database.

Uji alur series setelah build dan preview memakai `npm run test:series`, dengan variabel
`BASE_URL`, `CHROME_PATH`, dan `PLAYWRIGHT_MODULE` seperti uji browser archive.
