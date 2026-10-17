/**
 * Halaman Dashboard Sistem Administrasi PMII Rayon
 */

const { escapeHtml } = require('./layout');

function renderDashboardPage({ stats, settings, activePeriode }) {
  const namaRayon = escapeHtml(settings.nama_rayon || '-');
  const namaKomisariat = escapeHtml(settings.nama_komisariat || '-');
  const namaCabang = escapeHtml(settings.nama_cabang || '-');
  const kampus = escapeHtml(settings.kampus || '-');
  const alamat = escapeHtml(settings.alamat_sekretariat || '-');
  const email = escapeHtml(settings.email_rayon || '-');
  const telepon = escapeHtml(settings.telepon_rayon || '-');

  const periodeNama = activePeriode ? escapeHtml(activePeriode.nama_periode) : 'Belum Diatur';
  const ketuaRayon = activePeriode ? escapeHtml(activePeriode.ketua_rayon || '-') : '-';
  const sekretarisRayon = activePeriode ? escapeHtml(activePeriode.sekretaris_rayon || '-') : '-';

  return `
    <div style="margin-bottom: 1.75rem;">
      <div style="background: linear-gradient(135deg, #003366, #004d99); border-radius: var(--radius-lg); padding: 1.75rem 2rem; color: #ffffff; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; box-shadow: var(--shadow-md);">
        <div>
          <span style="background: rgba(255, 215, 0, 0.2); color: #ffd700; padding: 0.25rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(255, 215, 0, 0.4);">
            Selamat Bertugas, Sahabat!
          </span>
          <h1 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.5rem; color: #ffffff;">
            Sistem Administrasi ${namaRayon}
          </h1>
          <p style="color: rgba(255, 255, 255, 0.85); font-size: 0.875rem; margin-top: 0.25rem;">
            ${namaKomisariat} &bull; ${namaCabang} &bull; ${kampus}
          </p>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
          <a href="/pengaturan" class="btn btn-gold btn-sm">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Ubah Pengaturan Rayon
          </a>
          <span style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">Periode Aktif: <strong>${periodeNama}</strong></span>
        </div>
      </div>
    </div>

    <!-- Statistik Ringkasan -->
    <div class="grid-cols-4" style="margin-bottom: 1.75rem;">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4>Total Kader</h4>
          <div class="stat-number">${stats.totalKader || 0}</div>
          <p>Kader terdata</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon gold">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4>Surat Keluar</h4>
          <div class="stat-number">${stats.totalSurat || 0}</div>
          <p>Dokumen diterbitkan</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4>Proposal & LPJ</h4>
          <div class="stat-number">${stats.totalProposalLpj || 0}</div>
          <p>Tersimpan di arsip</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h4>Arsip Dokumen</h4>
          <div class="stat-number">${stats.totalDokumen || 0}</div>
          <p>Seluruh riwayat berkas</p>
        </div>
      </div>
    </div>

    <!-- Informasi Identitas & Panduan -->
    <div class="grid-cols-2">
      <!-- Identitas Rayon -->
      <div class="card">
        <div class="card-header">
          <h3>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Identitas Sekretariat Rayon
          </h3>
          <a href="/pengaturan" class="btn btn-outline btn-sm">Edit Data</a>
        </div>
        <div class="card-body" style="padding: 0;">
          <table class="data-table">
            <tbody>
              <tr>
                <td style="width: 35%; font-weight: 600; color: var(--text-muted);">Nama Rayon</td>
                <td><strong>${namaRayon}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: var(--text-muted);">Komisariat</td>
                <td>${namaKomisariat}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: var(--text-muted);">Pengurus Cabang</td>
                <td>${namaCabang}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: var(--text-muted);">Kampus / Perguruan Tinggi</td>
                <td>${kampus}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: var(--text-muted);">Ketua Rayon</td>
                <td>${ketuaRayon}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: var(--text-muted);">Sekretaris Rayon</td>
                <td>${sekretarisRayon}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: var(--text-muted);">Alamat Sekretariat</td>
                <td>${alamat}</td>
              </tr>
              <tr>
                <td style="font-weight: 600; color: var(--text-muted);">Kontak / Email</td>
                <td>${telepon} / ${email}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Roadmap & Status Tahap -->
      <div class="card">
        <div class="card-header">
          <h3>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            Status Pengembangan Bertahap
          </h3>
          <span style="font-size: 0.75rem; background: #ecfdf5; color: #065f46; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;">Tahap 1 Aktif</span>
        </div>
        <div class="card-body">
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;">✓</span>
              <div>
                <strong style="color: var(--text-main); font-size: 0.85rem;">Tahap 1: Pondasi Proyek, Database SQLite & Autentikasi</strong>
                <p style="font-size: 0.775rem; color: var(--text-muted);">Struktur 8 tabel SQLite, login admin tunggal, dan identitas rayon.</p>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 0.75rem; opacity: 0.65;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #94a3b8; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;">2</span>
              <div>
                <strong style="color: var(--text-main); font-size: 0.85rem;">Tahap 2: Manajemen Data Kader & Struktur Kepengurusan</strong>
                <p style="font-size: 0.775rem; color: var(--text-muted);">Biodata kader, jenjang kaderisasi (Mapaba/PKD/dll), dan pengurus per periode.</p>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 0.75rem; opacity: 0.65;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #94a3b8; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;">3</span>
              <div>
                <strong style="color: var(--text-main); font-size: 0.85rem;">Tahap 3: Mesin Editor Dokumen F4 (215 x 330 mm)</strong>
                <p style="font-size: 0.775rem; color: var(--text-muted);">TipTap luring dengan dukungan tabel, kop surat rayon, dan gambar.</p>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 0.75rem; opacity: 0.65;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #94a3b8; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;">4</span>
              <div>
                <strong style="color: var(--text-main); font-size: 0.85rem;">Tahap 4: Modul Surat & Penomoran Otomatis PMII</strong>
                <p style="font-size: 0.775rem; color: var(--text-muted);">Pembuatan surat dari template dan sistem arsip surat masuk/keluar.</p>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 0.75rem; opacity: 0.65;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #94a3b8; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0;">5</span>
              <div>
                <strong style="color: var(--text-main); font-size: 0.85rem;">Tahap 5: Proposal & LPJ, Ekspor Word (.docx) & PDF F4</strong>
                <p style="font-size: 0.775rem; color: var(--text-muted);">Pembuat proposal/LPJ, download Word, dan cetak luring presisi F4.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  renderDashboardPage
};
