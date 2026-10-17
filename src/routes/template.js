const express = require('express');
const router = express.Router();
const { db, getAllPengaturan, extractVariablesFromTipTap } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { renderLayout } = require('../views/layout');
const { renderTemplateListPage } = require('../views/template_list');
const { renderTemplateEditorPage } = require('../views/template_editor');

/**
 * Daftar Template Surat & Dokumen
 */
router.get('/template', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  const templates = db.prepare('SELECT * FROM template ORDER BY is_bawaan DESC, id ASC').all();

  const content = renderTemplateListPage({
    templates,
    settings
  });

  const html = renderLayout({
    title: 'Kelola Template Surat',
    activeMenu: 'template',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * Halaman Buat Template Baru
 */
router.get('/template/baru', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  const content = renderTemplateEditorPage({
    template: null,
    settings
  });

  const html = renderLayout({
    title: 'Buat Template Surat Baru',
    activeMenu: 'template',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * Halaman Edit Template
 */
router.get('/template/edit/:id', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  const template = db.prepare('SELECT * FROM template WHERE id = ?').get(req.params.id);
  if (!template) {
    req.session.flash = { error: 'Template tidak ditemukan.' };
    return res.redirect('/template');
  }

  const content = renderTemplateEditorPage({
    template,
    settings
  });

  const html = renderLayout({
    title: `Sunting Template: ${template.judul}`,
    activeMenu: 'template',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * Simpan Template (Baru / Edit)
 */
router.post('/template/simpan', requireAuth, (req, res) => {
  const { id, judul, kode, kategori, jenis, jsonContent, htmlContent } = req.body;

  if (!judul || !kode) {
    return res.status(400).json({ success: false, message: 'Judul dan Kode template wajib diisi.' });
  }

  // Ekstraksi variabel penanda otomatis
  const variables = extractVariablesFromTipTap(jsonContent);
  const variabelDaftarStr = JSON.stringify(variables);
  const jsonContentStr = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent);

  try {
    if (id) {
      const stmt = db.prepare(`
        UPDATE template 
        SET judul = ?, kode = ?, kategori = ?, konten_json = ?, konten_html = ?, variabel_daftar = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(judul, kode, kategori || 'Umum', jsonContentStr, htmlContent || '', variabelDaftarStr, id);
      req.session.flash = { success: `Template "${judul}" berhasil diperbarui.` };
      return res.json({ success: true, id });
    } else {
      const stmt = db.prepare(`
        INSERT INTO template (judul, kode, jenis, kategori, konten_json, konten_html, variabel_daftar, is_bawaan)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `);
      const result = stmt.run(judul, kode, jenis || 'surat_keluar', kategori || 'Umum', jsonContentStr, htmlContent || '', variabelDaftarStr);
      req.session.flash = { success: `Template "${judul}" berhasil dibuat dengan ${variables.length} variabel.` };
      return res.json({ success: true, id: result.lastInsertRowid });
    }
  } catch (err) {
    console.error('Gagal menyimpan template:', err);
    return res.status(500).json({ success: false, message: 'Kode template mungkin sudah digunakan atau terjadi kesalahan basis data.' });
  }
});

/**
 * Hapus Template
 */
router.post('/template/hapus/:id', requireAuth, (req, res) => {
  try {
    const template = db.prepare('SELECT * FROM template WHERE id = ?').get(req.params.id);
    if (!template) {
      req.session.flash = { error: 'Template tidak ditemukan.' };
      return res.redirect('/template');
    }

    if (template.is_bawaan) {
      req.session.flash = { error: 'Template bawaan sistem tidak dapat dihapus.' };
      return res.redirect('/template');
    }

    db.prepare('DELETE FROM template WHERE id = ?').run(req.params.id);
    req.session.flash = { success: `Template "${template.judul}" berhasil dihapus.` };
  } catch (err) {
    console.error('Gagal menghapus template:', err);
    req.session.flash = { error: 'Gagal menghapus template.' };
  }
  res.redirect('/template');
});

module.exports = router;
