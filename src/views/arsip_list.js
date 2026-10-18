/**
 * Halaman Arsip Dokumen PMII Rayon (Surat, Proposal, LPJ)
 */

const { escapeHtml } = require('./layout');

function renderArsipListPage({ dokumenList = [], searchQuery = '', selectedJenis = '', settings = {} }) {
  let docRows = '';

  if (dokumenList.length === 0) {
    docRows = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          ${searchQuery ? 'Tidak ada arsip dokumen yang cocok dengan kata kunci pencarian.' : 'Belum ada dokumen yang diarsipkan. Buat surat baru melalui menu Surat Menyurat.'}
        </td>
      </tr>
    `;
  } else {
    docRows = dokumenList.map((doc, idx) => {
      let jenisBadge = '';
      if (doc.jenis === 'surat_keluar') {
        jenisBadge = '<span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">Surat Keluar</span>';
      } else if (doc.jenis === 'proposal') {
        jenisBadge = '<span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">Proposal</span>';
      } else if (doc.jenis === 'lpj') {
        jenisBadge = '<span style="background: #f3e8ff; color: #7e22ce; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">LPJ</span>';
      } else {
        jenisBadge = `<span style="background: #f1f5f9; color: #334155; padding: 2px 8px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">${escapeHtml(doc.jenis || 'Dokumen')}</span>`;
      }

      return `
        <tr>
          <td style="width: 40px; text-align: center; color: var(--text-muted); font-weight: 600;">${idx + 1}</td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-family: monospace; font-size: 0.875rem;">
              ${escapeHtml(doc.nomor_dokumen || '-')}
              ${doc.sifat_surat ? `<span style="font-size: 0.68rem; background: ${doc.sifat_surat === '01' ? '#dcfce7; color: #166534' : '#fee2e2; color: #991b1b'}; padding: 1px 6px; border-radius: 4px; font-weight: 700; margin-left: 4px;">${doc.sifat_surat === '01' ? 'Internal' : 'Eksternal'}</span>` : ''}
            </div>
            ${doc.no_urut_total ? `<div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">No. Total: #${String(doc.no_urut_total).padStart(3, '0')} ${doc.no_urut_jenis ? `&bull; No. Jenis: #${String(doc.no_urut_jenis).padStart(3, '0')}` : ''} ${doc.kode_penandatangan ? `&bull; [${escapeHtml(doc.kode_penandatangan)}]` : ''}</div>` : ''}
          </td>
          <td style="white-space: nowrap; font-size: 0.825rem; color: #475569;">
            ${escapeHtml(doc.tanggal_dokumen || '-')}
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem;">
              ${escapeHtml(doc.judul)}
            </div>
            ${doc.perihal ? `<div style="font-size: 0.75rem; color: var(--text-muted);">Hal: ${escapeHtml(doc.perihal)}</div>` : ''}
          </td>
          <td style="font-size: 0.85rem; color: #334155;">
            ${escapeHtml(doc.tujuan || '-')}
          </td>
          <td>
            ${jenisBadge}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <a href="/surat/buka/${doc.id}" class="btn btn-primary btn-sm" title="Buka ulang dan sunting di editor F4">
              Buka Ulang
            </a>
            <a href="/dokumen/${doc.id}/export-word" class="btn btn-outline btn-sm" title="Unduh berkas Word (.docx)">
              Unduh Word
            </a>
            <a href="/dokumen/${doc.id}/cetak" target="_blank" class="btn btn-gold btn-sm" title="Cetak atau simpan PDF F4">
              Cetak / PDF
            </a>
            <form action="/dokumen/${doc.id}/hapus" method="POST" style="display: inline-block;" onsubmit="return confirm('Apakah Anda yakin ingin menghapus arsip dokumen ini? Dokumen yang terhapus tidak dapat dikembalikan.');">
              <button type="submit" class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fca5a5;" title="Hapus dari arsip">
                Hapus
              </button>
            </form>
          </td>
        </tr>
      `;
    }).join('');
  }

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">Arsip Dokumen Rayon</h1>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Pusat penyimpanan riwayat seluruh surat menyurat dan dokumen resmi yang pernah diterbitkan.
        </p>
      </div>
      <div>
        <a href="/surat/baru" class="btn btn-primary">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          + Buat Surat Baru
        </a>
      </div>
    </div>

    <!-- Kotak Filter & Pencarian -->
    <div class="card" style="margin-bottom: 1.25rem;">
      <div class="card-body" style="padding: 1rem 1.25rem;">
        <form action="/arsip" method="GET" style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 250px;">
            <input 
              type="text" 
              name="q" 
              class="form-control" 
              value="${escapeHtml(searchQuery)}" 
              placeholder="Cari nomor dokumen, perihal, judul, atau tujuan..."
            >
          </div>
          <div style="width: 180px;">
            <select name="jenis" class="form-control">
              <option value="">Semua Jenis</option>
              <option value="surat_keluar" ${selectedJenis === 'surat_keluar' ? 'selected' : ''}>Surat Keluar</option>
              <option value="proposal" ${selectedJenis === 'proposal' ? 'selected' : ''}>Proposal</option>
              <option value="lpj" ${selectedJenis === 'lpj' ? 'selected' : ''}>LPJ</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            Cari Arsip
          </button>
          ${searchQuery || selectedJenis ? `
            <a href="/arsip" class="btn btn-outline btn-sm">Reset</a>
          ` : ''}
        </form>
      </div>
    </div>

    <!-- Tabel Arsip Dokumen -->
    <div class="card">
      <div class="card-header">
        <h3>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
          Daftar Arsip Dokumen
        </h3>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Total: <strong>${dokumenList.length}</strong> dokumen</span>
      </div>
      <div class="card-body" style="padding: 0;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="text-align: center;">No</th>
              <th>Nomor Dokumen</th>
              <th>Tanggal</th>
              <th>Judul / Perihal</th>
              <th>Tujuan</th>
              <th>Jenis</th>
              <th style="text-align: right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${docRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

module.exports = {
  renderArsipListPage
};
