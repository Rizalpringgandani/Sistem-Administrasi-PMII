# Pedoman Surat (spesifikasi untuk template surat)

Sumber: Pedoman Penyelenggaraan Tertib Administrasi (PPTA), MUSPIMCAB I PC PMII Kabupaten Bekasi, ditambah satu contoh surat rayon yang asli (surat pemberitahuan dengan lampiran susunan acara).
File ini dibaca bersama PROJECT.md. Ikuti persis. Jika ada yang ditandai "BELUM PASTI", jangan menebak: buat nilainya bisa diatur di halaman Pengaturan dan beri nilai awal seperti tertulis.

## Kertas dan tata letak
- Kertas F4, 21 x 33 cm. Margin atas, bawah, kiri, kanan: 2 cm masing-masing.
- Surat umum: bentuk lurus (Full Block Style). Semua baris dari kata pembukaan sampai nama penandatangan rata di tepi yang sama.
- Surat khusus (penetapan keputusan, produk normatif organisasi): bentuk setengah lurus (Semi Block Style). Sama dengan surat umum, tetapi nama penandatangan rata tengah.
- Sifat surat: internal (kode 01) atau eksternal (kode 02).
- Paragraf isi rata kiri-kanan (justify).

## Kop surat
- Logo PMII di kiri, dengan "V-02" di bawahnya. Logo komisariat atau rayon di kanan, dengan nama rayon dalam tulisan kecil di bawahnya.
- Teks di tengah, rata tengah, spasi 1,0.
- Di bawah teks tengah: alamat sekretariat, telepon, dan email (tebal, lebih kecil).
- Garis atas 1 1/2 pt berwarna biru, garis bawah 2 1/4 pt berwarna abu-abu.
- Semua tulisan kop berwarna #51A0D8. V-02 berwarna #51A0D8.
- Kop yang sama muncul di SETIAP halaman (header berulang), termasuk halaman lampiran.
- Kaki setiap halaman: motto "Dzikir, Fikir, Amal Sholeh" (miring, biru, rata tengah). Motto ini bisa diubah di Pengaturan.

Teks kop rayon (isian di Pengaturan, nilai awal dari contoh):
1. PENGURUS RAYON
2. PERGERAKAN MAHASISWA ISLAM INDONESIA
3. (Rayon Board Of Indonesian Moslem Student Movement), miring
4. nama fakultas (huruf kapital)
5. nama komisariat dan universitas (huruf kapital)
6. alamat sekretariat, telepon, email

| Tulisan | Font | Ukuran |
| --- | --- | --- |
| Tingkat kepengurusan dan PERGERAKAN MAHASISWA ISLAM INDONESIA | Arial Narrow Bold | 14 |
| Terjemahan Inggris | Monotype Corsiva, miring | 11 |
| Nama fakultas dan komisariat | Arial Narrow Bold | 14 |
| Alamat sekretariat, telepon, email | Arial Narrow (tebal pada contoh) | 11 |
| V-02 | Arial Narrow Bold | menyesuaikan |

Font: Arial Narrow dan Monotype Corsiva berlisensi dan terpasang bersama Windows atau Microsoft Office. Jangan menyalin file fontnya ke folder proyek. Di CSS pakai urutan cadangan: "Arial Narrow", "Liberation Sans Narrow", sans-serif; untuk Monotype Corsiva cukup font miring biasa sebagai cadangan.

## Urutan isi surat (sesuai contoh surat rayon)
1. Blok No, Lamp, Hal dengan titik dua yang sejajar. Nilai Hal ditulis tebal.
2. "Kepada Yth," lalu nama penerima (tebal), "Di –", "Tempat".
3. Salam pembuka (tebal miring): Assalamualaikum Warahmatullahi Wabarakatuh.
4. Kalimat pengantar. Pedoman: "Salam silaturrahim teriring doa kami sampaikan semoga Bapak/Ibu/Sahabat Senantiasa Dalam LindunganNya, serta dimudahkan dalam menjalankan aktivitas keseharian. Aamiin". Contoh surat rayon memakai versi sedikit berbeda, jadi teks ini HARUS berupa teks template yang bisa diubah, bukan teks terkunci.
5. Maksud surat (isi surat). Rincian acara (Hari/Tanggal, Waktu, Tempat, Tema) berjejer dengan titik dua sejajar.
6. Kata penutup (tebal miring), dengan teks template yang bisa diubah. Pedoman: "Wallahul Muwaffieq Ilaa Aqwamith Tharieq, Wassalamualaikum Warahmatullah Wabarakatuh".
7. Tempat, tanggal, bulan, dan tahun (Masehi), misalnya "Cikarang Pusat, 06 Oktober 2026" (format Indonesia dua digit tanggal).
8. "Mengetahui," lalu nama organisasi (tebal). Ketua dan Sekretaris berdampingan, nama bergaris bawah, jabatan di bawah nama. Tanda tangan dan stempel berupa gambar (PNG transparan) yang menumpuk di atas teks.
9. Lampiran (jika ada) di halaman baru: "Lampiran I" (miring, rata kiri), judul rata tengah tebal, lalu tabel.

