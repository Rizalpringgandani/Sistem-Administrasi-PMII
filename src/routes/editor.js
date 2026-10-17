const express = require('express');
const router = express.Router();
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { getAllPengaturan } = require('../database/db');
const { renderLayout } = require('../views/layout');
const { renderEditorPage } = require('../views/editor');

// Pastikan folder uploads/editor dan folder data ada
const editorUploadDir = path.join(__dirname, '../../public/uploads/editor');
if (!fs.existsSync(editorUploadDir)) {
  fs.mkdirSync(editorUploadDir, { recursive: true });
}

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const draftFilePath = path.join(dataDir, 'editor_draft.json');

// Konfigurasi Multer untuk Gambar Dokumen Editor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, editorUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-img-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maksimal 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file gambar harus PNG, JPG, JPEG, SVG, atau WebP.'));
    }
  }
});

/**
 * Halaman Editor Dokumen F4
 */
router.get('/editor', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  // Baca draft jika ada
  let savedDraft = null;
  if (fs.existsSync(draftFilePath)) {
    try {
      savedDraft = JSON.parse(fs.readFileSync(draftFilePath, 'utf8'));
    } catch (e) {
      console.error('Gagal membaca editor_draft.json:', e);
    }
  }

  const content = renderEditorPage({
    settings,
    savedDraft
  });

  const html = renderLayout({
    title: 'Editor Dokumen F4',
    activeMenu: 'editor',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * API Simpan Isi Dokumen TipTap (JSON & HTML)
 */
router.post('/api/editor/simpan', requireAuth, (req, res) => {
  const { judul, jsonContent, htmlContent } = req.body;

  if (!jsonContent) {
    return res.status(400).json({ success: false, message: 'Data dokumen tidak boleh kosong.' });
  }

  const draftData = {
    judul: judul || 'Dokumen Tanpa Judul',
    jsonContent: typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent,
    htmlContent: htmlContent || '',
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(draftFilePath, JSON.stringify(draftData, null, 2), 'utf8');
    return res.json({
      success: true,
      message: 'Dokumen berhasil disimpan sebagai JSON TipTap.',
      updatedAt: draftData.updatedAt
    });
  } catch (error) {
    console.error('Gagal menyimpan draft:', error);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan draft dokumen.' });
  }
});

/**
 * API Muat Isi Dokumen Terakhir
 */
router.get('/api/editor/muat', requireAuth, (req, res) => {
  if (fs.existsSync(draftFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(draftFilePath, 'utf8'));
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Gagal membaca file draft.' });
    }
  }
  return res.json({ success: false, message: 'Belum ada draft tersimpan.' });
});

/**
 * API Upload Gambar Lokal untuk Disisipkan ke TipTap
 */
router.post('/api/editor/upload-gambar', requireAuth, (req, res) => {
  upload.single('gambar')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Gagal mengunggah gambar.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah.' });
    }

    const fileUrl = `/uploads/editor/${req.file.filename}`;
    return res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename
    });
  });
});

module.exports = router;
