/**
 * Tampilan Daftar Template Surat & Dokumen PMII
 */

const { escapeHtml } = require('./layout');

function renderTemplateListPage({ templates = [], settings = {} }) {
  let templateCards = '';

  if (templates.length === 0) {
    templateCards = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          Belum ada template surat. Klik tombol <strong>+ Buat Template Baru</strong> untuk membuat template surat pertama.
        </td>
      </tr>
    `;
  } else {
    templateCards = templates.map((tpl, idx) => {
      let vars = [];
      try {
        vars = JSON.parse(tpl.variabel_daftar || '[]');
      } catch (e) {
        vars = [];
      }

      const varBadges = vars.slice(0, 5).map(v => 
        `<span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 0.72rem; margin: 1px 2px; font-family: monospace;">{{${escapeHtml(v)}}}</span>`
      ).join('');

      const moreVars = vars.length > 5 ? `<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">+${vars.length - 5} lainnya</span>` : '';

      return `
        <tr>
          <td style="width: 50px; text-align: center; color: var(--text-muted); font-weight: 600;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${escapeHtml(tpl.judul)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
              Kode: <code>${escapeHtml(tpl.kode)}</code> ${tpl.is_bawaan ? '&bull; <span style="color: #059669; font-weight: 600;">Bawaan Sistem</span>' : ''}
            </div>
          </td>
          <td>
            <span style="background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
              ${escapeHtml(tpl.kategori || 'Umum')}
            </span>
          </td>
          <td>
            <div style="max-width: 320px;">
              ${varBadges || '<span style="color: var(--text-muted); font-size: 0.75rem;">Tidak ada variabel</span>'}
              ${moreVars}
            </div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <a href="/surat/baru?template_id=${tpl.id}" class="btn btn-gold btn-sm" title="Buat surat menggunakan template ini">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Buat Surat
            </a>
            <a href="/template/edit/${tpl.id}" class="btn btn-outline btn-sm" title="Sunting isi dan variabel template">
              Edit
            </a>
            ${!tpl.is_bawaan ? `
              <form action="/template/hapus/${tpl.id}" method="POST" style="display: inline-block;" onsubmit="return confirm('Apakah Anda yakin ingin menghapus template ini?');">
                <button type="submit" class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fca5a5;">
                  Hapus
                </button>
              </form>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">Kelola Template Dokumen</h1>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Template surat berkop resmi PMII dengan penanda isian otomatis seperti <code>{{tujuan}}</code>, <code>{{perihal}}</code>, dll.
        </p>
      </div>
      <div>
        <a href="/template/baru" class="btn btn-primary">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          + Buat Template Baru
        </a>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Daftar Template Surat PMII
        </h3>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Total: <strong>${templates.length}</strong> template</span>
      </div>
      <div class="card-body" style="padding: 0;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="text-align: center;">No</th>
              <th>Judul Template</th>
              <th>Kategori</th>
              <th>Penanda Variabel Isian</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${templateCards}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

module.exports = {
  renderTemplateListPage
};
