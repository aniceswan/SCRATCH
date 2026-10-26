# Catatan optimasi untuk nanti

Status: ditunda. Catatan ini tidak menerapkan perubahan performa.

## Disetujui untuk dikerjakan nanti

- **Gambar:** evaluasi ukuran unduhan, resolusi sesuai ukuran tampil dan layar perangkat, kompresi, serta lazy loading untuk gambar yang belum terlihat. Pertahankan kualitas visual.
- **Font dan CSS:** pisahkan kebutuhan desain lama dari halaman utama dan kirim aset yang diperlukan masing-masing halaman. Pertahankan tampilan versi yang disimpan.
- Ukur ukuran unduhan, waktu buka halaman, dan penggunaan resource sebelum serta sesudah perubahan agar manfaatnya dapat dibandingkan.

## Preferensi pengguna

- **Pemutar YouTube tetap langsung dimuat saat halaman baca dibuka.** Jangan menundanya sampai tombol Play ditekan atau pemutar mendekati layar; pengguna ingin lagu sudah siap ketika Play ditekan.
- **Animasi dan audio tetap seperti sekarang.** Optimasi aktivitas animasi/audio saat halaman diam atau tab tersembunyi tidak diminta.

Pemutar sekarang menggunakan YouTube untuk seluruh puisi dan fragments. Lagu dimulai dari awal dan berhenti setelah selesai, tanpa looping. Video dimuat langsung dari YouTube, tanpa Functions atau proxy Vercel.
