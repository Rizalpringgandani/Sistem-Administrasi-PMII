# Perencanaan Sistem Administrasi PMII Rayon

Oct 16, 2026 · @Rizal

## Ringkasan dan tujuan

Sistem ini dipakai sekretaris dan pengurus inti satu rayon/komisariat PMII untuk membuat surat, proposal, dan LPJ dari template, mengelola data kader, dan menyimpan arsip dokumen di satu komputer tanpa internet.

- Dokumen berkop dan format baku bisa dibuat dengan mengisi data, tanpa mengetik ulang dari nol.
- Data kader, jenjang kaderisasi, dan kepengurusan tersimpan di satu tempat.
- Dokumen jadi bisa diekspor ke Word dan PDF, atau dicetak langsung di kertas F4.

## Ruang lingkup dan pengguna

Sistem melayani satu rayon/komisariat, dijalankan di satu komputer sekretariat, dengan satu akun admin. Pengurus inti dan sekretaris memakainya bergantian lewat komputer yang sama.

| Termasuk | Belum termasuk |
| --- | --- |
| Surat menyurat berbasis template | Banyak akun dengan hak akses berbeda |
| Data kader, jenjang kaderisasi, kepengurusan | Alur persetujuan dokumen |
| Proposal dan LPJ berbasis template | Akses lewat jaringan atau internet |
| Editor dokumen ala Word | Modul keuangan, iuran, dan inventaris |
| Arsip sederhana, export Word/PDF, cetak F4 | Tanda tangan digital dan QR |

Kolom kanan bisa ditambah di tahap berikutnya kalau kebutuhannya muncul.

## Kebutuhan fungsional

Empat modul, diurutkan dari yang paling dulu dibangun.

**1. Surat menyurat**

- Sekretaris membuat dan mengubah template surat: logo, nama lembaga, alamat, dan kop.
- Surat baru dibuat dari template; pengguna mengisi data seperti tujuan, perihal, dan tanggal.
- Nomor surat dibuat otomatis dengan format baku, dan masih bisa diubah sekretaris.
- Surat bisa diedit di editor sebelum diekspor atau dicetak.

**2. Data kader**

- Biodata dasar: nama, kontak, alamat, dan data identitas kader lain yang dibutuhkan rayon.
- Jenjang kaderisasi (misalnya MAPABA, PKD) beserta tanggalnya.
- Jabatan dan kepengurusan per periode.
- Cari, tambah, ubah, dan hapus data kader.

**3. Proposal dan LPJ**

- Memakai template seperti surat, dibuat dan diubah oleh sekretaris.
- Ditulis langsung di editor, lalu diekspor ke Word, PDF, atau dicetak.

**4. Arsip**

- Daftar semua dokumen yang pernah dibuat, dengan jenis, nomor, tanggal, dan judul.
- Dokumen bisa dibuka ulang dan diunduh kembali.

## Editor dokumen dan template

Editor mengikuti tampilan di referensi SIMBA: toolbar di atas, halaman kertas di tengah. Fitur dibagi dua tahap supaya tahap awal cepat jadi.

| Fitur editor | Tahap |
| --- | --- |
| Bold, italic, underline, heading, list, rata teks | Awal |
| Tabel dan gambar | Awal |
| Layout kertas F4, margin, kop surat, nomor halaman | Awal |
| Cari dan ganti teks | Awal |
| Komentar dan riwayat revisi | Nanti |

Template berisi kop dan isi dokumen dengan isian bertanda, misalnya nama lembaga, nomor surat, tujuan, dan tanggal. Sekretaris membuat isian itu sekali, lalu pengguna hanya mengisi nilainya saat membuat dokumen baru. Alasannya: dokumen jadi seragam, dan pengguna tidak merusak kop saat mengetik.

Export ke Word (.docx) dan PDF dibuat dari isi editor yang sama, supaya tampilan di layar, hasil cetak, dan file hasil export tidak berbeda.

## Kebutuhan non-fungsional

- **Offline penuh:** semua fitur jalan tanpa internet. Library editor, font, dan aset dipasang lokal, tidak diambil dari CDN.
- **Satu komputer, satu akun admin:** cukup satu login sederhana dengan kata sandi, supaya data kader tidak terbuka bagi siapa saja yang memegang komputer.
- **Backup:** data dan file dokumen disalin rutin ke flashdisk atau drive lain. Tanpa backup, satu kerusakan disk menghilangkan seluruh arsip.
- **Mudah dipasang:** satu folder aplikasi dan satu cara menjalankan, supaya sekretaris berikutnya bisa memakainya tanpa bantuan teknis.
- **Cetak akurat:** kertas F4 dan margin sama antara layar, PDF, dan hasil cetak.

