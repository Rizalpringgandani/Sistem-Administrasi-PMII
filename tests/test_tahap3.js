/**
 * Skrip Pengujian Otomatis Tahap 3 - Template, Surat Menyurat, Arsip & Export Word (.docx)/PDF
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const session = require('express-session');

console.log('--- MEMULAI PENGUJIAN TAHAP 3 (TEMPLATE, SURAT, ARSIP, EXPORT WORD/PDF) ---');

const { db, getAllPengaturan, generateNomorSurat, extractVariablesFromTipTap, replaceVariablesInTipTapJson } = require('../src/database/db');
const { generateDocxFromTipTap } = require('../src/services/docxGenerator');

// 1. Verifikasi Data Bawaan Template
const initialTemplates = db.prepare('SELECT * FROM template').all();
assert.ok(initialTemplates.length >= 2, 'Harus ada minimal 2 template bawaan sistem');
console.log(`✓ Template bawaan terverifikasi (${initialTemplates.length} template).`);

// 2. Verifikasi Fungsi Nomor Surat Otomatis
const usulanNomor = generateNomorSurat('01');
assert.ok(usulanNomor.nomor, 'Nomor surat usulan harus terbuat');
assert.ok(usulanNomor.nomor.includes('2026'), 'Nomor surat harus memuat tahun');
console.log('✓ Nomor surat otomatis terverifikasi:', usulanNomor.nomor);

// 3. Verifikasi Ekstraksi & Substitusi Variabel
const testTipTap = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Surat untuk {{tujuan}} tentang {{perihal}}.' }]
    }
  ]
};
const vars = extractVariablesFromTipTap(testTipTap);
assert.deepStrictEqual(vars.sort(), ['perihal', 'tujuan'].sort());
const substituted = replaceVariablesInTipTapJson(testTipTap, { tujuan: 'Sahabat Budi', perihal: 'Rapat Kerja' });
assert.strictEqual(substituted.content[0].content[0].text, 'Surat untuk Sahabat Budi tentang Rapat Kerja.');
console.log('✓ Ekstraksi dan substitusi variabel TipTap JSON terverifikasi.');

// 4. Verifikasi Pembuatan File Word .docx
(async () => {
  const docxBuf = await generateDocxFromTipTap({
    docData: {
      judul: 'Surat Uji docx',
      konten_json: substituted
    },
    settings: getAllPengaturan(),
    includeKop: true
  });
  assert.ok(Buffer.isBuffer(docxBuf), 'Output docx harus berupa buffer');
  assert.ok(docxBuf.length > 5000, `Ukuran buffer docx harus memadai (${docxBuf.length} bytes)`);
  console.log(`✓ Pembuatan berkas Word (.docx) F4 terverifikasi: ${(docxBuf.length / 1024).toFixed(1)} KB.`);

  // 5. Setup Server Uji Integrasi HTTP
  const authRoutes = require('../src/routes/auth');
  const templateRoutes = require('../src/routes/template');
  const suratRoutes = require('../src/routes/surat');
  const arsipRoutes = require('../src/routes/arsip');

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(session({
    name: 'test_session_tahap3',
    secret: 'test-secret-t3',
    resave: false,
    saveUninitialized: false
  }));

  app.use(authRoutes);
  app.use(templateRoutes);
  app.use(suratRoutes);
  app.use(arsipRoutes);

  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    try {
      // Login untuk mendapatkan cookie sesi
      const resLogin = await fetch(`http://localhost:${port}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'password=admin123',
        redirect: 'manual'
      });
      const cookieHeader = resLogin.headers.get('set-cookie').split(';')[0];

      // A. Test Menu Template
      const resTpl = await fetch(`http://localhost:${port}/template`, { headers: { 'Cookie': cookieHeader } });
      assert.strictEqual(resTpl.status, 200);
      const textTpl = await resTpl.text();
      assert.ok(textTpl.includes('Kelola Template Dokumen'));
      console.log('✓ Endpoint GET /template terverifikasi.');

      // B. Test Simpan Template Baru
      const resSaveTpl = await fetch(`http://localhost:${port}/template/simpan`, {
        method: 'POST',
        headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: 'Template Uji Mandat',
          kode: 'TPL-TEST-MANDAT',
          kategori: 'Mandat',
          jenis: 'surat_keluar',
          jsonContent: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Memberikan mandat kepada {{nama_penerima}}.' }] }]
          }
        })
      });
      assert.strictEqual(resSaveTpl.status, 200);
      const saveTplResult = await resSaveTpl.json();
      assert.strictEqual(saveTplResult.success, true);
      const newTplId = saveTplResult.id;
      console.log('✓ Endpoint POST /template/simpan terverifikasi (ID:', newTplId, ').');

      // C. Test Menu Surat & Buat Surat Form
      const resSurat = await fetch(`http://localhost:${port}/surat`, { headers: { 'Cookie': cookieHeader } });
      assert.strictEqual(resSurat.status, 200);
      console.log('✓ Endpoint GET /surat terverifikasi.');

      const resSuratBaru = await fetch(`http://localhost:${port}/surat/baru?template_id=${newTplId}`, { headers: { 'Cookie': cookieHeader } });
      assert.strictEqual(resSuratBaru.status, 200);
      const textSuratBaru = await resSuratBaru.text();
      assert.ok(textSuratBaru.includes('nama_penerima'), 'Form harus mendeteksi variabel nama_penerima');
      console.log('✓ Formulir isian variabel otomatis dari template terverifikasi.');

      // D. Test Proses Template -> Buka di Editor
      const resProses = await fetch(`http://localhost:${port}/surat/proses-template`, {
        method: 'POST',
        headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `template_id=${newTplId}&vars[nama_penerima]=Sahabat%20Zaid`,
        redirect: 'manual'
      });
      assert.strictEqual(resProses.status, 200);
      const htmlProses = await resProses.text();
      assert.ok(htmlProses.includes('Sahabat Zaid'), 'Dokumen di editor harus memuat nilai variabel terisi');
      console.log('✓ Proses substitusi template ke editor F4 terverifikasi.');

      // E. Test Simpan ke Arsip Dokumen
      const resSimpanArsip = await fetch(`http://localhost:${port}/api/surat/simpan-arsip`, {
        method: 'POST',
        headers: { 'Cookie': cookieHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: 'Surat Mandat Delegasi PMII',
          nomor_dokumen: '005/PR-PMII/X/2026',
          jenis: 'surat_keluar',
          template_id: newTplId,
          tujuan: 'Sahabat Zaid',
          perihal: 'Surat Mandat',
          tanggal_dokumen: '2026-10-17',
          konten_json: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Memberikan mandat kepada Sahabat Zaid.' }] }]
          },
          konten_html: '<p>Memberikan mandat kepada Sahabat Zaid.</p>'
        })
      });
      assert.strictEqual(resSimpanArsip.status, 200);
      const arsipSaveResult = await resSimpanArsip.json();
      assert.strictEqual(arsipSaveResult.success, true);
      const docId = arsipSaveResult.dokumenId;
      console.log('✓ Simpan surat ke tabel dokumen arsip terverifikasi (Dokumen ID:', docId, ').');

      // F. Test Menu Arsip
      const resArsip = await fetch(`http://localhost:${port}/arsip`, { headers: { 'Cookie': cookieHeader } });
      assert.strictEqual(resArsip.status, 200);
      const textArsip = await resArsip.text();
      assert.ok(textArsip.includes('005/PR-PMII/X/2026'), 'Halaman arsip harus memuat surat yang baru disimpan');
      console.log('✓ Halaman arsip menampilkan surat terverifikasi.');

      // G. Test Export Word (.docx)
      const resExportWord = await fetch(`http://localhost:${port}/dokumen/${docId}/export-word`, { headers: { 'Cookie': cookieHeader } });
      assert.strictEqual(resExportWord.status, 200);
      assert.strictEqual(resExportWord.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      const docxArrayBuf = await resExportWord.arrayBuffer();
      assert.ok(docxArrayBuf.byteLength > 10000, 'Ukuran file docx terunduh harus valid');
      console.log('✓ Unduh berkas Word (.docx) F4 terverifikasi:', (docxArrayBuf.byteLength / 1024).toFixed(1), 'KB.');

      // H. Test Cetak / PDF View
      const resCetak = await fetch(`http://localhost:${port}/dokumen/${docId}/cetak`, { headers: { 'Cookie': cookieHeader } });
      assert.strictEqual(resCetak.status, 200);
      const htmlCetak = await resCetak.text();
      assert.ok(htmlCetak.includes('Pratinjau Cetak Kertas F4'), 'Halaman cetak harus memuat tampilan F4');
      console.log('✓ Tampilan cetak/PDF dokumen terverifikasi.');

      // I. Test Buka Ulang Dokumen dari Arsip
      const resBuka = await fetch(`http://localhost:${port}/surat/buka/${docId}`, { headers: { 'Cookie': cookieHeader } });
      assert.strictEqual(resBuka.status, 200);
      const htmlBuka = await resBuka.text();
      assert.ok(htmlBuka.includes('005/PR-PMII/X/2026'), 'Editor harus memuat nomor dokumen saat dibuka ulang');
      console.log('✓ Buka ulang dokumen arsip di editor F4 terverifikasi.');

      // J. Test Hapus Dokumen Arsip
      const resHapusDoc = await fetch(`http://localhost:${port}/dokumen/${docId}/hapus`, {
        method: 'POST',
        headers: { 'Cookie': cookieHeader },
        redirect: 'manual'
      });
      assert.strictEqual(resHapusDoc.status, 302);
      console.log('✓ Hapus arsip dokumen terverifikasi.');

      // Hapus template uji coba
      db.prepare('DELETE FROM template WHERE id = ?').run(newTplId);

      console.log('\n--- SELURUH PENGUJIAN TAHAP 3 BERHASIL 100% ---');
    } finally {
      server.close();
    }
  });
})();
