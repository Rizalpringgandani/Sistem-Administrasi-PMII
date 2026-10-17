const express = require('express');
const router = express.Router();
const { db, getAllPengaturan } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { renderLayout } = require('../views/layout');
const { renderDashboardPage } = require('../views/dashboard');

router.get('/', requireAuth, (req, res) => {
  const settings = getAllPengaturan();
  const flash = req.session.flash || null;
  req.session.flash = null;

  // Query statistik ringkas
  const totalKader = db.prepare('SELECT COUNT(*) as c FROM kader').get().c;
  const totalSurat = db.prepare("SELECT COUNT(*) as c FROM dokumen WHERE jenis = 'surat_keluar'").get().c;
  const totalProposalLpj = db.prepare("SELECT COUNT(*) as c FROM dokumen WHERE jenis IN ('proposal', 'lpj')").get().c;
  const totalDokumen = db.prepare('SELECT COUNT(*) as c FROM dokumen').get().c;

  // Query periode aktif saat ini
  const activePeriode = db.prepare('SELECT * FROM periode WHERE status_aktif = 1 LIMIT 1').get() || null;

  const content = renderDashboardPage({
    stats: {
      totalKader,
      totalSurat,
      totalProposalLpj,
      totalDokumen
    },
    settings,
    activePeriode
  });

  const html = renderLayout({
    title: 'Dashboard Administrasi',
    activeMenu: 'dashboard',
    content,
    flash,
    settings
  });

  res.send(html);
});

module.exports = router;
