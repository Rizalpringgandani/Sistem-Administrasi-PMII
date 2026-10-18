/**
 * Skrip Pengujian Otomatis Tahap 2 - Editor Dokumen TipTap Kertas F4
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const session = require('express-session');

console.log('--- MEMULAI PENGUJIAN TAHAP 2 (EDITOR TIPTAP F4) ---');

// 1. Verifikasi File Bundel dan Asset Lokal
const tiptapBundlePath = path.join(__dirname, '../public/js/tiptap-bundle.js');
assert.ok(fs.existsSync(tiptapBundlePath), 'Berkas public/js/tiptap-bundle.js harus ada');
const bundleStats = fs.statSync(tiptapBundlePath);
assert.ok(bundleStats.size > 200000, `Ukuran bundel TipTap harus wajar (>200KB), saat ini: ${bundleStats.size} bytes`);
console.log(`✓ Bundel TipTap offline terverifikasi: ${(bundleStats.size / 1024).toFixed(1)} KB.`);

const editorCssPath = path.join(__dirname, '../public/css/editor.css');
assert.ok(fs.existsSync(editorCssPath), 'Berkas public/css/editor.css harus ada');
const cssContent = fs.readFileSync(editorCssPath, 'utf8');
assert.ok(cssContent.includes('215mm') && cssContent.includes('330mm'), 'CSS harus memuat ukuran standar F4 (215 x 330 mm)');
assert.ok(cssContent.includes('@media print'), 'CSS harus memuat aturan cetak @media print');
assert.ok(cssContent.includes('no-spacing'), 'CSS harus memuat aturan hilangkan space (.no-spacing)');
console.log('✓ CSS lembar kerja F4, aturan cetak, dan aturan hilangkan space terverifikasi.');

const editorAppPath = path.join(__dirname, '../public/js/editor-app.js');
assert.ok(fs.existsSync(editorAppPath), 'Berkas public/js/editor-app.js harus ada');
console.log('✓ Logika interaktif editor-app.js terverifikasi.');

// 2. Setup Server Uji Integrasi
const authRoutes = require('../src/routes/auth');
const dashboardRoutes = require('../src/routes/dashboard');
const editorRoutes = require('../src/routes/editor');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  name: 'test_session_tahap2',
  secret: 'test-secret-t2',
  resave: false,
  saveUninitialized: false
}));

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(editorRoutes);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 3. GET /editor tanpa login -> redirect ke /login
    const res1 = await fetch(`http://localhost:${port}/editor`, { redirect: 'manual' });
    assert.strictEqual(res1.status, 302);
    assert.strictEqual(res1.headers.get('location'), '/login');
    console.log('✓ Proteksi autentikasi /editor terverifikasi.');

    // 4. Login untuk dapat sesi
    const resLogin = await fetch(`http://localhost:${port}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'password=admin123',
      redirect: 'manual'
    });
    const setCookie = resLogin.headers.get('set-cookie');
    assert.ok(setCookie, 'Cookie sesi harus ada setelah login');
    const cookieHeader = setCookie.split(';')[0];

    // 5. GET /editor dengan sesi -> 200 OK dengan elemen lengkap
    const resEditor = await fetch(`http://localhost:${port}/editor`, {
      headers: { 'Cookie': cookieHeader }
    });
    assert.strictEqual(resEditor.status, 200);
    const htmlEditor = await resEditor.text();
    assert.ok(htmlEditor.includes('tiptap-editor'), 'Harus ada elemen #tiptap-editor');
    assert.ok(htmlEditor.includes('btn-print-doc'), 'Harus ada tombol Cetak F4');
    assert.ok(htmlEditor.includes('btn-save-doc'), 'Harus ada tombol Simpan Dokumen');
    assert.ok(htmlEditor.includes('find-replace-panel'), 'Harus ada panel Cari & Ganti');
    assert.ok(htmlEditor.includes('btn-toggle-no-spacing'), 'Harus ada tombol toggle hilangkan space');
    assert.ok(htmlEditor.includes('Hilangkan Space'), 'Harus ada opsi/menu Hilangkan Space');
    assert.ok(htmlEditor.includes('215 &times; 330 mm') || htmlEditor.includes('215 x 330 mm'), 'Harus ada indikator F4');
    console.log('✓ Halaman editor dokumen F4 berhasil dimuat dengan komponen lengkap dan fitur Hilangkan Space.');

    // 6. Test API Simpan TipTap JSON
    const testJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Uji coba penyimpanan dokumen TipTap JSON' }]
        }
      ]
    };

    const resSave = await fetch(`http://localhost:${port}/api/editor/simpan`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        judul: 'Dokumen Uji Otomatis',
        jsonContent: testJson,
        htmlContent: '<p>Uji coba penyimpanan dokumen TipTap JSON</p>'
      })
    });
    assert.strictEqual(resSave.status, 200);
    const saveResult = await resSave.json();
    assert.strictEqual(saveResult.success, true);
    console.log('✓ API simpan dokumen JSON TipTap terverifikasi.');

    // 7. Test API Muat TipTap JSON
    const resLoad = await fetch(`http://localhost:${port}/api/editor/muat`, {
      headers: { 'Cookie': cookieHeader }
    });
    assert.strictEqual(resLoad.status, 200);
    const loadResult = await resLoad.json();
    assert.strictEqual(loadResult.success, true);
    assert.strictEqual(loadResult.data.judul, 'Dokumen Uji Otomatis');
    assert.deepStrictEqual(loadResult.data.jsonContent, testJson);
    console.log('✓ API muat dokumen JSON TipTap terverifikasi.');

    // 8. Test Upload Gambar Lokal
    // Buat dummy 1x1 PNG minimalis
    const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const dummyPngBuffer = Buffer.from(dummyPngBase64, 'base64');
    const boundary = '----WebKitFormBoundaryUjiTahap2';

    let bodyData = `--${boundary}\r\n`;
    bodyData += `Content-Disposition: form-data; name="gambar"; filename="test-gambar.png"\r\n`;
    bodyData += `Content-Type: image/png\r\n\r\n`;
    const headerBuf = Buffer.from(bodyData, 'utf-8');
    const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
    const fullBody = Buffer.concat([headerBuf, dummyPngBuffer, footerBuf]);

    const resUpload = await fetch(`http://localhost:${port}/api/editor/upload-gambar`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: fullBody
    });
    assert.strictEqual(resUpload.status, 200);
    const uploadResult = await resUpload.json();
    assert.strictEqual(uploadResult.success, true);
    assert.ok(uploadResult.url.startsWith('/uploads/editor/'), 'URL gambar harus mengarah ke /uploads/editor/');
    const uploadedFilePath = path.join(__dirname, '../public', uploadResult.url);
    assert.ok(fs.existsSync(uploadedFilePath), 'File gambar yang diunggah harus ada di disk lokal');
    console.log('✓ API unggah gambar lokal untuk editor terverifikasi.');

    console.log('\n--- SELURUH PENGUJIAN TAHAP 2 BERHASIL 100% ---');
  } finally {
    server.close();
  }
});