Surat dari kepanitiaan, bidang, atau lembaga harus diketahui Ketua Umum (beri tempat "Mengetahui" pada template panitia).

## Nomor surat
Komponen, dipisah titik (bukan garis) antar kode:
1. Nomor urut surat keseluruhan.
2. (surat panitia saja) nama panitia dan kegiatan, misalnya PANPEL-PKL-VI.
3. Tingkat dan periode kepengurusan, misalnya PR-IV (rayon) atau PC-XXXI (cabang).
4. Kode wilayah: V-02 (Jawa Barat).
5. Jenis surat: 01 internal, 02 eksternal.
6. Nomor urut dari jenis surat itu.
7. Kode penandatanganan.
8. Bulan (bilangan bulan, dua digit).
9. Tahun (empat digit).

Kode kabupaten TIDAK dipakai pada nomor rayon (contoh surat rayon tidak memuatnya). Sediakan sebagai pengaturan yang bisa dihidupkan, nilai awal mati.

Contoh surat rayon: `023.PR-IV.V-02.01.023.A-1.10.2026`
- 023 (yang pertama): nomor urut keseluruhan, menghitung semua surat, internal dan eksternal digabung.
- PR-IV: tingkat dan periode. V-02: wilayah. 01: jenis internal.
- 023 (yang kedua): nomor urut khusus jenis itu, yaitu surat internal ke-23. Surat eksternal (02) punya urutannya sendiri.
- A-1: kode penandatanganan. Di sistem dipakai A-I (romawi), sesuai pedoman.
- 10: bulan. 2026: tahun.
- Jadi ada dua penghitung terpisah: satu untuk semua surat, satu per jenis surat.

Contoh lain dari pedoman (cabang dan panitia):
- 076.PC-XXXI.V-02.8.01-053.A-I.01.2025
- 080.PANPEL-PKL-VI.PC-XXXI.V-02.01-053.C-I.01.2025
- 007.PC-VI.V-02.02.003.A-I.09.2024

Kode penandatanganan:
- A-0: Ketua sendiri
- A-I: Ketua dan Sekretaris
- A-II: Ketua dan Wakil Sekretaris
- B-I: Wakil Ketua dan Sekretaris
- B-II: Wakil Ketua dan Wakil Sekretaris
- C-I: Ketua Panitia, Sekretaris Panitia, dan Ketua

## Kebutuhan editor dari contoh surat
- Header dan footer berulang di setiap halaman.
- Tabel dengan sel gabung (baris gabung), warna latar sel (header kuning), garis tabel; juga tabel tanpa garis untuk rincian acara dan kolom tanda tangan.
- Gambar yang bisa diposisikan bebas dan menumpuk di atas teks.
- Rata kiri-kanan, tebal, miring, garis bawah, pindah halaman.
- Isian tanggal berformat Indonesia (nama hari dan bulan dalam bahasa Indonesia).
- Surat contoh ini dipakai sebagai template pertama dan bahan uji: tampilan layar, PDF, cetak, dan export Word harus sama.

## Perilaku sistem
- Formulir surat baru: pilih jenis (internal/eksternal), pilih penandatangan, isi nama panitia dan kegiatan (untuk panitia). Sistem menyusun nomor otomatis dan sekretaris boleh mengubahnya.
- Simpan sebagai kolom terpisah: nomor urut keseluruhan, nomor urut per jenis, kode penandatangan, bulan, tahun.
- Setiap surat yang dibuat otomatis masuk arsip.

## BELUM PASTI (jangan menebak, jadikan pengaturan)
- Kapan kedua penghitung nomor urut (keseluruhan dan per jenis) direset: tiap tahun, tiap periode kepengurusan, atau tidak pernah. Nilai awal: reset tiap tahun, bisa diubah di Pengaturan.

## SUDAH PASTI (dikonfirmasi rayon)
- Kode penandatanganan memakai A-I (romawi), bukan A-1.
- Dua penghitung terpisah: nomor urut keseluruhan (semua surat) dan nomor urut per jenis (internal 01 dan eksternal 02 masing-masing punya urutan sendiri).
- Kode kabupaten tidak dipakai di nomor rayon; pemisah antar kode adalah titik.
