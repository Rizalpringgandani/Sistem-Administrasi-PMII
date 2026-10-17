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
    nama_komisariat,
    nama_cabang,
    kampus,
    alamat_sekretariat,
    email_rayon,
    telepon_rayon,
    kode_rayon,
    format_nomor_surat
  } = req.body;

  if (!nama_rayon || !nama_komisariat || !nama_cabang) {
    req.session.flash = { error: 'Nama Rayon, Komisariat, dan Pengurus Cabang wajib diisi.' };
    return res.redirect('/pengaturan');
  }

  setMultiplePengaturan({
    nama_rayon,
    nama_komisariat,
    nama_cabang,
    kampus,
    alamat_sekretariat,
    email_rayon,
    telepon_rayon,
    kode_rayon,
    format_nomor_surat
  });

  req.session.flash = { success: 'Data identitas rayon berhasil disimpan.' };
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
