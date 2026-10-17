/**
 * Formulir Isian Buat Surat Baru dari Template PMII
 */

const { escapeHtml } = require('./layout');

function renderSuratFormPage({ templates = [], selectedTemplate = null, nomorUsulan = {}, settings = {}, activePeriode = null }) {
  const templateOptions = templates.map(t => 
    `<option value="${t.id}" ${selectedTemplate && selectedTemplate.id === t.id ? 'selected' : ''}>
      ${escapeHtml(t.judul)} (${escapeHtml(t.kategori || 'Umum')})
    </option>`
  ).join('');

  // Default values
  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const defaultKetua = activePeriode ? escapeHtml(activePeriode.ketua_rayon || '') : '';
  const defaultSekretaris = activePeriode ? escapeHtml(activePeriode.sekretaris_rayon || '') : '';
  const defaultTempatSurat = escapeHtml(settings.nama_cabang ? settings.nama_cabang.replace(/^PC\s+/i, '') : 'Tempat');

  // Variabel yang terdeteksi dari template yang dipilih
  let vars = [];
  if (selectedTemplate && selectedTemplate.variabel_daftar) {
    try {
      vars = JSON.parse(selectedTemplate.variabel_daftar);
    } catch (e) {
      vars = [];
    }
  }

  // Label ramah bahasa Indonesia untuk setiap nama variabel umum
  const labelMap = {
    'nomor_surat': 'Nomor Surat',
    'lampiran': 'Lampiran',
    'perihal': 'Perihal Surat',
    'tanggal_surat': 'Tanggal Surat',
    'tempat_surat': 'Tempat Diterbitkan Surat',
    'tujuan': 'Tujuan Surat (Nama / Lembaga Penerima)',
    'tempat_tujuan': 'Tempat / Kota Penerima',
    'nama_kegiatan': 'Nama Agenda / Kegiatan',
    'hari_tanggal': 'Hari, Tanggal Kegiatan',
    'waktu': 'Waktu Kegiatan (WIB)',
    'tempat': 'Tempat Kegiatan',
    'nama_ketua': 'Nama Ketua Rayon',
    'nama_sekretaris': 'Nama Sekretaris Rayon'
  };

  // Nilai default untuk variabel
  const valueMap = {
    'nomor_surat': nomorUsulan.nomor || '',
    'lampiran': '-',
    'perihal': selectedTemplate ? selectedTemplate.judul : '',
    'tanggal_surat': todayStr,
    'tempat_surat': defaultTempatSurat,
    'nama_ketua': defaultKetua,
    'nama_sekretaris': defaultSekretaris
  };

  // Formulir input dinamis
  let dynamicInputs = '';
  if (vars.length > 0) {
    dynamicInputs = vars.map(v => {
      const label = labelMap[v] || v.replace(/_/g, ' ').toUpperCase();
      const val = valueMap[v] !== undefined ? valueMap[v] : '';
      const isRequired = ['tujuan', 'perihal', 'nomor_surat'].includes(v);

      return `
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" for="var_${v}">
            ${escapeHtml(label)} <span style="font-size: 0.72rem; color: #0284c7; font-family: monospace;">{{${v}}}</span>
            ${isRequired ? '<span class="required">*</span>' : ''}
          </label>
          <input 
            type="text" 
            id="var_${v}" 
            name="vars[${v}]" 
            class="form-control" 
            value="${escapeHtml(val)}" 
            placeholder="Masukkan ${escapeHtml(label.toLowerCase())}..." 
            ${isRequired ? 'required' : ''}
          >
        </div>
      `;
    }).join('');
  } else if (selectedTemplate) {
    dynamicInputs = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); background: #f8fafc; border-radius: var(--radius-sm);">
        Template ini tidak memiliki variabel penanda kurung kurawal ganda <code>{{...}}</code>. Anda dapat langsung membuka dokumen di editor.
      </div>
    `;
  }

  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
        <a href="/surat" class="btn btn-outline btn-sm">&larr; Kembali ke Daftar Surat</a>
        <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin: 0;">Buat Surat Baru dari Template</h1>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Langkah 1: Pilih Template Surat
          </h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label" for="select-template">Pilih Template yang Digunakan <span class="required">*</span></label>
            <select id="select-template" class="form-control" onchange="if(this.value) window.location.href='/surat/baru?template_id='+this.value">
              <option value="">-- Pilih Template Surat --</option>
              ${templateOptions}
            </select>
            <div class="form-hint">Memuat struktur resmi, kop surat, dan penanda isian otomatis.</div>
          </div>
        </div>
      </div>

      ${selectedTemplate ? `
        <form action="/surat/proses-template" method="POST">
          <input type="hidden" name="template_id" value="${selectedTemplate.id}">

          <div class="card">
            <div class="card-header">
              <h3>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Langkah 2: Isi Formulir Penanda Dokumen
              </h3>
              <span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
                Template: ${escapeHtml(selectedTemplate.judul)}
              </span>
            </div>
            <div class="card-body">
              <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.825rem; color: #854d0e;">
                <strong>Penomoran Surat Otomatis:</strong> Sistem mengusulkan nomor urut surat tahun <strong>${nomorUsulan.tahun || ''}</strong> berdasarkan format pengaturan. Anda tetap dapat mengubah nomor surat di bawah ini bila diperlukan.
              </div>

              ${dynamicInputs}
            </div>
            <div class="card-footer">
              <button type="submit" class="btn btn-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                Buka Dokumen di Editor F4 &rarr;
              </button>
            </div>
          </div>
        </form>
      ` : ''}
    </div>
  `;
}

module.exports = {
  renderSuratFormPage
};
