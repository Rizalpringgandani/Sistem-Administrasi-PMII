/**
 * Formulir Isian Buat Surat Baru dari Template PMII
 * Sesuai Pedoman Penyelenggaraan Tertib Administrasi (PPTA) PMII
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
    'nomor_surat': 'Nomor Surat Resmi',
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
    'tema': 'Tema Kegiatan',
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
    'nama_sekretaris': defaultSekretaris,
    'tema': '-'
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

  const sifatSuratVal = nomorUsulan.sifat_surat || '01';
  const ttdVal = nomorUsulan.kode_penandatangan || 'A-I';
  const isPanitia = Boolean(nomorUsulan.nama_panitia);

  return `
    <div style="max-width: 850px; margin: 0 auto;">
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
        <a href="/surat" class="btn btn-outline btn-sm">&larr; Kembali ke Daftar Surat</a>
        <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin: 0;">Buat Surat Baru dari Template PMII</h1>
      </div>

      <!-- LANGKAH 1: PILIH TEMPLATE -->
      <div class="card" style="margin-bottom: 1.5rem;">
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
            <div class="form-hint">Memuat struktur resmi, kop surat 3 kolom, dan penanda isian otomatis F4.</div>
          </div>
        </div>
      </div>

      ${selectedTemplate ? `
        <form action="/surat/proses-template" method="POST" id="form-buat-surat">
          <input type="hidden" name="template_id" value="${selectedTemplate.id}">

          <!-- Hidden Input Metadata Counter Mandiri & Penomoran PPTA -->
          <input type="hidden" name="no_urut_total" id="hidden-no-total" value="${nomorUsulan.no_urut_total || ''}">
          <input type="hidden" name="no_urut_jenis" id="hidden-no-jenis" value="${nomorUsulan.no_urut_jenis || ''}">
          <input type="hidden" name="sifat_surat" id="hidden-sifat-surat" value="${sifatSuratVal}">
          <input type="hidden" name="kode_penandatangan" id="hidden-kode-ttd" value="${ttdVal}">
          <input type="hidden" name="nama_panitia" id="hidden-nama-panitia" value="${escapeHtml(nomorUsulan.nama_panitia || '')}">
          <input type="hidden" name="bulan_surat" id="hidden-bulan-surat" value="${nomorUsulan.bulan_surat || ''}">
          <input type="hidden" name="tahun_surat" id="hidden-tahun-surat" value="${nomorUsulan.tahun_surat || ''}">

          <!-- LANGKAH 2: PARAMETER PENOMORAN RESMI PPTA -->
          <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-header" style="background: #f0fdf4; border-bottom: 1px solid #bbf7d0;">
              <h3 style="color: #166534;">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Langkah 2: Parameter & Penomoran Resmi PPTA PMII (2 Counter Terpisah)
              </h3>
            </div>
            <div class="card-body">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="select-sifat-surat">
                    Sifat Surat <span class="required">*</span>
                  </label>
                  <select id="select-sifat-surat" class="form-control">
                    <option value="01" ${sifatSuratVal === '01' ? 'selected' : ''}>01 - Internal (Rayon, Komisariat, Cabang, Anggota)</option>
                    <option value="02" ${sifatSuratVal === '02' ? 'selected' : ''}>02 - Eksternal (Rektorat, Dekanat, BEM, Ormas, Instansi)</option>
                  </select>
                  <div class="form-hint">Menentukan kode sifat surat dan penghitung counter urut jenis.</div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="select-kode-ttd">
                    Penandatanganan Surat (Romawi) <span class="required">*</span>
                  </label>
                  <select id="select-kode-ttd" class="form-control">
                    <option value="A-I" ${ttdVal === 'A-I' ? 'selected' : ''}>A-I : Ketua Umum/Rayon & Sekretaris Umum/Rayon (Standar)</option>
                    <option value="A-0" ${ttdVal === 'A-0' ? 'selected' : ''}>A-0 : Hanya Ketua Umum/Rayon (Surat Khusus/Mandat)</option>
                    <option value="A-II" ${ttdVal === 'A-II' ? 'selected' : ''}>A-II : Ketua Umum/Rayon & Wakil Sekretaris</option>
                    <option value="B-I" ${ttdVal === 'B-I' ? 'selected' : ''}>B-I : Wakil Ketua & Sekretaris Umum/Rayon</option>
                    <option value="B-II" ${ttdVal === 'B-II' ? 'selected' : ''}>B-II : Wakil Ketua & Wakil Sekretaris</option>
                    <option value="C-I" ${ttdVal === 'C-I' ? 'selected' : ''}>C-I : Ketua Panitia & Sekretaris Panitia (Surat Panpel)</option>
                  </select>
                  <div class="form-hint">Sesuai aturan penandatanganan pimpinan PMII di PPTA.</div>
                </div>
              </div>

              <!-- Surat Kepanitiaan Toggle -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1.25rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 700; font-size: 0.875rem; color: #1e293b; margin: 0;">
                  <input type="checkbox" id="check-is-panitia" ${isPanitia ? 'checked' : ''}>
                  Surat Diterbitkan oleh Panitia Pelaksana Kegiatan (OC / SC)
                </label>
                <div id="panitia-input-container" style="margin-top: 0.75rem; display: ${isPanitia ? 'block' : 'none'};">
                  <label class="form-label" for="input-panitia" style="font-size: 0.8rem;">Nama / Singkatan Panitia (misal: <code>PANPEL-RTAR-V</code> atau <code>PANPEL-PKL-VI</code>):</label>
                  <input 
                    type="text" 
                    id="input-panitia" 
                    class="form-control" 
                    placeholder="PANPEL-RTAR-V"
                    value="${escapeHtml(nomorUsulan.nama_panitia || '')}"
                  >
                  <div class="form-hint">Nama panitia akan disisipkan setelah nomor urut total sesuai standar PPTA.</div>
                </div>
              </div>

              <!-- Live Preview Kotak Nomor Surat PPTA -->
              <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: var(--radius-sm); padding: 1rem 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span style="font-size: 0.75rem; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">
                    Usulan Nomor Surat Resmi (Standar PPTA)
                  </span>
                  <div style="display: flex; gap: 0.5rem;">
                    <span style="background: #dbeafe; color: #1e40af; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
                      Counter Total: #<span id="badge-counter-total">${nomorUsulan.no_urut_total || '1'}</span>
                    </span>
                    <span style="background: #dcfce7; color: #166534; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 700;">
                      Counter Jenis (<span id="badge-jenis-label">${sifatSuratVal === '01' ? 'Internal' : 'Eksternal'}</span>): #<span id="badge-counter-jenis">${nomorUsulan.no_urut_jenis || '1'}</span>
                    </span>
                  </div>
                </div>
                <div style="font-family: monospace; font-size: 1.15rem; font-weight: 800; color: #0f172a; word-break: break-all;" id="display-nomor-surat">
                  ${escapeHtml(nomorUsulan.nomor || '')}
                </div>
                <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.35rem;">
                  Format titik resmi: <code>[No_Total].[Panitia].[Tingkat_Periode].[Wilayah].[Jenis].[No_Jenis].[Kode_Ttd].[Bulan].[Tahun]</code>
                </div>
              </div>
            </div>
          </div>

          <!-- LANGKAH 3: ISI FORMULIR PENANDA DOKUMEN -->
          <div class="card">
            <div class="card-header">
              <h3>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Langkah 3: Isi Formulir Penanda Dokumen
              </h3>
              <span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">
                Template: ${escapeHtml(selectedTemplate.judul)}
              </span>
            </div>
            <div class="card-body">
              <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: var(--radius-sm); padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.825rem; color: #854d0e;">
                Penanda <code>{{...}}</code> di bawah ini akan disubstitusikan ke lembar surat F4. Nomor surat otomatis terisi dari usulan di atas, namun tetap dapat Anda sesuaikan bila memiliki kebutuhan khusus.
              </div>

              ${dynamicInputs}
            </div>
            <div class="card-footer">
              <button type="submit" class="btn btn-primary" style="padding: 0.65rem 1.25rem; font-size: 0.95rem;">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                Buka Dokumen di Editor F4 &rarr;
              </button>
            </div>
          </div>
        </form>

        <!-- SCRIPT CLIENT-SIDE UPDATE PENOMORAN PPTA OTOMATIS -->
        <script>
          (function() {
            const selectSifat = document.getElementById('select-sifat-surat');
            const selectTtd = document.getElementById('select-kode-ttd');
            const checkPanitia = document.getElementById('check-is-panitia');
            const panitiaContainer = document.getElementById('panitia-input-container');
            const inputPanitia = document.getElementById('input-panitia');

            const displayNomor = document.getElementById('display-nomor-surat');
            const badgeCounterTotal = document.getElementById('badge-counter-total');
            const badgeCounterJenis = document.getElementById('badge-counter-jenis');
            const badgeJenisLabel = document.getElementById('badge-jenis-label');

            const hiddenNoTotal = document.getElementById('hidden-no-total');
            const hiddenNoJenis = document.getElementById('hidden-no-jenis');
            const hiddenSifat = document.getElementById('hidden-sifat-surat');
            const hiddenTtd = document.getElementById('hidden-kode-ttd');
            const hiddenPanitia = document.getElementById('hidden-nama-panitia');
            const hiddenBulan = document.getElementById('hidden-bulan-surat');
            const hiddenTahun = document.getElementById('hidden-tahun-surat');
            const inputVarNomor = document.getElementById('var_nomor_surat');

            checkPanitia.addEventListener('change', () => {
              if (checkPanitia.checked) {
                panitiaContainer.style.display = 'block';
                if (selectTtd.value === 'A-I') selectTtd.value = 'C-I';
              } else {
                panitiaContainer.style.display = 'none';
                inputPanitia.value = '';
                if (selectTtd.value === 'C-I') selectTtd.value = 'A-I';
              }
              refreshNomorSurat();
            });

            selectSifat.addEventListener('change', refreshNomorSurat);
            selectTtd.addEventListener('change', refreshNomorSurat);
            inputPanitia.addEventListener('input', debounce(refreshNomorSurat, 300));

            let debounceTimer = null;
            function debounce(func, delay) {
              return function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(this, arguments), delay);
              };
            }

            async function refreshNomorSurat() {
              const sifatVal = selectSifat.value;
              const ttdVal = selectTtd.value;
              const panitiaVal = checkPanitia.checked ? inputPanitia.value.trim() : '';

              try {
                const url = '/api/surat/hitung-nomor?sifat_surat=' + encodeURIComponent(sifatVal) +
                            '&kode_penandatangan=' + encodeURIComponent(ttdVal) +
                            '&nama_panitia=' + encodeURIComponent(panitiaVal);
                const res = await fetch(url);
                const json = await res.json();
                if (json.success && json.data) {
                  const data = json.data;
                  displayNomor.textContent = data.nomor;
                  badgeCounterTotal.textContent = data.no_urut_total;
                  badgeCounterJenis.textContent = data.no_urut_jenis;
                  badgeJenisLabel.textContent = sifatVal === '01' ? 'Internal' : 'Eksternal';

                  hiddenNoTotal.value = data.no_urut_total;
                  hiddenNoJenis.value = data.no_urut_jenis;
                  hiddenSifat.value = data.sifat_surat;
                  hiddenTtd.value = data.kode_penandatangan;
                  hiddenPanitia.value = data.nama_panitia;
                  hiddenBulan.value = data.bulan_surat;
                  hiddenTahun.value = data.tahun_surat;

                  if (inputVarNomor) {
                    inputVarNomor.value = data.nomor;
                  }
                }
              } catch(e) {
                console.error('Gagal memperbarui nomor usulan:', e);
              }
            }
          })();
        </script>
      ` : ''}
    </div>
  `;
}

module.exports = {
  renderSuratFormPage
};
