/**
 * SISTEM ADMINISTRASI PMII RAYON
 * Server Lokal Luring (Offline)
 */

const express = require('express');
const session = require('express-session');
const path = require('node:path');
const fs = require('node:fs');

// Inisialisasi Database SQLite & Skema 8 Tabel
const { inisialisasiDatabase, getAllPengaturan } = require('./src/database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware File Statis Lokal (CSS, JS, Ikon, Upload Logo)
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Sesi Lokal Admin
app.use(session({
  name: 'pmii_session',
  secret: 'pmii-rayon-administrasi-rahasia-lokal-1960',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Berlaku 24 jam
  }
}));

// Rute Aplikasi
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const editorRoutes = require('./src/routes/editor');
const pengaturanRoutes = require('./src/routes/pengaturan');
const modulMendatangRoutes = require('./src/routes/modul_mendatang');

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(editorRoutes);
app.use(pengaturanRoutes);
app.use(modulMendatangRoutes);

// Penanganan 404
app.use((req, res) => {
  res.status(404).redirect('/');
});

// Jalankan Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log('  SISTEM ADMINISTRASI PMII RAYON (LURING/OFFLINE)   ');
  console.log('====================================================');
  console.log(`  Aplikasi berjalan di: http://localhost:${PORT}`);
  console.log('  Kata sandi default  : admin123');
  console.log('  Mode               : 100% Offline (Tanpa CDN)');
  console.log('====================================================');
});
