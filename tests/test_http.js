/**
 * Pengujian Integrasi HTTP Server Tahap 1
 */

const assert = require('node:assert');
const http = require('node:http');
const express = require('express');
const session = require('express-session');
const path = require('node:path');

const { getPengaturan } = require('../src/database/db');
const authRoutes = require('../src/routes/auth');
const dashboardRoutes = require('../src/routes/dashboard');
const pengaturanRoutes = require('../src/routes/pengaturan');
const modulMendatangRoutes = require('../src/routes/modul_mendatang');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  name: 'test_session',
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(pengaturanRoutes);
app.use(modulMendatangRoutes);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. GET / tanpa login -> harus redirect ke /login
    const res1 = await fetch(`http://localhost:${port}/`, { redirect: 'manual' });
    assert.strictEqual(res1.status, 302, 'Unauthenticated user must be redirected');
    assert.strictEqual(res1.headers.get('location'), '/login');
    console.log('✓ Redirect autentikasi (GET / -> /login) berhasil.');

    // 2. GET /login -> harus 200 OK
    const res2 = await fetch(`http://localhost:${port}/login`);
    assert.strictEqual(res2.status, 200);
    const text2 = await res2.text();
    assert.ok(text2.includes('SISTEM ADMINISTRASI'), 'Halaman login harus memuat judul SISTEM ADMINISTRASI');
    console.log('✓ Halaman login berhasil dimuat.');

    // 3. POST /login kata sandi salah -> redirect ke /login
    const res3 = await fetch(`http://localhost:${port}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'password=passwordsalah',
      redirect: 'manual'
    });
    assert.strictEqual(res3.status, 302);
    assert.strictEqual(res3.headers.get('location'), '/login');
    console.log('✓ Proteksi kata sandi salah berhasil ditolak.');

    // 4. POST /login kata sandi benar (admin123) -> login sukses dan dapat cookie
    const res4 = await fetch(`http://localhost:${port}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'password=admin123',
      redirect: 'manual'
    });
    assert.strictEqual(res4.status, 302);
    assert.strictEqual(res4.headers.get('location'), '/');
    const setCookie = res4.headers.get('set-cookie');
    assert.ok(setCookie, 'Cookie sesi harus diberikan saat login sukses');
    const cookieHeader = setCookie.split(';')[0];
    console.log('✓ Login admin berhasil dengan kata sandi default.');

    // 5. Akses Dashboard dengan cookie sesi -> harus 200 OK
    const res5 = await fetch(`http://localhost:${port}/`, {
      headers: { 'Cookie': cookieHeader }
    });
    assert.strictEqual(res5.status, 200);
    const text5 = await res5.text();
    assert.ok(text5.includes('Dashboard Administrasi'), 'Dashboard harus memuat Dashboard Administrasi');
    console.log('✓ Akses dashboard admin terverifikasi.');

    // 6. Akses Pengaturan dengan cookie sesi -> harus 200 OK
    const res6 = await fetch(`http://localhost:${port}/pengaturan`, {
      headers: { 'Cookie': cookieHeader }
    });
    assert.strictEqual(res6.status, 200);
    const text6 = await res6.text();
    assert.ok(text6.includes('Identitas Rayon &amp; Organisasi') || text6.includes('Identitas Rayon'), 'Halaman pengaturan harus memuat form');
    console.log('✓ Akses halaman pengaturan terverifikasi.');

    // 7. Simpan Pengaturan
    const res7 = await fetch(`http://localhost:${port}/pengaturan`, {
      method: 'POST',
      headers: { 
        'Cookie': cookieHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        nama_rayon: 'Rayon Perjuangan PMII',
        nama_komisariat: 'Komisariat Bintang Sembilan',
        nama_cabang: 'PC PMII Kota Uji',
        kampus: 'Kampus Pergerakan',
        alamat_sekretariat: 'Jl. Uji No. 1960',
        email_rayon: 'uji@pmii.local',
        telepon_rayon: '0899999999',
        kode_rayon: 'PR-UJI',
        format_nomor_surat: '{no}/PR-UJI/{romawi}/{tahun}'
      }).toString(),
      redirect: 'manual'
    });
    assert.strictEqual(res7.status, 302);
    assert.strictEqual(getPengaturan('nama_rayon'), 'Rayon Perjuangan PMII');
    console.log('✓ Simpan form pengaturan identitas berhasil diverifikasi.');

    console.log('\n--- SELURUH PENGUJIAN HTTP TAHAP 1 BERHASIL 100% ---');
  } finally {
    server.close();
  }
});
