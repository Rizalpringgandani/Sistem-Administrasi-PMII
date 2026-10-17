/**
 * Halaman Manajemen Surat Menyurat PMII Rayon
 */

const { escapeHtml } = require('./layout');

function renderSuratListPage({ suratList = [], templates = [], settings = {} }) {
  let suratRows = '';

  if (suratList.length === 0) {
    suratRows = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          Belum ada surat yang diterbitkan. Klik tombol <strong>+ Buat Surat Baru</strong> untuk membuat surat pertama dari template.
        </td>
      </tr>
    `;
  } else {
    suratRows = suratList.map((doc, idx) => {
      return `
        <tr>
          <td style="width: 40px; text-align: center; color: var(--text-muted); font-weight: 600;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-family: monospace; font-size: 0.9rem;">
              ${escapeHtml(doc.nomor_dokumen || '-')}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Tgl: ${escapeHtml(doc.tanggal_dokumen || '-')}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">
              ${escapeHtml(doc.judul)}
            </div>
            ${doc.perihal ? `<div style="font-size: 0.75rem; color: var(--text-muted);">Hal: ${escapeHtml(doc.perihal)}</div>` : ''}
          </td>
          <td>
            <div style="font-size: 0.85rem; color: #334155;">
              ${escapeHtml(doc.tujuan || '-')}
            </div>
          </td>
          <td>
            <span style="background: #ecfdf5; color: #065f46; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
              ${escapeHtml(doc.status || 'diarsipkan')}
            </span>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <a href="/surat/buka/${doc.id}" class="btn btn-primary btn-sm" title="Buka dan sunting kembali di editor F4">
              Buka Editor
            </a>
            <a href="/dokumen/${doc.id}/export-word" class="btn btn-outline btn-sm" title="Unduh berkas Word .docx F4">
              Word (.docx)
            </a>
            <a href="/dokumen/${doc.id}/cetak" target="_blank" class="btn btn-gold btn-sm" title="Cetak atau simpan PDF F4">
              Cetak / PDF
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Ringkasan Kartu Template Cepat
  const templateBadges = templates.slice(0, 4).map(t => `
    <div style="background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">${escapeHtml(t.judul)}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">Kategori: ${escapeHtml(t.kategori || 'Umum')}</div>
      </div>
      <a href="/surat/baru?template_id=${t.id}" class="btn btn-gold btn-sm">Gunakan</a>
    </div>
  `).join('');

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">Surat Menyurat PMII Rayon</h1>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Pembuatan surat resmi dari template, penomoran urut otomatis, simpan arsip, dan ekspor Word/PDF.
        </p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <a href="/template" class="btn btn-outline">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          Kelola Template
        </a>
        <a href="/surat/baru" class="btn btn-primary">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          + Buat Surat Baru
        </a>
      </div>
    </div>

    <!-- Pilihan Cepat Template -->
    <div style="margin-bottom: 1.5rem;">
      <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">Pilihan Cepat Template Surat</h3>
      <div class="grid-cols-2" style="gap: 0.75rem;">
        ${templateBadges || '<div style="color: var(--text-muted);">Belum ada template.</div>'}
      </div>
    </div>

    <!-- Riwayat Surat Keluar -->
    <div class="card">
      <div class="card-header">
        <h3>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          Daftar Surat Keluar Terbit
        </h3>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Total: <strong>${suratList.length}</strong> surat</span>
      </div>
      <div class="card-body" style="padding: 0;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="text-align: center;">No</th>
              <th>Nomor Surat</th>
              <th>Perihal / Judul</th>
              <th>Tujuan</th>
              <th>Status</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${suratRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

module.exports = {
  renderSuratListPage
};
