# SCRATCH

Arsip puisi pribadi: satu pembuka sinematik, tumpukan gambar 3D yang bisa diputar tanpa henti,
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
| `npm run preview` | Melihat hasil build lokal |

---

## Cara menjelajah

- **Pembuka** tampil sekali per sesi. Klik tombol panah di samping judul untuk masuk.
- Di halaman arsip, **gulir** di atas kartu, **seret** ke samping, atau gunakan **tombol panah**
  kiri/kanan untuk memutar tumpukan kartu. Kartu berputar terus dan kembali dari belakang.
- **Klik gambar paling depan** untuk membuka puisinya. Tidak ada tombol baca terpisah.
- Di ponsel, halaman bisa digulir seperti biasa dan kartu digeser dengan jari.
- Untuk memutar ulang pembuka, klik **INTRO ↺** di kanan atas atau buka `/?intro=1`.

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
- Jumlah lembar di pembuka ikut menyesuaikan otomatis.
- Kalau path gambar salah, build akan gagal dan menunjukkan nama file yang bermasalah.

### 3. Ganti isi contoh

Enam puisi dan gambar di repo ini hanyalah contoh. Hapus atau ganti file di:

```
src/content/puisi/*.md
src/assets/puisi/*.jpg
```

Lalu tambahkan puisi sendiri. Tidak ada daftar lain yang perlu diperbarui.

---

## Struktur singkat

```
src/
├─ assets/puisi/          gambar asli (4:5)
├─ components/            Header, Footer, Intro, Archive
├─ content/puisi/         isi puisi (.md)
├─ layouts/Base.astro     <head>, font, meta, skip intro
├─ lib/poems.ts           urutan, format tanggal, waktu baca
├─ pages/
│  ├─ index.astro         halaman utama + tumpukan kartu 3D
│  ├─ puisi/[id].astro    halaman detail per puisi
│  └─ 404.astro
├─ styles/global.css      seluruh tampilan
└─ content.config.ts      aturan field frontmatter
public/                   favicon, robots.txt, og.jpg
scripts/                  pembuat gambar contoh & OG cadangan
```

Hal kecil yang mungkin ingin diubah:

- Teks pembuka: `src/components/Intro.astro`
- Teks footer: `src/components/Footer.astro`
- Warna, ukuran kartu, dan kedalaman tumpukan: bagian atas `src/styles/global.css` serta
  perhitungan `render()` di `src/pages/index.astro`
- Deskripsi situs dan meta: `src/layouts/Base.astro`

### Tipografi

- **Fraunces** untuk judul dan angka besar.
- **DM Sans** untuk label, meta, dan navigasi.
- **Newsreader** khusus untuk larik puisi dan kutipan.

Ketiganya dimuat lokal lewat paket Fontsource, jadi tidak ada permintaan ke Google Fonts.

### Tentang animasi pembuka

Intro muncul sekali per sesi browser. Setelah masuk, intro tidak diulang saat berpindah halaman.
Untuk memutar ulang, klik **INTRO ↺** di kanan atas, atau buka `/?intro=1`. Kalau JavaScript
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
