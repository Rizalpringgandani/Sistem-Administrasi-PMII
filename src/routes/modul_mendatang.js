const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getAllPengaturan } = require('../database/db');
const { renderLayout } = require('../views/layout');

const infoModul = {
  '/surat': {
    judul: 'Pembuatan Surat & Penomoran Otomatis',
    tahap: 'Tahap 3',
    menu: 'surat',
    deskripsi: 'Modul surat keluar/masuk dari template dengan penomoran otomatis standar PMII dan arsip dokumen.'
  },
  '/arsip': {
    judul: 'Arsip Dokumen Rayon',
    tahap: 'Tahap 3',
    menu: 'arsip',
    deskripsi: 'Modul pencarian cepat dan penyimpanan seluruh arsip surat, proposal, dan SK rayon.'
  },
  '/kader': {
    judul: 'Data Kader PMII',
    tahap: 'Tahap 4',
    menu: 'kader',
    deskripsi: 'Modul pengelolaan biodata lengkap kader, angkatan, jurusan, kontak, dan status keaktifan.'
  },
  '/jenjang': {
    judul: 'Jenjang Kaderisasi',
    tahap: 'Tahap 4',
    menu: 'jenjang',
    deskripsi: 'Modul pencatatan riwayat kaderisasi formal PMII (Mapaba, PKD, PKL, PKN) dan sertifikasi.'
  },
  '/periode': {
    judul: 'Struktur Kepengurusan Rayon',
    tahap: 'Tahap 4',
    menu: 'periode',
    deskripsi: 'Modul penetapan periode kepengurusan aktif dan susunan pengurus (BPH & Biro).'
  },
  '/proposal-lpj': {
    judul: 'Pembuatan Proposal & LPJ',
    tahap: 'Tahap 5',
    menu: 'proposal-lpj',
    deskripsi: 'Modul pembuatan proposal kegiatan dan LPJ dari template, cetak F4, dan export file Word (.docx).'
  }
};

for (const [pathUrl, info] of Object.entries(infoModul)) {
  router.get(pathUrl, requireAuth, (req, res) => {
    const settings = getAllPengaturan();
    const content = `
      <div class="card" style="max-width: 680px; margin: 2rem auto; text-align: center; padding: 2rem;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--gold-subtle); color: var(--gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
          <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <span style="font-size: 0.75rem; background: var(--info-bg); color: var(--info); font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 9999px;">
          ${info.tahap}
        </span>
        <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-top: 0.75rem;">
          ${info.judul}
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; line-height: 1.6;">
          ${info.deskripsi}
        </p>
        <div style="margin-top: 1.75rem; padding: 1rem; background: #f8fafc; border-radius: var(--radius-sm); border: 1px dashed var(--border); font-size: 0.8rem; color: var(--text-muted);">
          Sesuai aturan kerja <em>"Satu tahap per sesi"</em>, modul ini akan diaktifkan secara bertahap pada sesi pengerjaan berikutnya.
        </div>
        <div style="margin-top: 1.5rem;">
          <a href="/" class="btn btn-primary btn-sm">Kembali ke Dashboard</a>
        </div>
      </div>
    `;

    const html = renderLayout({
      title: info.judul,
      activeMenu: info.menu,
      content,
      settings
    });

    res.send(html);
  });
}

module.exports = router;
