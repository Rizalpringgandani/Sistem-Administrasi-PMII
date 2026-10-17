const express = require('express');
const router = express.Router();
const { db, getAllPengaturan } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { renderLayout, escapeHtml } = require('../views/layout');
const { renderArsipListPage } = require('../views/arsip_list');
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
        konten_json: kontenJson
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
    <div><strong>Pratinjau Cetak Kertas F4 (215 x 330 mm)</strong> - ${escapeHtml(doc.nomor_dokumen || '')}</div>
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
    <div class="editor-f4-paper">
      <!-- Kop Surat PMII Otomatis -->
      <div class="kop-surat-header" style="border-bottom: 3px double #000000; padding-bottom: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
        <div style="width: 75px; text-align: center; flex-shrink: 0;">
          <img src="${logoSrc}" alt="Logo PMII" style="max-width: 70px; max-height: 85px; object-fit: contain;">
        </div>
        <div style="flex: 1; text-align: center; font-family: 'Times New Roman', Times, serif; color: #000000;">
          <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px;">PENGURUS RAYON</div>
          <div style="font-size: 15pt; font-weight: bold; color: #003366; letter-spacing: 0.5px;">PERGERAKAN MAHASISWA ISLAM INDONESIA</div>
          <div style="font-size: 9.5pt; font-style: italic; color: #d99b00; margin-top: -2px;">(Indonesian Muslim Student Movement)</div>
          <div style="font-size: 12pt; font-weight: bold; margin-top: 2px;">${namaRayon} ${namaKomisariat} ${namaCabang}</div>
          <div style="font-size: 8.5pt; margin-top: 4px;">Sekretariat: ${alamat}</div>
        </div>
      </div>

      <div id="tiptap-print-render"></div>
    </div>
  </div>

  <script id="doc-json" type="application/json">${initialJsonStr ? initialJsonStr.replace(/</g, '\\u003c') : ''}</script>
  <script src="/js/tiptap-bundle.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const { Editor, StarterKit, Underline, TextAlign, Table, TableRow, TableCell, TableHeader, Image } = window.TipTap;
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
            Image
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