## Alur kerja utama

**Membuat template (sekali, oleh sekretaris)**

1. Buka menu Template, pilih jenis: surat, proposal, atau LPJ.
2. Susun kop, isi dokumen, dan tandai isian yang nanti diisi pengguna.
3. Simpan template.

**Membuat dokumen dari template**

1. Pilih jenis dokumen dan template-nya.
2. Isi data pada formulir isian, misalnya tujuan, perihal, dan tanggal.
3. Sistem mengusulkan nomor surat; sekretaris boleh mengubahnya.
4. Dokumen terbuka di editor untuk disunting.
5. Simpan, dan dokumen masuk arsip.
6. Export ke Word atau PDF, atau cetak langsung di F4.

**Mengelola data kader**

1. Buka menu Kader dan tambah atau pilih kader.
2. Isi biodata, catat jenjang kaderisasi yang sudah diikuti, dan jabatannya per periode.

## Rancangan struktur data

Usulan awal delapan tabel; kolom bisa disesuaikan setelah melihat data kader dan contoh surat yang dipakai rayon.

| Tabel | Isi utama | Berhubungan dengan |
| --- | --- | --- |
| pengaturan | nama lembaga, alamat, logo, format nomor surat, kata sandi admin | berdiri sendiri |
| kader | nama, kontak, alamat, foto, tanggal bergabung | jenjang\_kader, jabatan\_kader |
| jenjang | daftar jenjang kaderisasi (MAPABA, PKD, dst) | jenjang\_kader |
| jenjang\_kader | kader, jenjang, tanggal | kader, jenjang |
| periode | nama periode, tahun mulai dan selesai | jabatan\_kader |
| jabatan\_kader | kader, periode, nama jabatan | kader, periode |
| template | jenis (surat, proposal, LPJ), nama, isi dokumen, daftar isian | dokumen |
| dokumen | jenis, nomor, judul, tanggal, isi, template asal | template |

Nomor surat disimpan di tabel dokumen, dengan penghitung urut per jenis surat dan per tahun supaya nomor berikutnya mudah diusulkan.

## Rekomendasi teknologi

Untuk satu komputer dan offline, aplikasi desktop berbasis web (Electron) dengan database SQLite cocok sebagai bentuk akhir. Karena dibangun dengan vibe coding, mulai dulu sebagai web lokal (Node.js + SQLite + editor TipTap) yang dibuka lewat browser di localhost, lalu bungkus jadi aplikasi desktop setelah semua fitur jalan. Alasannya: bagian tersulit (editor, template, export) selesai dulu tanpa terhambat urusan installer, dan data tetap satu file SQLite yang mudah di-backup.

| Pilihan | Kelebihan | Kekurangan |
| --- | --- | --- |
| Web lokal Node.js + SQLite + TipTap, dibungkus Electron belakangan (disarankan) | Fitur utama selesai dulu dan mudah diuji di browser, offline penuh, data satu file | Perlu satu langkah tambahan di akhir untuk jadi aplikasi desktop |
| Web lokal PHP/Laravel + MySQL (XAMPP) | Familiar bagi banyak guru TKJ, mudah dipelajari | Harus menyalakan XAMPP; backup database lebih repot |
| Electron langsung dari awal | Hasil akhir sudah berupa aplikasi desktop | Packaging dan debugging sering menghambat AI agent di awal |

Komponen yang diusulkan untuk pilihan pertama:

- **Editor:** TipTap (berbasis ProseMirror), dengan ekstensi tabel dan gambar, ditambah tampilan halaman F4.
- **Export Word:** library pembuat file .docx dari struktur dokumen.
- **PDF dan cetak:** fitur cetak browser dengan ukuran kertas F4, yang ikut terbawa saat dibungkus Electron.
- **Database:** SQLite, satu file yang bisa disalin untuk backup.

Pilihan akhir sebaiknya mengikuti bahasa yang paling kamu kuasai, karena sistem ini akan terus dirawat sendiri.

## Tahapan pengembangan

Editor dan template dibangun lebih dulu karena surat, proposal, dan LPJ semuanya bergantung padanya.

