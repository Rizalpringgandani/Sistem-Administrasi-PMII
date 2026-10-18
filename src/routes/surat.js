const express = require('express');
const router = express.Router();
const {
  db,
  getAllPengaturan,
  generateNomorSurat,
  generateNomorSuratPedoman,
  replaceVariablesInTipTapJson
} = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { renderLayout } = require('../views/layout');
const { renderSuratListPage } = require('../views/surat_list');
const { renderSuratFormPage } = require('../views/surat_form');
const { renderSuratEditorPage } = require('../views/surat_editor');

/**
 * API Hitung Usulan Nomor Surat Pedoman PMII
 */
router.get('/api/surat/hitung-nomor', requireAuth, (req, res) => {
  const { sifat_surat = '01', kode_penandatangan = 'A-I', nama_panitia = '', tanggal = null } = req.query;
  const result = generateNomorSuratPedoman({
    sifatSurat: sifat_surat,
    kodePenandatangan: kode_penandatangan,
    namaPanitia: nama_panitia,
    tanggal: tanggal || null
  });
  res.json({ success: true, data: result });
});

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

  // Hitung nomor surat usulan otomatis sesuai PPTA PMII
  const sifatSurat = req.query.sifat_surat || '01';
  const kodeTtd = req.query.kode_ttd || 'A-I';
  const namaPanitia = req.query.nama_panitia || '';

  const nomorUsulan = generateNomorSuratPedoman({
    sifatSurat,
    kodePenandatangan: kodeTtd,
    namaPanitia
  });

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
  const {
    template_id,
    vars = {},
    no_urut_total,
    no_urut_jenis,
    sifat_surat,
    kode_penandatangan,
    nama_panitia,
    bulan_surat,
    tahun_surat
  } = req.body;
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
    no_urut_total: no_urut_total ? parseInt(no_urut_total, 10) : null,
    no_urut_jenis: no_urut_jenis ? parseInt(no_urut_jenis, 10) : null,
    sifat_surat: sifat_surat || '01',
    kode_penandatangan: kode_penandatangan || 'A-I',
    nama_panitia: nama_panitia || '',
    bulan_surat: bulan_surat || '',
    tahun_surat: tahun_surat ? parseInt(tahun_surat, 10) : new Date().getFullYear(),
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
    no_urut_total,
    no_urut_jenis,
    sifat_surat,
    kode_penandatangan,
    nama_panitia,
    bulan_surat,
    tahun_surat,
    konten_json,
    konten_html,
    margin,
    line_spacing
  } = req.body;

  if (!judul || !nomor_dokumen) {
    return res.status(400).json({ success: false, message: 'Judul dan Nomor Dokumen wajib diisi.' });
  }

  const jsonStr = typeof konten_json === 'string' ? konten_json : JSON.stringify(konten_json);
  const htmlStr = konten_html || '';

  // Fallback parsing jika tidak dikirim dari form namun nomor_dokumen mengikuti standar titik
  let parsedTotal = no_urut_total ? parseInt(no_urut_total, 10) : null;
  let parsedJenis = no_urut_jenis ? parseInt(no_urut_jenis, 10) : null;
  let parsedSifat = sifat_surat || null;
  let parsedTtd = kode_penandatangan || null;
  let parsedBulan = bulan_surat || null;
  let parsedTahun = tahun_surat ? parseInt(tahun_surat, 10) : null;

  if (nomor_dokumen && (!parsedTotal || !parsedJenis)) {
    const parts = nomor_dokumen.split('.');
    if (parts.length >= 6) {
      if (!parsedTotal && !isNaN(parseInt(parts[0], 10))) parsedTotal = parseInt(parts[0], 10);
      // Format 9 bagian: [0]NoTotal.[1]Rayon/Panitia.[2]Wilayah.[3]Jenis.[4]NoJenis.[5]Ttd.[6]Bulan.[7]Tahun
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '01' || parts[i] === '02') {
          if (!parsedSifat) parsedSifat = parts[i];
          if (!parsedJenis && i + 1 < parts.length && !isNaN(parseInt(parts[i + 1], 10))) {
            parsedJenis = parseInt(parts[i + 1], 10);
          }
        }
      }
    }
  }

  if (!parsedTahun) {
    const d = tanggal_dokumen ? new Date(tanggal_dokumen) : new Date();
    parsedTahun = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  }
  if (!parsedBulan) {
    const d = tanggal_dokumen ? new Date(tanggal_dokumen) : new Date();
    parsedBulan = String(isNaN(d.getMonth()) ? (new Date().getMonth() + 1) : (d.getMonth() + 1)).padStart(2, '0');
  }

  try {
    if (id) {
      // Perbarui dokumen yang sudah ada di arsip
      const stmt = db.prepare(`
        UPDATE dokumen 
        SET judul = ?, nomor_dokumen = ?, tujuan = ?, perihal = ?, tanggal_dokumen = ?,
            no_urut_total = COALESCE(?, no_urut_total),
            no_urut_jenis = COALESCE(?, no_urut_jenis),
            sifat_surat = COALESCE(?, sifat_surat),
            kode_penandatangan = COALESCE(?, kode_penandatangan),
            nama_panitia = COALESCE(?, nama_panitia),
            bulan_surat = COALESCE(?, bulan_surat),
            tahun_surat = COALESCE(?, tahun_surat),
            margin = COALESCE(?, margin),
            line_spacing = COALESCE(?, line_spacing),
            konten_json = ?, konten_html = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        judul,
        nomor_dokumen,
        tujuan || '',
        perihal || '',
        tanggal_dokumen || '',
        parsedTotal,
        parsedJenis,
        parsedSifat,
        parsedTtd,
        nama_panitia !== undefined ? nama_panitia : null,
        parsedBulan,
        parsedTahun,
        margin || '20mm',
        line_spacing || '1.5',
        jsonStr,
        htmlStr,
        id
      );
      return res.json({ success: true, dokumenId: id, message: 'Arsip dokumen berhasil diperbarui.' });
    } else {
      // Masukkan dokumen baru ke arsip
      const stmt = db.prepare(`
        INSERT INTO dokumen (
          judul, nomor_dokumen, jenis, template_id, tujuan, perihal,
          tanggal_dokumen, no_urut_total, no_urut_jenis, sifat_surat,
          kode_penandatangan, nama_panitia, bulan_surat, tahun_surat,
          margin, line_spacing,
          konten_json, konten_html, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'diarsipkan')
      `);
      const result = stmt.run(
        judul,
        nomor_dokumen,
        jenis || 'surat_keluar',
        template_id || null,
        tujuan || '',
        perihal || '',
        tanggal_dokumen || '',
        parsedTotal,
        parsedJenis,
        parsedSifat || '01',
        parsedTtd || 'A-I',
        nama_panitia || '',
        parsedBulan,
        parsedTahun,
        margin || '20mm',
        line_spacing || '1.5',
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
