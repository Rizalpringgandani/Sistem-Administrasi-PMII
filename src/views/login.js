/**
 * Halaman Masuk (Login) Admin Tunggal
 */

const { escapeHtml } = require('./layout');

function renderLoginPage({ flash = null, settings = {} }) {
  const logoPmii = settings.logo_pmii || '/img/pmii-logo.svg';
  const namaRayon = escapeHtml(settings.nama_rayon || 'Rayon PMII');

  let flashHtml = '';
  if (flash && flash.error) {
    flashHtml = `
      <div class="alert alert-danger" style="margin-bottom: 1.5rem;">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <div>${escapeHtml(flash.error)}</div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Masuk - Sistem Administrasi PMII</title>
  <link rel="stylesheet" href="/css/app.css">
  <link rel="icon" type="image/svg+xml" href="${logoPmii}">
</head>
<body class="login-page">
  <div class="login-card">
    <div class="login-header">
      <img src="${logoPmii}" alt="Logo PMII">
      <h2>SISTEM ADMINISTRASI</h2>
      <p>${namaRayon}</p>
    </div>

    <div class="login-body">
      ${flashHtml}

      <form action="/login" method="POST">
        <div class="form-group">
          <label class="form-label" for="password">Kata Sandi Admin</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            class="form-control" 
            placeholder="Masukkan kata sandi..." 
            required 
            autofocus
            style="padding: 0.75rem 1rem; font-size: 1rem;"
          >
          <div class="form-hint">Kata sandi default awal: <code>admin123</code></div>
        </div>

        <button type="submit" class="btn btn-gold" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; margin-top: 0.5rem;">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
          Buka Administrasi
        </button>
      </form>
    </div>

    <div class="login-footer-info">
      Pergerakan Mahasiswa Islam Indonesia &bull; 100% Luring (Offline)
    </div>
  </div>

  <script src="/js/app.js"></script>
</body>
</html>`;
}

module.exports = {
  renderLoginPage
};