| Tahap | Isi | Hasil yang bisa dicoba |
| --- | --- | --- |
| 1. Fondasi | Kerangka aplikasi, database, login admin, pengaturan lembaga | Aplikasi terbuka dan bisa login |
| 2. Editor | Editor dengan format dasar, tabel, gambar, halaman F4 | Mengetik dan mencetak dokumen satu halaman |
| 3. Template dan surat | Template dengan isian, nomor surat otomatis, arsip, export Word dan PDF | Satu surat jadi dari template sampai cetak |
| 4. Data kader | Biodata, jenjang kaderisasi, jabatan per periode | Daftar kader yang bisa dicari |
| 5. Proposal dan LPJ | Template dan alur yang sama dengan surat | Proposal dan LPJ dibuat dari template |
| 6. Backup dan penyempurnaan | Backup satu klik, dibungkus jadi aplikasi desktop, uji coba di komputer sekretariat, perbaikan | Dipakai pengurus sungguhan |

Setelah tahap 3, sistem sudah berguna untuk pekerjaan surat harian, jadi bisa mulai dipakai sambil tahap berikutnya dikerjakan.

## Panduan vibe coding di Antigravity

Dokumen ini dipakai sebagai bahan, bukan diberikan utuh ke AI agent. Simpan ringkasannya sebagai file `PROJECT.md` di folder proyek supaya agent membacanya ulang di setiap sesi, lalu berikan satu prompt per tahap. Setelah tiap tahap: uji sendiri, lalu commit ke Git.

**Isi PROJECT.md**

```markdown
# Sistem Administrasi PMII Rayon

## Tujuan
Aplikasi web lokal untuk sekretaris dan pengurus inti satu rayon/komisariat PMII: membuat surat, proposal, dan LPJ dari template, mengelola data kader, dan menyimpan arsip. Dijalankan di satu komputer tanpa internet.

## Aturan wajib
- Antarmuka berbahasa Indonesia.
- Offline penuh: tanpa CDN, font online, atau API eksternal. Semua library dipasang lokal lewat npm.
- Satu akun admin dengan kata sandi. Tidak ada multi-user.
- Database SQLite, satu file.
- Kertas F4 (215 x 330 mm). Tampilan layar, PDF, hasil cetak, dan export Word harus sebisa mungkin sama.
- Kerjakan satu tahap per sesi. Jangan membuat fitur di luar tahap yang diminta.
- Setelah tiap tahap: jelaskan cara menjalankan dan menguji, lalu berhenti.

## Stack
Node.js, SQLite, editor TipTap (dengan tabel dan gambar), library pembuat file .docx. Pembungkus Electron hanya dikerjakan di tahap terakhir.

## Fitur
- Surat: template dengan isian, nomor surat otomatis yang bisa diubah.
- Data kader: biodata, jenjang kaderisasi, jabatan per periode.
- Proposal dan LPJ: template dengan mekanisme yang sama dengan surat.
- Arsip sederhana, export Word dan PDF, cetak F4.

## Belum termasuk
Multi-akun, alur persetujuan, akses jaringan atau internet, keuangan dan iuran, tanda tangan digital.

## Struktur data
pengaturan, kader, jenjang, jenjang_kader, periode, jabatan_kader, template, dokumen.
```

### Prompt per tahap

Salin satu prompt ke agent hanya setelah tahap sebelumnya lolos uji dan sudah di-commit. Awali tiap sesi baru dengan kalimat: "Baca PROJECT.md dulu."

**Tahap 1: Fondasi**

```text
Baca PROJECT.md. Kerjakan TAHAP 1 saja: kerangka aplikasi web lokal dengan Node.js + SQLite.
- Buat semua tabel sesuai bagian Struktur data, dengan kolom yang masuk akal.
- Halaman login admin dengan satu kata sandi (disimpan sebagai hash, bukan teks biasa).
- Halaman Pengaturan lembaga: nama, alamat, logo, format nomor surat.
- Menu navigasi dengan halaman kosong: Surat, Template, Kader, Proposal & LPJ, Arsip.
Semua library lewat npm, tanpa CDN. Setelah selesai, jelaskan perintah untuk menjalankan, alamat localhost, dan cara mengujinya. Jangan membuat fitur tahap lain.
```

**Tahap 2: Editor**

```text
Baca PROJECT.md. Kerjakan TAHAP 2 saja: halaman editor dokumen dengan TipTap.
- Fitur: bold, italic, underline, heading, list, rata kiri/tengah/kanan/rata kanan-kiri, tabel (tambah dan hapus baris/kolom), gambar dari file lokal, cari dan ganti teks.
- Tampilan seperti halaman kertas F4 (215 x 330 mm) di tengah layar, dengan margin dan toolbar di atas.
- Tombol Cetak dengan ukuran kertas F4.
- Simpan isi dokumen sebagai JSON TipTap.
Jelaskan cara menguji, terutama hasil cetak/PDF dari browser. Jangan menyentuh template, surat, atau kader.
```

**Tahap 3: Template dan surat**

