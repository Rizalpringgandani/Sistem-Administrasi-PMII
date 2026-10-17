const express = require('express');
const router = express.Router();
const {
  db,
  getAllPengaturan,
  generateNomorSurat,
  replaceVariablesInTipTapJson
} = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { renderLayout } = require('../views/layout');
const { renderSuratListPage } = require('../views/surat_list');
const { renderSuratFormPage } = require('../views/surat_form');
const { renderSuratEditorPage } = require('../views/surat_editor');

/**
 * Halaman Utama Surat Menyurat
 */
router.get('/surat', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  // Daftar surat keluar yang pernah dibuat
  const suratList = db.prepare(`
    SELECT * FROM dokumen 
    WHERE jenis = 'surat_keluar' 
    ORDER BY created_at DESC, id DESC
  `).all();

  // Daftar template surat
  const templates = db.prepare(`
    SELECT * FROM template 
    WHERE jenis = 'surat_keluar' 
    ORDER BY is_bawaan DESC, id ASC
  `).all();

  const content = renderSuratListPage({
    suratList,
    templates,
    settings
  });

  const html = renderLayout({
    title: 'Surat Menyurat',
    activeMenu: 'surat',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * Halaman Buat Surat Baru (Pilih Template & Isi Variabel)
 */
router.get('/surat/baru', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  const templates = db.prepare(`
    SELECT * FROM template 
    WHERE jenis = 'surat_keluar' 
    ORDER BY is_bawaan DESC, id ASC
  `).all();

  let selectedTemplate = null;
  const templateId = req.query.template_id;
  if (templateId) {
    selectedTemplate = templates.find(t => String(t.id) === String(templateId)) || null;
  } else if (templates.length > 0) {
    selectedTemplate = templates[0];
  }

  // Hitung nomor surat usulan otomatis
  let kodeKategori = '01';
  if (selectedTemplate && selectedTemplate.kategori) {
    const kat = selectedTemplate.kategori.toLowerCase();
    if (kat.includes('undangan')) kodeKategori = '01';
    else if (kat.includes('permohonan')) kodeKategori = '02';
    else if (kat.includes('pemberitahuan')) kodeKategori = '03';
    else if (kat.includes('mandat')) kodeKategori = '04';
    else if (kat.includes('keterangan')) kodeKategori = '05';
    else if (kat.includes('sk')) kodeKategori = '06';
  }

  const nomorUsulan = generateNomorSurat(kodeKategori);

  // Periode aktif untuk nama ketua & sekretaris otomatis
  const activePeriode = db.prepare('SELECT * FROM periode WHERE status_aktif = 1 LIMIT 1').get() || null;

  const content = renderSuratFormPage({
    templates,
    selectedTemplate,
    nomorUsulan,
    settings,
    activePeriode
  });

  const html = renderLayout({
    title: 'Buat Surat Baru',
    activeMenu: 'surat',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * Proses Pengisian Template -> Membuka Dokumen yang Terisi di Editor F4
 */
router.post('/surat/proses-template', requireAuth, (req, res) => {
  const { template_id, vars = {} } = req.body;
  const settings = getAllPengaturan();

  const template = db.prepare('SELECT * FROM template WHERE id = ?').get(template_id);
  if (!template) {
    req.session.flash = { error: 'Template surat tidak ditemukan.' };
    return res.redirect('/surat/baru');
  }

  let tplJson = null;
  try {
    tplJson = JSON.parse(template.konten_json);
  } catch (e) {
    tplJson = { type: 'doc', content: [] };
  }

  // Lakukan substitusi variabel {{...}} dengan nilai isian
  const filledJson = replaceVariablesInTipTapJson(tplJson, vars);

  // Siapkan objek dokumen awal untuk editor
  const docData = {
    id: null,
    template_id: template.id,
    judul: vars.perihal || template.judul,
    nomor_dokumen: vars.nomor_surat || '',
    tanggal_dokumen: vars.tanggal_surat || new Date().toISOString().slice(0, 10),
    tujuan: vars.tujuan || '',
    perihal: vars.perihal || template.judul,
    konten_json: filledJson,
    konten_html: ''
  };

  const content = renderSuratEditorPage({
    docData,
    settings
  });

  const html = renderLayout({
    title: `Editor Surat: ${docData.judul}`,
    activeMenu: 'surat',
    content,
    settings
  });

  res.send(html);
});

/**
 * Buka Kembali Dokumen Surat dari Arsip ke Editor F4
 */
router.get('/surat/buka/:id', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  const doc = db.prepare('SELECT * FROM dokumen WHERE id = ?').get(req.params.id);
  if (!doc) {
    req.session.flash = { error: 'Dokumen tidak ditemukan dalam arsip.' };
    return res.redirect('/arsip');
  }

  let docJson = null;
  if (doc.konten_json) {
    try {
      docJson = JSON.parse(doc.konten_json);
    } catch(e) {}
  }

  const docData = {
    ...doc,
    konten_json: docJson
  };

  const content = renderSuratEditorPage({
    docData,
    settings
  });

  const html = renderLayout({
    title: `Sunting Dokumen: ${doc.judul}`,
    activeMenu: 'arsip',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * API Simpan Surat ke Arsip (Tabel Dokumen)
 */
router.post('/api/surat/simpan-arsip', requireAuth, (req, res) => {
  const {
    id,
    judul,
    nomor_dokumen,
    jenis,
    template_id,
    tujuan,
    perihal,
    tanggal_dokumen,
    konten_json,
    konten_html
  } = req.body;

  if (!judul || !nomor_dokumen) {
    return res.status(400).json({ success: false, message: 'Judul dan Nomor Dokumen wajib diisi.' });
  }

  const jsonStr = typeof konten_json === 'string' ? konten_json : JSON.stringify(konten_json);
  const htmlStr = konten_html || '';

  try {
    if (id) {
      // Perbarui dokumen yang sudah ada di arsip
      const stmt = db.prepare(`
        UPDATE dokumen 
        SET judul = ?, nomor_dokumen = ?, tujuan = ?, perihal = ?, tanggal_dokumen = ?,
            konten_json = ?, konten_html = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(judul, nomor_dokumen, tujuan || '', perihal || '', tanggal_dokumen || '', jsonStr, htmlStr, id);
      return res.json({ success: true, dokumenId: id, message: 'Arsip dokumen berhasil diperbarui.' });
    } else {
      // Masukkan dokumen baru ke arsip
      const stmt = db.prepare(`
        INSERT INTO dokumen (
          judul, nomor_dokumen, jenis, template_id, tujuan, perihal,
          tanggal_dokumen, konten_json, konten_html, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'diarsipkan')
      `);
      const result = stmt.run(
        judul,
        nomor_dokumen,
        jenis || 'surat_keluar',
        template_id || null,
        tujuan || '',
        perihal || '',
        tanggal_dokumen || '',
        jsonStr,
        htmlStr
      );
      return res.json({ success: true, dokumenId: result.lastInsertRowid, message: 'Surat berhasil disimpan ke Arsip.' });
    }
  } catch (err) {
    console.error('Gagal menyimpan ke tabel dokumen:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat menyimpan arsip.' });
  }
});

module.exports = router;
