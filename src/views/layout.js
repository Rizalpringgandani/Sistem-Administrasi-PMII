/**
 * Layout Induk Antarmuka Sistem Administrasi PMII Rayon (100% Luring)
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderLayout({ title, activeMenu = 'dashboard', content = '', flash = null, settings = {} }) {
  const namaRayon = escapeHtml(settings.nama_rayon || 'Rayon PMII');
  const namaKomisariat = escapeHtml(settings.nama_komisariat || 'Komisariat');
  const logoPmii = settings.logo_pmii || '/img/pmii-logo.svg';
  const logoRayon = settings.logo_rayon ? settings.logo_rayon : null;

  // Flash messages HTML
  let flashHtml = '';
  if (flash) {
    if (flash.success) {
      flashHtml += `
        <div class="alert alert-success">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>${escapeHtml(flash.success)}</div>
        </div>
      `;
    }
    if (flash.error) {
      flashHtml += `
        <div class="alert alert-danger">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <div>${escapeHtml(flash.error)}</div>
        </div>
      `;
    }
    if (flash.info) {
      flashHtml += `
        <div class="alert alert-info">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>${escapeHtml(flash.info)}</div>
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Administrasi PMII</title>
  <link rel="stylesheet" href="/css/app.css">
  <link rel="icon" type="image/svg+xml" href="${logoPmii}">
</head>
<body>
  <div class="app-wrapper">
    <!-- Sidebar Navigasi -->
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <img src="${logoRayon || logoPmii}" alt="Logo PMII" class="sidebar-logo">
        <div class="sidebar-brand">
          <h1>${namaRayon}</h1>
          <span>${namaKomisariat}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Menu Utama</div>
        <a href="/" class="nav-link ${activeMenu === 'dashboard' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>Dashboard</span>
        </a>
        <a href="/editor" class="nav-link ${activeMenu === 'editor' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          <span>Editor Dokumen F4</span>
          <span class="nav-badge-pill" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700;">Tahap 2</span>
        </a>

        <div class="nav-section-title">Dokumen & Template</div>
        <a href="/template" class="nav-link ${activeMenu === 'template' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
          </svg>
          <span>Template Surat</span>
          <span class="nav-badge-pill" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700;">Tahap 3</span>
        </a>
        <a href="/surat" class="nav-link ${activeMenu === 'surat' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <span>Surat Menyurat</span>
          <span class="nav-badge-pill" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700;">Tahap 3</span>
        </a>
        <a href="/arsip" class="nav-link ${activeMenu === 'arsip' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
          <span>Arsip Dokumen</span>
          <span class="nav-badge-pill" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-weight: 700;">Tahap 3</span>
        </a>
        <a href="/proposal-lpj" class="nav-link ${activeMenu === 'proposal-lpj' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Proposal & LPJ</span>
          <span class="nav-badge-pill">Tahap 5</span>
        </a>

        <div class="nav-section-title">Kaderisasi & Struktur</div>
        <a href="/kader" class="nav-link ${activeMenu === 'kader' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <span>Data Kader</span>
          <span class="nav-badge-pill">Tahap 4</span>
        </a>
        <a href="/jenjang" class="nav-link ${activeMenu === 'jenjang' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
          </svg>
          <span>Jenjang Kaderisasi</span>
          <span class="nav-badge-pill">Tahap 4</span>
        </a>
        <a href="/periode" class="nav-link ${activeMenu === 'periode' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span>Kepengurusan</span>
          <span class="nav-badge-pill">Tahap 4</span>
        </a>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <span>Surat Keluar / Masuk</span>
          <span class="nav-badge-pill">Tahap 4</span>
        </a>
        <a href="/proposal-lpj" class="nav-link ${activeMenu === 'proposal-lpj' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Proposal & LPJ</span>
          <span class="nav-badge-pill">Tahap 5</span>
        </a>
        <a href="/arsip" class="nav-link ${activeMenu === 'arsip' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
          <span>Arsip Dokumen</span>
          <span class="nav-badge-pill">Tahap 4</span>
        </a>

        <div class="nav-section-title">Sistem</div>
        <a href="/pengaturan" class="nav-link ${activeMenu === 'pengaturan' ? 'active' : ''}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>Pengaturan Rayon</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-status-card">
          <div class="user-avatar-badge">AD</div>
          <div class="user-info-text">
            <div class="name">Administrator</div>
            <div class="role">Sekretariat Rayon</div>
          </div>
          <a href="/logout" class="btn-logout-icon" title="Keluar dari Aplikasi" data-confirm="Apakah Anda yakin ingin keluar dari aplikasi?">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </a>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="app-main">
      <header class="app-topbar">
        <div class="topbar-title">
          <h2>${escapeHtml(title)}</h2>
          <p>${namaRayon} &bull; ${namaKomisariat}</p>
        </div>
        <div class="topbar-meta">
          <span class="badge-offline" title="Aplikasi berjalan mandiri di komputer lokal tanpa internet">
            <span class="badge-offline-dot"></span>
            Luring (Offline Penuh)
          </span>
        </div>
      </header>

      <div class="app-content">
        ${flashHtml}
        ${content}
      </div>
    </main>
  </div>

  <script src="/js/app.js"></script>
</body>
</html>`;
}

module.exports = {
  renderLayout,
  escapeHtml
};
