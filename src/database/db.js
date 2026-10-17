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

  // Migrasi aman untuk kolom konten_json pada template dan dokumen
  const templateCols = db.prepare('PRAGMA table_info(template)').all().map(c => c.name);
  if (!templateCols.includes('konten_json')) {
    db.exec('ALTER TABLE template ADD COLUMN konten_json TEXT;');
  }

  const dokumenCols = db.prepare('PRAGMA table_info(dokumen)').all().map(c => c.name);
  if (!dokumenCols.includes('konten_json')) {
    db.exec('ALTER TABLE dokumen ADD COLUMN konten_json TEXT;');
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

  // 2. Pengaturan Default Rayon
  const defaultPengaturan = {
    'nama_rayon': 'Rayon Pancasila',
    'nama_komisariat': 'Komisariat Raden Rahmat',
    'nama_cabang': 'PC PMII Kota',
    'kampus': 'Universitas Islam Nusantara',
    'alamat_sekretariat': 'Jl. Pergerakan No. 1960',
    'email_rayon': 'rayon.pmii@email.local',
    'telepon_rayon': '081234567890',
    'kode_rayon': 'PR-PMII',
    'logo_rayon': '',
    'logo_pmii': '/img/pmii-logo.svg',
    'format_nomor_surat': '{no}/{kd}/{rayon}/PMII/{romawi}/{tahun}'
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

  // 5. Template Surat Resmi Bawaan PMII
  const countTemplate = db.prepare('SELECT COUNT(*) as count FROM template').get();
  if (countTemplate.count === 0) {
    const insertTemplate = db.prepare(`
      INSERT INTO template (kode, judul, jenis, kategori, konten_html, konten_json, variabel_daftar, is_bawaan)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    // Template 1: Surat Undangan
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
 * Usulkan nomor surat otomatis sesuai format di pengaturan dan nomor urut tahun ini
 */
function generateNomorSurat(kodeKategori = '01') {
  const format = getPengaturan('format_nomor_surat', '{no}/{kd}/{rayon}/PMII/{romawi}/{tahun}');
  const now = new Date();
  const tahunSekarang = String(now.getFullYear());
  const bulanRomawi = toAngkaRomawi(now.getMonth());
  const kodeRayon = getPengaturan('kode_rayon', 'PR-PMII');

  // Hitung jumlah surat keluar yang terdaftar pada tahun berjalan
  const row = db.prepare(`
    SELECT COUNT(*) as total 
    FROM dokumen 
    WHERE jenis = 'surat_keluar' 
    AND (strftime('%Y', created_at) = ? OR tanggal_dokumen LIKE ?)
  `).get(tahunSekarang, `%${tahunSekarang}%`);

  const urut = (row ? row.total : 0) + 1;
  const noFormatted = String(urut).padStart(3, '0');

  const nomor = format
    .replace('{no}', noFormatted)
    .replace('{kd}', kodeKategori)
    .replace('{rayon}', kodeRayon)
    .replace('{romawi}', bulanRomawi)
    .replace('{tahun}', tahunSekarang);

  return {
    nomor,
    urut,
    tahun: tahunSekarang,
    format
  };
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
  extractVariablesFromTipTap,
  replaceVariablesInTipTapJson
};
