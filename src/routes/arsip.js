const express = require('express');
const router = express.Router();
const { db, getAllPengaturan } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { renderLayout, escapeHtml } = require('../views/layout');
const { renderArsipListPage } = require('../views/arsip_list');
const { renderKopSuratHtml, renderFooterHtml } = require('../views/kop_surat');
const { generateDocxFromTipTap } = require('../services/docxGenerator');

/**
 * Halaman Arsip Dokumen
 */
router.get('/arsip', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  const searchQuery = (req.query.q || '').trim();
  const selectedJenis = (req.query.jenis || '').trim();

  let querySql = 'SELECT * FROM dokumen WHERE 1=1';
  const params = [];

  if (searchQuery) {
    querySql += ' AND (nomor_dokumen LIKE ? OR judul LIKE ? OR perihal LIKE ? OR tujuan LIKE ?)';
    const searchWildcard = `%${searchQuery}%`;
    params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
  }

  if (selectedJenis) {
    querySql += ' AND jenis = ?';
    params.push(selectedJenis);
  }

  querySql += ' ORDER BY created_at DESC, id DESC';

  const dokumenList = db.prepare(querySql).all(...params);

  const content = renderArsipListPage({
    dokumenList,
    searchQuery,
    selectedJenis,
    settings
  });

  const html = renderLayout({
    title: 'Arsip Dokumen Rayon',
    activeMenu: 'arsip',
    content,
    flash,
    settings
  });

  res.send(html);
});

/**
 * Export Dokumen ke Berkas Word (.docx) Berstandar F4
 */
router.get('/dokumen/:id/export-word', requireAuth, async (req, res) => {
  const doc = db.prepare('SELECT * FROM dokumen WHERE id = ?').get(req.params.id);
  if (!doc) {
    req.session.flash = { error: 'Dokumen tidak ditemukan untuk diunduh.' };
    return res.redirect('/arsip');
  }

  const settings = getAllPengaturan();

  try {
    let kontenJson = null;
    if (doc.konten_json) {
      try {
        kontenJson = JSON.parse(doc.konten_json);
      } catch (e) {}
    }

    const docxBuffer = await generateDocxFromTipTap({
      docData: {
        ...doc,
        konten_json: kontenJson,
        margin: req.query.margin || doc.margin || '20mm',
        line_spacing: req.query.line_spacing || doc.line_spacing || '1.5'
      },
      settings,
      includeKop: true
    });

    const safeTitle = (doc.judul || 'dokumen')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');
    const safeNomor = (doc.nomor_dokumen || 'nomor')
      .replace(/[^a-zA-Z0-9_-]/g, '-');
    const filename = `${safeNomor}-${safeTitle}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docxBuffer.length);

    return res.send(docxBuffer);
  } catch (error) {
    console.error('Gagal membuat berkas Word .docx:', error);
    req.session.flash = { error: 'Terjadi kesalahan saat membuat berkas Word.' };
    return res.redirect('/arsip');
  }
});

/**
 * Tampilan Cetak / PDF Bersih Dokumen F4
 */
router.get('/dokumen/:id/cetak', requireAuth, (req, res) => {
  const doc = db.prepare('SELECT * FROM dokumen WHERE id = ?').get(req.params.id);
  if (!doc) {
    return res.status(404).send('Dokumen tidak ditemukan.');
  }

  const settings = getAllPengaturan();
  const namaRayon = (settings.nama_rayon || 'RAYON PMII').toUpperCase();
  const namaKomisariat = (settings.nama_komisariat || '').toUpperCase();
  const namaCabang = (settings.nama_cabang || '').toUpperCase();
  const alamat = escapeHtml(settings.alamat_sekretariat || 'Alamat Sekretariat');
  const logoSrc = settings.logo_rayon || settings.logo_pmii || '/img/pmii-logo.svg';

  const initialJsonStr = doc.konten_json || '';

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(doc.nomor_dokumen || '')} - ${escapeHtml(doc.judul)}</title>
  <link rel="stylesheet" href="/css/editor.css">
  <style>
    body { background: #fff; margin: 0; padding: 0; }
    .editor-f4-paper { box-shadow: none; margin: 0 auto; }
    @media print {
      .print-btn-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-btn-bar" style="background: #003366; color: #fff; padding: 0.5rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
    <div><strong>Pratinjau Cetak Kertas F4 (21 x 33 cm)</strong> - ${escapeHtml(doc.nomor_dokumen || '')}</div>
    <div style="display: flex; gap: 0.5rem;">
      <button onclick="window.print()" style="background: #ffd700; color: #002e56; font-weight: bold; border: none; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer;">
        Cetak Sekarang / Simpan PDF
      </button>
      <button onclick="window.close()" style="background: transparent; color: #fff; border: 1px solid #fff; padding: 0.4rem 1rem; border-radius: 4px; cursor: pointer;">
        Tutup
      </button>
    </div>
  </div>

  <div class="editor-workspace-desk" style="background: transparent; padding: 0;">
    <div class="editor-f4-paper" style="--paper-margin-top: 5mm; --paper-margin-side: ${doc.margin || '20mm'}; --paper-margin-bottom: ${doc.margin || '20mm'}; --paper-line-height: ${doc.line_spacing || '1.5'}; padding: 5mm ${doc.margin || '20mm'} ${doc.margin || '20mm'} ${doc.margin || '20mm'};">
      <!-- Kop Surat PMII Otomatis Sesuai Pedoman Surat -->
      ${renderKopSuratHtml(settings)}

      <div id="tiptap-print-render"></div>

      <!-- Footer Motto PMII -->
      ${renderFooterHtml(settings)}
    </div>
  </div>

  <script id="doc-json" type="application/json">${initialJsonStr ? initialJsonStr.replace(/</g, '\\u003c') : ''}</script>
  <script src="/js/tiptap-bundle.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const { Editor, StarterKit, Underline, TextAlign, Table, TableRow, TableCell, TableHeader, Image, TextColor, Indent, LineHeight } = window.TipTap;
      let content = null;
      try {
        content = JSON.parse(document.getElementById('doc-json').textContent);
      } catch(e) {}

      if (content) {
        new Editor({
          element: document.getElementById('tiptap-print-render'),
          editable: false,
          extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table,
            TableRow,
            TableHeader,
            TableCell,
            Image,
            TextColor,
            Indent,
            LineHeight
          ],
          content: content
        });
      }
    });
  </script>
</body>
</html>`;

  res.send(html);
});

/**
 * Hapus Dokumen dari Arsip
 */
router.post('/dokumen/:id/hapus', requireAuth, (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM dokumen WHERE id = ?').get(req.params.id);
    if (!doc) {
      req.session.flash = { error: 'Dokumen tidak ditemukan.' };
      return res.redirect('/arsip');
    }

    db.prepare('DELETE FROM dokumen WHERE id = ?').run(req.params.id);
    req.session.flash = { success: `Dokumen "${doc.nomor_dokumen || doc.judul}" berhasil dihapus dari arsip.` };
  } catch (err) {
    console.error('Gagal menghapus dokumen:', err);
    req.session.flash = { error: 'Gagal menghapus dokumen arsip.' };
  }

  res.redirect('/arsip');
});

module.exports = router;
