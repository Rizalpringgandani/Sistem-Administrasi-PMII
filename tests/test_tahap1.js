/**
 * Skrip Pengujian Otomatis Tahap 1 - Sistem Administrasi PMII Rayon
 */

const assert = require('node:assert');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');

console.log('--- MEMULAI PENGUJIAN TAHAP 1 ---');

// 1. Verifikasi File Basis Data & Modul
const { db, getPengaturan, setPengaturan, getAllPengaturan } = require('../src/database/db');
const dbFilePath = path.join(__dirname, '../data/administrasi.db');
assert.ok(fs.existsSync(dbFilePath), 'File database administrasi.db harus ada');
console.log('✓ File database administrasi.db terverifikasi.');

// 2. Verifikasi 8 Tabel Wajib
const requiredTables = [
  'pengaturan',
  'kader',
  'jenjang',
  'jenjang_kader',
  'periode',
  'jabatan_kader',
  'template',
  'dokumen'
];

const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
for (const table of requiredTables) {
  assert.ok(existingTables.includes(table), `Tabel '${table}' harus ada dalam database.`);
}
console.log('✓ Seluruh 8 tabel wajib terverifikasi:', requiredTables.join(', '));

// 3. Verifikasi Seeding Awal (Kata Sandi, Jenjang Kaderisasi, Periode, Pengaturan)
const adminHash = getPengaturan('admin_password');
assert.ok(adminHash, 'Kata sandi admin harus ada di tabel pengaturan');
assert.ok(bcrypt.compareSync('admin123', adminHash), 'Kata sandi default harus dapat diakses dengan admin123');
console.log('✓ Akun admin default (admin123) terverifikasi.');

const jenjangList = db.prepare('SELECT nama_jenjang, tingkat FROM jenjang ORDER BY tingkat ASC').all();
assert.strictEqual(jenjangList.length, 4, 'Harus ada 4 jenjang kaderisasi baku');
assert.deepStrictEqual(jenjangList.map(j => j.nama_jenjang), ['Mapaba', 'PKD', 'PKL', 'PKN']);
console.log('✓ Seeding 4 jenjang kaderisasi PMII terverifikasi: Mapaba, PKD, PKL, PKN.');

const periodeAktif = db.prepare('SELECT * FROM periode WHERE status_aktif = 1').get();
assert.ok(periodeAktif, 'Harus ada periode aktif awal');
console.log('✓ Seeding periode aktif terverifikasi:', periodeAktif.nama_periode);

const allSettings = getAllPengaturan();
assert.ok(allSettings.nama_rayon, 'Pengaturan nama_rayon harus ada');
assert.ok(allSettings.nama_komisariat, 'Pengaturan nama_komisariat harus ada');
assert.ok(allSettings.format_nomor_surat, 'Pengaturan format_nomor_surat harus ada');
console.log('✓ Seeding pengaturan identitas rayon terverifikasi.');

// 4. Verifikasi Update Pengaturan
setPengaturan('test_kunci', 'test_nilai_1960');
assert.strictEqual(getPengaturan('test_kunci'), 'test_nilai_1960', 'Update pengaturan harus berhasil');
db.prepare("DELETE FROM pengaturan WHERE kunci = 'test_kunci'").run();
console.log('✓ Operasi baca-tulis pengaturan terverifikasi.');

console.log('\n--- SELURUH PENGUJIAN BASIS DATA TAHAP 1 LULUS 100% ---');
