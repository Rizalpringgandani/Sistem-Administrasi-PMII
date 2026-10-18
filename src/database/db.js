const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const bcrypt = require('bcryptjs');

// Pastikan folder data tersedia
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Pastikan folder upload tersedia
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'administrasi.db');
const db = new DatabaseSync(dbPath);

// Konfigurasi performa & relasi SQLite
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

/**
 * Inisialisasi skema 8 tabel standar sistem administrasi PMII
 */
function inisialisasiDatabase() {
  db.exec(`
    -- 1. Tabel Pengaturan Aplikasi & Organisasi
    CREATE TABLE IF NOT EXISTS pengaturan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kunci TEXT UNIQUE NOT NULL,
      nilai TEXT
    );

    -- 2. Tabel Kader PMII
    CREATE TABLE IF NOT EXISTS kader (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nik TEXT,
      nama_lengkap TEXT NOT NULL,
      jenis_kelamin TEXT CHECK(jenis_kelamin IN ('L', 'P')),
      tempat_lahir TEXT,
      tanggal_lahir TEXT,
      alamat TEXT,
      telepon TEXT,
      email TEXT,
      angkatan_kuliah TEXT,
      jurusan_fakultas TEXT,
      foto TEXT,
      status_keaktifan TEXT DEFAULT 'Aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Tabel Jenjang Kaderisasi Formal
    CREATE TABLE IF NOT EXISTS jenjang (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_jenjang TEXT NOT NULL,
      tingkat INTEGER NOT NULL,
      deskripsi TEXT
    );

    -- 4. Tabel Riwayat Jenjang Kader
    CREATE TABLE IF NOT EXISTS jenjang_kader (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kader_id INTEGER NOT NULL REFERENCES kader(id) ON DELETE CASCADE,
      jenjang_id INTEGER NOT NULL REFERENCES jenjang(id) ON DELETE CASCADE,
      tahun INTEGER,
      penyelenggara TEXT,
      nomor_sertifikat TEXT,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Tabel Periode Kepengurusan
    CREATE TABLE IF NOT EXISTS periode (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tahun_mulai INTEGER NOT NULL,
      tahun_selesai INTEGER NOT NULL,
      nama_periode TEXT NOT NULL,
      ketua_rayon TEXT,
      sekretaris_rayon TEXT,
      status_aktif INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Tabel Jabatan Pengurus per Periode
    CREATE TABLE IF NOT EXISTS jabatan_kader (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kader_id INTEGER NOT NULL REFERENCES kader(id) ON DELETE CASCADE,
      periode_id INTEGER NOT NULL REFERENCES periode(id) ON DELETE CASCADE,
      nama_jabatan TEXT NOT NULL,
      kategori_jabatan TEXT,
      urutan INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Tabel Template Dokumen (Surat, Proposal, LPJ)
    CREATE TABLE IF NOT EXISTS template (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT UNIQUE NOT NULL,
      judul TEXT NOT NULL,
      jenis TEXT NOT NULL, -- 'surat_keluar', 'proposal', 'lpj'
      kategori TEXT,
      konten_html TEXT,
      variabel_daftar TEXT, -- Format JSON string
      is_bawaan INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Tabel Dokumen dan Arsip Surat/Proposal/LPJ
    CREATE TABLE IF NOT EXISTS dokumen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor_dokumen TEXT,
      judul TEXT NOT NULL,
      jenis TEXT NOT NULL, -- 'surat_keluar', 'surat_masuk', 'proposal', 'lpj'
      kategori TEXT,
      template_id INTEGER REFERENCES template(id) ON DELETE SET NULL,
      tanggal_dokumen TEXT,
      tujuan TEXT,
      perihal TEXT,
      ringkasan TEXT,
      konten_html TEXT,
      file_path TEXT,
      status TEXT DEFAULT 'draft', -- 'draft', 'terbit', 'diarsipkan'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrasi aman untuk kolom konten_json dan kolom terpisah penomoran pada template dan dokumen
  const templateCols = db.prepare('PRAGMA table_info(template)').all().map(c => c.name);
  if (!templateCols.includes('konten_json')) {
    db.exec('ALTER TABLE template ADD COLUMN konten_json TEXT;');
  }

  const dokumenCols = db.prepare('PRAGMA table_info(dokumen)').all().map(c => c.name);
  if (!dokumenCols.includes('konten_json')) {
    db.exec('ALTER TABLE dokumen ADD COLUMN konten_json TEXT;');
  }
  if (!dokumenCols.includes('no_urut_total')) {
    db.exec('ALTER TABLE dokumen ADD COLUMN no_urut_total INTEGER;');
  }
  if (!dokumenCols.includes('no_urut_jenis')) {
    db.exec('ALTER TABLE dokumen ADD COLUMN no_urut_jenis INTEGER;');
  }
  if (!dokumenCols.includes('sifat_surat')) {
    db.exec("ALTER TABLE dokumen ADD COLUMN sifat_surat TEXT DEFAULT '01';");
  }
  if (!dokumenCols.includes('kode_penandatangan')) {
    db.exec("ALTER TABLE dokumen ADD COLUMN kode_penandatangan TEXT DEFAULT 'A-I';");
  }
  if (!dokumenCols.includes('nama_panitia')) {
    db.exec('ALTER TABLE dokumen ADD COLUMN nama_panitia TEXT;');
  }
  if (!dokumenCols.includes('bulan_surat')) {
    db.exec('ALTER TABLE dokumen ADD COLUMN bulan_surat TEXT;');
  }
  if (!dokumenCols.includes('tahun_surat')) {
    db.exec('ALTER TABLE dokumen ADD COLUMN tahun_surat INTEGER;');
  }

  seedingDataAwal();
}

/**
 * Menanamkan data bawaan (seeding) jika database masih kosong
 */
function seedingDataAwal() {
  // 1. Password Admin Awal (default: admin123)
  const passAdmin = getPengaturan('admin_password');
  if (!passAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    setPengaturan('admin_password', hash);
  }

  // 2. Pengaturan Default Rayon Sesuai Pedoman Surat Resmi PMII
  const defaultPengaturan = {
    'nama_rayon': 'Rayon Fakultas Ekonomi Dan Bisnis',
    'kop_tingkat': 'PENGURUS RAYON',
    'kop_lembaga': 'PERGERAKAN MAHASISWA ISLAM INDONESIA',
    'kop_inggris': '(Rayon Board Of Indonesian Moslem Student Movement)',
    'nama_fakultas': 'FAKULTAS EKONOMI DAN BISNIS',
    'nama_komisariat': 'Komisariat Universitas Pelita Bangsa',
    'nama_komisariat_univ': 'KOMISARIAT UNIVERSITAS PELITA BANGSA',
    'nama_cabang': 'PC PMII Kab. Bekasi',
    'kampus': 'Universitas Pelita Bangsa',
    'alamat_sekretariat': 'Jl. Kp. Tegal Danas No.42, RT.1/RW.1, Jayamukti, Cikarang Pusat, Bekasi',
    'telepon_rayon': '087844241717, 081398946634',
    'email_rayon': 'rayonfebupb@gmail.com',
    'kode_wilayah': 'V-02',
    'kode_rayon': 'PR-IV',
    'motto_kop': 'Dzikir, Fikir, Amal Sholeh',
    'sertakan_kode_kabupaten': '0',
    'kode_kabupaten': '',
    'reset_penomoran': 'tahunan', // 'tahunan', 'periode', 'tidak_pernah'
    'logo_rayon': '',
    'logo_pmii': '/img/pmii-logo.png',
    'format_nomor_surat': '{no_total}.{panitia}{rayon}.{wilayah}.{kabupaten}{jenis}.{no_jenis}.{ttd}.{bulan}.{tahun}'
  };

  for (const [kunci, nilai] of Object.entries(defaultPengaturan)) {
    if (getPengaturan(kunci) === null) {
      setPengaturan(kunci, nilai);
    }
  }

  // 3. Jenjang Kaderisasi Baku PMII
  const countJenjang = db.prepare('SELECT COUNT(*) as count FROM jenjang').get();
  if (countJenjang.count === 0) {
    const insertJenjang = db.prepare(`
      INSERT INTO jenjang (nama_jenjang, tingkat, deskripsi)
      VALUES (?, ?, ?)
    `);

    insertJenjang.run('Mapaba', 1, 'Masa Penerimaan Anggota Baru (Kader Formal Tingkat 1)');
    insertJenjang.run('PKD', 2, 'Pelatihan Kader Dasar (Kader Formal Tingkat 2)');
    insertJenjang.run('PKL', 3, 'Pelatihan Kader Lanjut (Kader Formal Tingkat 3)');
    insertJenjang.run('PKN', 4, 'Pelatihan Kader Nasional (Kader Formal Tingkat 4)');
  }

  // 4. Periode Default Aktif jika belum ada
  const countPeriode = db.prepare('SELECT COUNT(*) as count FROM periode').get();
  if (countPeriode.count === 0) {
    const insertPeriode = db.prepare(`
      INSERT INTO periode (tahun_mulai, tahun_selesai, nama_periode, ketua_rayon, sekretaris_rayon, status_aktif)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    const tahunSekarang = new Date().getFullYear();
    insertPeriode.run(
      tahunSekarang,
      tahunSekarang + 1,
      `${tahunSekarang}-${tahunSekarang + 1}`,
      'Sahabat Ketua Rayon',
      'Sahabat Sekretaris Rayon'
    );
  }

  // 5. Template Surat Resmi Bawaan PMII (Diadaptasi dari Pedoman Surat & Contoh Asli Rayon)
  const insertTemplate = db.prepare(`
    INSERT INTO template (kode, judul, jenis, kategori, konten_html, konten_json, variabel_daftar, is_bawaan)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);
  const checkTemplate = db.prepare('SELECT id FROM template WHERE kode = ?');

  // Template 0: Surat Pemberitahuan RTAR Ke-V dengan Lampiran Susunan Acara (Contoh Asli Rayon)
  if (!checkTemplate.get('TPL-PEMBERITAHUAN-01')) {
    const tplPemberitahuanJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: 'No.\t: ' },
            { type: 'text', text: '{{nomor_surat}}' },
            { type: 'text', text: '\nLamp.\t: {{lampiran}}\nHal.\t: ' },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{perihal}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: 'Kepada Yth,\n' },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{tujuan}}\n' },
            { type: 'text', text: 'Di –\nTempat' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: "Assalamu’alaikum Warahmatullahi Wabarakatuh" }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: "Salam silaturrahim teriring do’a kami sampaikan semoga Sahabat senantiasa berada dalam lindungan-Nya serta dimudahkan dalam menjalankan aktifitas keseharian. Aamiin." }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: "Sehubungan akan diselenggarakannya " },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{nama_kegiatan}}' },
            { type: 'text', text: ' oleh Pengurus Rayon Pergerakan Mahasiswa Islam Indonesia Fakultas Ekonomi dan Bisnis Universitas Pelita Bangsa, yang insyaallah akan dilaksanakan pada:' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Hari/Tanggal' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: ': {{hari_tanggal}}' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Waktu' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: ': {{waktu}}' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Tempat' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: ': {{tempat}}' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Tema' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: ': "{{tema}}"' }] }] }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: 'Oleh karena itu, kami selaku Pengurus Rayon Pergerakan Mahasiswa Islam Indonesia Fakultas Ekonomi dan Bisnis Universitas Pelita Bangsa, bermaksud memberitahukan kegiatan demi suksesnya acara tersebut.' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: 'Demikian surat pemberitahuan ini kami buat. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: 'Wallahul Muwaffieq Ilaa Aqwamith Tharieq,\nWassalamu’alaikum Warahmatullahi Wabarakatuh.' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: '{{tempat_surat}}, {{tanggal_surat}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: 'Mengetahui,\n' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'PENGURUS RAYON\nPERGERAKAN MAHASISWA ISLAM INDONESIA\nFAKULTAS EKONOMI DAN BISNIS\nKOMISARIAT UNIVERSITAS PELITA BANGSA' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [
                    { type: 'paragraph', attrs: { textAlign: 'left' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_ketua}}' }] },
                    { type: 'paragraph', attrs: { textAlign: 'left' }, content: [{ type: 'text', text: 'Ketua' }] }
                  ]
                },
                {
                  type: 'tableCell',
                  content: [
                    { type: 'paragraph', attrs: { textAlign: 'left' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_sekretaris}}' }] },
                    { type: 'paragraph', attrs: { textAlign: 'left' }, content: [{ type: 'text', text: 'Sekretaris' }] }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'horizontalRule'
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }], text: 'Lampiran I' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'SUSUNAN ACARA\n' },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{nama_kegiatan}}' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Hari/Tanggal' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Waktu' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Acara' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Penanggung Jawab' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sabtu, 24 Oktober 2026' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '09.00 – 10.00' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Registrasi' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Panitia' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sabtu, 24 Oktober 2026' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '10.00 – 10.15' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pembukaan' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'MC' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sabtu, 24 Oktober 2026' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '10.15 – 10.30' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pembacaan Ayat Suci Al-Qur’an' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dirigen : Aribah Fadiah' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sabtu, 24 Oktober 2026' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '10.30 – 11.00' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Menyanyikan Lagu:\nIndonesia Raya\nMars PMII\nSubbanul Wathon' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ALL' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sabtu, 24 Oktober 2026' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '11.00 – 12.45' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sambutan – Sambutan' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ketua Panitia & Pengurus' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Minggu, 25 Oktober 2026' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '02.00 – 02.30' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'PENUTUPAN' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ALL' }] }] }
              ]
            }
          ]
        }
      ]
    };

    const varsPemberitahuan = ['nomor_surat', 'lampiran', 'perihal', 'tujuan', 'nama_kegiatan', 'hari_tanggal', 'waktu', 'tempat', 'tema', 'tempat_surat', 'tanggal_surat', 'nama_ketua', 'nama_sekretaris'];

    insertTemplate.run(
      'TPL-PEMBERITAHUAN-01',
      'Surat Pemberitahuan Kegiatan & Lampiran Acara',
      'surat_keluar',
      'Pemberitahuan',
      '',
      JSON.stringify(tplPemberitahuanJson),
      JSON.stringify(varsPemberitahuan)
    );
  }

  // Template 1: Surat Undangan
  if (!checkTemplate.get('TPL-UND-01')) {
    const tplUndanganJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: 'Nomor\t: ' },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{nomor_surat}}' },
            { type: 'text', text: '\nLampiran\t: {{lampiran}}\nPerihal\t: ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'UNDANGAN {{nama_kegiatan}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [
            { type: 'text', text: '{{tempat_surat}}, {{tanggal_surat}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: 'Kepada Yth.\n' },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{tujuan}}\n' },
            { type: 'text', text: 'di -\n\t{{tempat_tujuan}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: "Assalamu'alaikum Warahmatullahi Wabarakatuh" }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: "Salam silaturrahim teriring do'a kami sampaikan semoga Sahabat/i senantiasa dalam lindungan Allah SWT serta eksis dalam menjalankan aktivitas keseharian. Aamiin." }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: "Sehubungan dengan akan diselenggarakannya agenda " },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{nama_kegiatan}}' },
            { type: 'text', text: ' oleh Pengurus Rayon Pergerakan Mahasiswa Islam Indonesia (PMII), maka dengan ini kami mengundang Sahabat/i untuk dapat hadir pada:' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Hari, Tanggal' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '{{hari_tanggal}}' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Waktu' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '{{waktu}} WIB s/d Selesai' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Tempat' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '{{tempat}}' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Acara' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '{{nama_kegiatan}}' }] }] }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: 'Demikian surat undangan ini kami sampaikan. Atas perhatian, perkenan, dan kehadiran Sahabat/i kami ucapkan banyak terima kasih.' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: 'Wallahul Muwaffiq Ila Aqwamith Tharieq\nWassalamu’alaikum Warahmatullahi Wabarakatuh' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Ketua Rayon' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '\n\n\n' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_ketua}}' }] }
                  ]
                },
                {
                  type: 'tableCell',
                  content: [
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Sekretaris Rayon' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '\n\n\n' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_sekretaris}}' }] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    const varsUndangan = ['nomor_surat', 'lampiran', 'nama_kegiatan', 'tempat_surat', 'tanggal_surat', 'tujuan', 'tempat_tujuan', 'hari_tanggal', 'waktu', 'tempat', 'nama_ketua', 'nama_sekretaris'];

    insertTemplate.run(
      'TPL-UND-01',
      'Surat Undangan Resmi Kegiatan',
      'surat_keluar',
      'Undangan',
      '',
      JSON.stringify(tplUndanganJson),
      JSON.stringify(varsUndangan)
    );

    // Template 2: Permohonan Peminjaman Tempat
    const tplMohonJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: 'Nomor\t: ' },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{nomor_surat}}' },
            { type: 'text', text: '\nLampiran\t: {{lampiran}}\nPerihal\t: ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'PERMOHONAN IZIN TEMPAT {{nama_kegiatan}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'right' },
          content: [
            { type: 'text', text: '{{tempat_surat}}, {{tanggal_surat}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', text: 'Kepada Yth.\n' },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{tujuan}}\n' },
            { type: 'text', text: 'di -\n\t{{tempat_tujuan}}' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: "Assalamu'alaikum Warahmatullahi Wabarakatuh" }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: "Salam silaturrahim teriring do'a kami sampaikan semoga Bapak/Ibu senantiasa dalam lindungan Allah SWT serta dimudahkan dalam setiap aktivitas. Aamiin." }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: "Sehubungan dengan pelaksanaan kegiatan " },
            { type: 'text', marks: [{ type: 'bold' }], text: '{{nama_kegiatan}}' },
            { type: 'text', text: ' oleh Pengurus Rayon PMII, maka dengan ini kami memohon izin penggunaan fasilitas tempat pada:' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Hari, Tanggal' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '{{hari_tanggal}}' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Waktu' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '{{waktu}} WIB s/d Selesai' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Tempat / Ruangan' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '{{tempat}}' }] }] }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: 'Demikian permohonan ini kami sampaikan. Besar harapan kami atas perkenan dan izin Bapak/Ibu. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.' }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'left' },
          content: [
            { type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: 'Wallahul Muwaffiq Ila Aqwamith Tharieq\nWassalamu’alaikum Warahmatullahi Wabarakatuh' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  content: [
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Ketua Rayon' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '\n\n\n' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_ketua}}' }] }
                  ]
                },
                {
                  type: 'tableCell',
                  content: [
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Sekretaris Rayon' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '\n\n\n' }] },
                    { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_sekretaris}}' }] }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    const varsMohon = ['nomor_surat', 'lampiran', 'nama_kegiatan', 'tempat_surat', 'tanggal_surat', 'tujuan', 'tempat_tujuan', 'hari_tanggal', 'waktu', 'tempat', 'nama_ketua', 'nama_sekretaris'];

    insertTemplate.run(
      'TPL-MOHON-01',
      'Surat Permohonan Izin Tempat & Fasilitas',
      'surat_keluar',
      'Permohonan',
      '',
      JSON.stringify(tplMohonJson),
      JSON.stringify(varsMohon)
    );
  }
}

/**
 * Mengambil satu nilai pengaturan berdasarkan kunci
 */
function getPengaturan(kunci, nilaiBawaan = null) {
  const row = db.prepare('SELECT nilai FROM pengaturan WHERE kunci = ?').get(kunci);
  return row ? row.nilai : nilaiBawaan;
}

/**
 * Mengambil semua pengaturan dalam bentuk objek key-value
 */
function getAllPengaturan() {
  const rows = db.prepare('SELECT kunci, nilai FROM pengaturan').all();
  const result = {};
  for (const row of rows) {
    result[row.kunci] = row.nilai;
  }
  return result;
}

/**
 * Menyimpan atau memperbarui pengaturan
 */
function setPengaturan(kunci, nilai) {
  const stmt = db.prepare(`
    INSERT INTO pengaturan (kunci, nilai)
    VALUES (?, ?)
    ON CONFLICT(kunci) DO UPDATE SET nilai = excluded.nilai
  `);
  stmt.run(kunci, nilai);
}

/**
 * Menyimpan banyak pengaturan sekaligus
 */
function setMultiplePengaturan(obj) {
  const stmt = db.prepare(`
    INSERT INTO pengaturan (kunci, nilai)
    VALUES (?, ?)
    ON CONFLICT(kunci) DO UPDATE SET nilai = excluded.nilai
  `);

  for (const [kunci, nilai] of Object.entries(obj)) {
    stmt.run(kunci, nilai !== undefined && nilai !== null ? String(nilai) : '');
  }
}

/**
 * Konversi indeks bulan ke angka Romawi
 */
function toAngkaRomawi(bulanIndex) {
  const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romawi[bulanIndex] || 'I';
}

/**
 * Usulkan nomor surat resmi PMII sesuai Pedoman Penyelenggaraan Tertib Administrasi (PPTA):
 * Format Rayon: [No_Total].[Panitia].[Tingkat_Periode].[Wilayah].[Jenis].[No_Jenis].[Kode_Ttd].[Bulan].[Tahun]
 * Contoh Rayon: 023.PR-IV.V-02.01.023.A-I.10.2026
 * Dua penghitung terpisah:
 *  1. no_urut_total (semua surat keluar internal dan eksternal digabung)
 *  2. no_urut_jenis (nomor urut khusus internal 01 atau eksternal 02)
 */
function generateNomorSuratPedoman({
  sifatSurat = '01', // '01' = internal, '02' = eksternal
  kodePenandatangan = 'A-I',
  namaPanitia = '',
  tanggal = null
} = {}) {
  const format = getPengaturan(
    'format_nomor_surat',
    '{no_total}.{panitia}{rayon}.{wilayah}.{kabupaten}{jenis}.{no_jenis}.{ttd}.{bulan}.{tahun}'
  );

  const dateObj = tanggal ? new Date(tanggal) : new Date();
  const tahunSekarang = dateObj.getFullYear();
  const bulanDigit = String(dateObj.getMonth() + 1).padStart(2, '0');
  const kodeRayon = getPengaturan('kode_rayon', 'PR-IV');
  const kodeWilayah = getPengaturan('kode_wilayah', 'V-02');
  const sertakanKab = getPengaturan('sertakan_kode_kabupaten', '0') === '1';
  const kodeKab = sertakanKab ? (getPengaturan('kode_kabupaten', '') ? getPengaturan('kode_kabupaten') + '.' : '') : '';
  const resetMode = getPengaturan('reset_penomoran', 'tahunan');

  let filterWaktuTotal = '';
  let filterWaktuJenis = '';
  let paramsTotal = [];
  let paramsJenis = [sifatSurat];

  if (resetMode === 'tahunan') {
    filterWaktuTotal = ` AND (strftime('%Y', created_at) = ? OR tanggal_dokumen LIKE ? OR tahun_surat = ?) `;
    paramsTotal.push(String(tahunSekarang), `%${tahunSekarang}%`, tahunSekarang);
    filterWaktuJenis = ` AND (strftime('%Y', created_at) = ? OR tanggal_dokumen LIKE ? OR tahun_surat = ?) `;
    paramsJenis.push(String(tahunSekarang), `%${tahunSekarang}%`, tahunSekarang);
  } else if (resetMode === 'periode') {
    const activePeriode = db.prepare('SELECT tahun_mulai, tahun_selesai FROM periode WHERE status_aktif = 1 LIMIT 1').get();
    if (activePeriode) {
      filterWaktuTotal = ` AND tahun_surat >= ? AND tahun_surat <= ? `;
      paramsTotal.push(activePeriode.tahun_mulai, activePeriode.tahun_selesai);
      filterWaktuJenis = ` AND tahun_surat >= ? AND tahun_surat <= ? `;
      paramsJenis.push(activePeriode.tahun_mulai, activePeriode.tahun_selesai);
    }
  }

  // 1. Hitung No Urut Total (seluruh surat keluar)
  const rowTotal = db.prepare(`
    SELECT MAX(no_urut_total) as max_total, COUNT(*) as count_total 
    FROM dokumen 
    WHERE jenis = 'surat_keluar' ${filterWaktuTotal}
  `).get(...paramsTotal);

  const urutTotal = Math.max(rowTotal?.max_total || 0, rowTotal?.count_total || 0) + 1;
  const noTotalFormatted = String(urutTotal).padStart(3, '0');

  // 2. Hitung No Urut Jenis (hanya jenis yang sama: 01 atau 02)
  const rowJenis = db.prepare(`
    SELECT MAX(no_urut_jenis) as max_jenis, COUNT(*) as count_jenis 
    FROM dokumen 
    WHERE jenis = 'surat_keluar' AND (sifat_surat = ? OR sifat_surat IS NULL) ${filterWaktuJenis}
  `).get(...paramsJenis);

  const urutJenis = Math.max(rowJenis?.max_jenis || 0, rowJenis?.count_jenis || 0) + 1;
  const noJenisFormatted = String(urutJenis).padStart(3, '0');

  const panitiaStr = namaPanitia && namaPanitia.trim() ? `${namaPanitia.trim()}.` : '';

  let nomor = format
    .replace('{no_total}', noTotalFormatted)
    .replace('{panitia}', panitiaStr)
    .replace('{rayon}', kodeRayon)
    .replace('{wilayah}', kodeWilayah)
    .replace('{kabupaten}', kodeKab)
    .replace('{jenis}', sifatSurat)
    .replace('{no_jenis}', noJenisFormatted)
    .replace('{ttd}', kodePenandatangan)
    .replace('{bulan}', bulanDigit)
    .replace('{tahun}', String(tahunSekarang));

  // Fallback jika format lama masih terpakai di pengaturan
  if (nomor.includes('{no}') || nomor.includes('{romawi}')) {
    nomor = `${noTotalFormatted}.${panitiaStr}${kodeRayon}.${kodeWilayah}.${kodeKab}${sifatSurat}.${noJenisFormatted}.${kodePenandatangan}.${bulanDigit}.${tahunSekarang}`;
  }

  return {
    nomor,
    no_urut_total: urutTotal,
    no_urut_jenis: urutJenis,
    sifat_surat: sifatSurat,
    kode_penandatangan: kodePenandatangan,
    nama_panitia: namaPanitia,
    bulan_surat: bulanDigit,
    tahun_surat: tahunSekarang,
    tahun: String(tahunSekarang),
    urut: urutTotal,
    format
  };
}

/**
 * Usulkan nomor surat otomatis - Wrapper kompatibilitas
 */
function generateNomorSurat(kodeKategori = '01') {
  const sifatSurat = kodeKategori === '02' ? '02' : '01';
  return generateNomorSuratPedoman({ sifatSurat });
}

/**
 * Ekstraksi variabel {{nama_variabel}} dari objek TipTap JSON atau string
 */
function extractVariablesFromTipTap(node, vars = new Set()) {
  if (!node) return Array.from(vars);
  if (typeof node === 'string') {
    const matches = node.match(/\{\{([a-zA-Z0-9_\-]+)\}\}/g);
    if (matches) {
      matches.forEach(m => vars.add(m.replace(/[{}]/g, '')));
    }
    return Array.from(vars);
  }
  if (node.text) {
    const matches = node.text.match(/\{\{([a-zA-Z0-9_\-]+)\}\}/g);
    if (matches) {
      matches.forEach(m => vars.add(m.replace(/[{}]/g, '')));
    }
  }
  if (Array.isArray(node.content)) {
    node.content.forEach(child => extractVariablesFromTipTap(child, vars));
  }
  return Array.from(vars);
}

/**
 * Menggantikan variabel {{nama_variabel}} di seluruh node TipTap JSON secara rekursif
 */
function replaceVariablesInTipTapJson(node, values = {}) {
  if (!node) return node;
  const clone = JSON.parse(JSON.stringify(node));

  function traverse(n) {
    if (n.text) {
      for (const [key, val] of Object.entries(values)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        n.text = n.text.replace(regex, val !== undefined && val !== null ? String(val) : '');
      }
    }
    if (Array.isArray(n.content)) {
      n.content.forEach(traverse);
    }
  }

  traverse(clone);
  return clone;
}

// Inisialisasi basis data secara otomatis saat modul dimuat
inisialisasiDatabase();

module.exports = {
  db,
  inisialisasiDatabase,
  getPengaturan,
  getAllPengaturan,
  setPengaturan,
  setMultiplePengaturan,
  toAngkaRomawi,
  generateNomorSurat,
  generateNomorSuratPedoman,
  extractVariablesFromTipTap,
  replaceVariablesInTipTapJson
};
