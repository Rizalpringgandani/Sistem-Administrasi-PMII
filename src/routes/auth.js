const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getPengaturan, setPengaturan, getAllPengaturan } = require('../database/db');
const { redirectIfAuth, requireAuth } = require('../middleware/auth');
const { renderLoginPage } = require('../views/login');

/**
 * Halaman Login
 */
router.get('/login', redirectIfAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null; // Clear flash setelah diambil
  res.send(renderLoginPage({ flash, settings }));
});

/**
 * Proses Login
 */
router.post('/login', redirectIfAuth, (req, res) => {
  const { password } = req.body;
  const adminPasswordHash = getPengaturan('admin_password');

  if (!password) {
    req.session.flash = { error: 'Kata sandi wajib diisi.' };
    return res.redirect('/login');
  }

  const isMatch = bcrypt.compareSync(password, adminPasswordHash);
  if (!isMatch) {
    req.session.flash = { error: 'Kata sandi salah. Silakan coba kembali.' };
    return res.redirect('/login');
  }

  // Sukses login
  req.session.isAdmin = true;
  req.session.save(() => {
    res.redirect('/');
  });
});

/**
 * Proses Keluar (Logout)
 */
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

/**
 * Ganti Kata Sandi Admin
 */
router.post('/pengaturan/kata-sandi', requireAuth, (req, res) => {
  const { kata_sandi_lama, kata_sandi_baru, konfirmasi_kata_sandi } = req.body;
  const adminPasswordHash = getPengaturan('admin_password');

  if (!kata_sandi_lama || !kata_sandi_baru || !konfirmasi_kata_sandi) {
    req.session.flash = { error: 'Semua kolom kata sandi wajib diisi.' };
    return res.redirect('/pengaturan');
  }

  // Cek kata sandi lama
  const isMatch = bcrypt.compareSync(kata_sandi_lama, adminPasswordHash);
  if (!isMatch) {
    req.session.flash = { error: 'Kata sandi saat ini tidak sesuai.' };
    return res.redirect('/pengaturan');
  }

  // Validasi kata sandi baru
  if (kata_sandi_baru.length < 6) {
    req.session.flash = { error: 'Kata sandi baru minimal harus 6 karakter.' };
    return res.redirect('/pengaturan');
  }

  if (kata_sandi_baru !== konfirmasi_kata_sandi) {
    req.session.flash = { error: 'Konfirmasi kata sandi baru tidak cocok.' };
    return res.redirect('/pengaturan');
  }

  // Simpan kata sandi baru
  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(kata_sandi_baru, salt);
  setPengaturan('admin_password', newHash);

  req.session.flash = { success: 'Kata sandi berhasil diperbarui dengan aman.' };
  res.redirect('/pengaturan');
});

module.exports = router;