```text
Baca PROJECT.md. Kerjakan TAHAP 3 saja: template dan surat.
(a) Menu Template: sekretaris membuat template surat di editor, menandai isian dengan penanda seperti {{tujuan}}, {{perihal}}, {{tanggal}}, lalu menyimpannya. Kop surat (logo dan nama lembaga dari Pengaturan) terisi otomatis.
(b) Buat surat: pilih template, tampil formulir isian dari penanda, sistem mengusulkan nomor surat sesuai format di Pengaturan dengan urutan otomatis per tahun (bisa diubah), lalu dokumen terbuka di editor.
(c) Simpan ke tabel dokumen dan tampilkan di halaman Arsip: jenis, nomor, tanggal, judul, buka ulang, unduh.
(d) Export Word (.docx) dan PDF.
Jelaskan cara menguji, terutama apakah kop, tabel, dan gambar di file Word sama dengan tampilan editor.
```

**Tahap 4: Data kader**

```text
Baca PROJECT.md. Kerjakan TAHAP 4 saja: menu Kader.
- Daftar kader dengan pencarian, tambah, ubah, dan hapus (minta konfirmasi sebelum menghapus).
- Biodata: nama, kontak, alamat, foto, tanggal bergabung.
- Catatan jenjang kaderisasi per kader, diambil dari tabel jenjang, lengkap dengan tanggal.
- Jabatan per periode.
- Halaman pengaturan untuk mengelola daftar jenjang dan daftar periode.
Jelaskan cara menguji. Jangan mengubah kode editor dan template.
```

**Tahap 5: Proposal dan LPJ**

```text
Baca PROJECT.md. Kerjakan TAHAP 5 saja: proposal dan LPJ memakai mekanisme template, penomoran, arsip, dan export yang sama dengan surat.
- Pakai ulang kode tahap 3, jangan menggandakannya.
- Tambahkan jenis dokumen "proposal" dan "LPJ" pada pilihan template dan arsip.
- Buat satu template contoh untuk masing-masing dengan struktur bab sederhana; nanti saya ganti dengan format rayon.
Jelaskan cara menguji.
```

**Tahap 6: Backup dan aplikasi desktop**

```text
Baca PROJECT.md. Kerjakan TAHAP 6 saja.
(a) Backup: satu tombol yang menyimpan file database SQLite dan folder gambar ke satu file ZIP bertanggal di folder pilihan, plus fitur Restore dari ZIP itu.
(b) Bungkus aplikasi dengan Electron supaya berjalan sebagai aplikasi desktop di Windows tanpa membuka browser atau mengetik perintah. Data disimpan di folder yang mudah ditemukan.
(c) Tulis README.md berbahasa Indonesia berisi cara memasang, menjalankan, dan backup, untuk sekretaris berikutnya.
Jelaskan cara menguji.
```

**Kalau agent melenceng**

- Agent mengerjakan fitur di luar tahap: minta batalkan, atau kembali ke commit terakhir (`git checkout .`), lalu ulangi prompt dengan kalimat tambahan "jangan menambah fitur di luar tahap ini".
- Ada error: tempel pesan error lengkap, jangan diringkas, dan sebutkan langkah yang kamu lakukan saat error muncul.
- Hasil export Word atau cetak berbeda dari layar: kirim tangkapan layar keduanya dan minta agent membandingkan.
- Sesi terasa kacau atau terlalu panjang: mulai sesi baru, awali dengan "Baca PROJECT.md dulu", dan sebutkan tahap yang sedang dikerjakan.

## Risiko dan hal yang masih terbuka

**Risiko**

- **Editor ala Word adalah bagian tersulit.** Tampilan halaman F4 yang sama persis di layar, PDF, dan Wordjadi  sulit dicapai; tabel dan gambar paling sering bergeser saat export. Uji export ke Word sejak tahap 2.
- **Satu komputer berarti satu titik gagal.** Tanpa backup rutin, kerusakan disk atau komputer hilang berarti arsip hilang.
- **Satu akun admin.** Siapa pun yang tahu kata sandinya bisa mengubah data apa pun; tidak ada catatan siapa yang mengubah.

**Hal yang perlu dipastikan**

- [ ] Contoh surat, proposal, dan LPJ yang sekarang dipakai rayon, untuk dijadikan template pertama
- [ ] Format nomor surat yang berlaku di rayon
- [ ] Daftar kolom biodata kader yang benar-benar dibutuhkan
- [ ] Daftar jenjang kaderisasi yang dicatat
- [ ] Pilihan teknologi, sesuai bahasa pemrograman yang kamu kuasai
