const express = require('express');
const router = express.Router();
const path = require('node:path');
const multer = require('multer');
const { getAllPengaturan, setMultiplePengaturan, setPengaturan } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { renderLayout } = require('../views/layout');
const { renderPengaturanPage } = require('../views/pengaturan');

// Konfigurasi Multer untuk penyimpanan logo rayon lokal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now();
    cb(null, `logo-rayon-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file logo harus berupa PNG, JPG, atau JPEG.'));
    }
  }
});

/**
 * Halaman Pengaturan Rayon
 */
router.get('/pengaturan', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  const content = renderPengaturanPage({ settings });
  const html = renderLayout({
    title: 'Pengaturan Rayon',
    activeMenu: 'pengaturan',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * Simpan Perubahan Identitas Rayon
 */
router.post('/pengaturan', requireAuth, (req, res) => {
  const {
    nama_rayon,
    kop_tingkat,
    kop_lembaga,
    kop_inggris,
    nama_fakultas,
    nama_komisariat,
    nama_komisariat_univ,
    nama_cabang,
    kampus,
    alamat_sekretariat,
    email_rayon,
    telepon_rayon,
    kode_rayon,
    kode_wilayah,
    motto_kop,
    sertakan_kode_kabupaten,
    kode_kabupaten,
    reset_penomoran,
    format_nomor_surat
  } = req.body;

  if (!nama_rayon || !nama_komisariat || !nama_cabang) {
    req.session.flash = { error: 'Nama Rayon, Komisariat, dan Pengurus Cabang wajib diisi.' };
    return res.redirect('/pengaturan');
  }

  setMultiplePengaturan({
    nama_rayon,
    kop_tingkat: kop_tingkat || 'PENGURUS RAYON',
    kop_lembaga: kop_lembaga || 'PERGERAKAN MAHASISWA ISLAM INDONESIA',
    kop_inggris: kop_inggris || '(Rayon Board Of Indonesian Moslem Student Movement)',
    nama_fakultas: nama_fakultas || '',
    nama_komisariat,
    nama_komisariat_univ: nama_komisariat_univ || '',
    nama_cabang,
    kampus: kampus || '',
    alamat_sekretariat: alamat_sekretariat || '',
    email_rayon: email_rayon || '',
    telepon_rayon: telepon_rayon || '',
    kode_rayon: kode_rayon || 'PR-IV',
    kode_wilayah: kode_wilayah || 'V-02',
    motto_kop: motto_kop || 'Dzikir, Fikir, Amal Sholeh',
    sertakan_kode_kabupaten: sertakan_kode_kabupaten === '1' ? '1' : '0',
    kode_kabupaten: kode_kabupaten || '',
    reset_penomoran: reset_penomoran || 'tahunan',
    format_nomor_surat: format_nomor_surat || '{no_total}.{panitia}{rayon}.{wilayah}.{kabupaten}{jenis}.{no_jenis}.{ttd}.{bulan}.{tahun}'
  });

  req.session.flash = { success: 'Data identitas rayon & pengaturan persuratan berhasil disimpan.' };
  res.redirect('/pengaturan');
});

/**
 * Unggah Logo Rayon
 */
router.post('/pengaturan/logo', requireAuth, (req, res) => {
  upload.single('logo_rayon')(req, res, function (err) {
    if (err) {
      req.session.flash = { error: err.message || 'Gagal mengunggah logo rayon.' };
      return res.redirect('/pengaturan');
    }

    if (!req.file) {
      req.session.flash = { error: 'Silakan pilih berkas logo terlebih dahulu.' };
      return res.redirect('/pengaturan');
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    setPengaturan('logo_rayon', logoUrl);

    req.session.flash = { success: 'Logo rayon berhasil diperbarui.' };
    res.redirect('/pengaturan');
  });
});

module.exports = router;
