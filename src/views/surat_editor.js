/**
 * Halaman Editor Dokumen Surat F4 dengan Kop Resmi & Penyimpanan ke Arsip
 */

const { escapeHtml } = require('./layout');

function renderSuratEditorPage({ docData = {}, settings = {} }) {
  const dokumenId = docData.id || '';
  const nomorDokumen = escapeHtml(docData.nomor_dokumen || '');
  const judul = escapeHtml(docData.judul || 'Surat Keluar');
  const tanggalDokumen = escapeHtml(docData.tanggal_dokumen || '');
  const tujuan = escapeHtml(docData.tujuan || '');
  const perihal = escapeHtml(docData.perihal || '');
  const templateId = docData.template_id || '';
  const initialJsonStr = docData.konten_json ? JSON.stringify(docData.konten_json) : '';

  // Kop Surat Text
  const namaRayon = (settings.nama_rayon || 'RAYON PMII').toUpperCase();
  const namaKomisariat = (settings.nama_komisariat || '').toUpperCase();
  const namaCabang = (settings.nama_cabang || '').toUpperCase();
  const alamat = escapeHtml(settings.alamat_sekretariat || 'Alamat Sekretariat');
  const logoSrc = settings.logo_rayon || settings.logo_pmii || '/img/pmii-logo.svg';

  return `
    <link rel="stylesheet" href="/css/editor.css">

    <!-- Kontainer Data Inisial Dokumen -->
    <script id="initial-doc-json" type="application/json">${initialJsonStr ? initialJsonStr.replace(/</g, '\\u003c') : ''}</script>

    <!-- Hidden Fields Metadata Dokumen -->
    <input type="hidden" id="doc-id" value="${dokumenId}">
    <input type="hidden" id="doc-template-id" value="${templateId}">
    <input type="hidden" id="doc-tujuan" value="${tujuan}">
    <input type="hidden" id="doc-perihal" value="${perihal}">
    <input type="hidden" id="doc-tanggal" value="${tanggalDokumen}">

    <!-- Toolbar Editor -->
    <div class="editor-toolbar-container">
      <div class="editor-toolbar">
        
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-right: 0.5rem;">
          <a href="/surat" class="btn btn-outline btn-sm" title="Kembali ke menu surat">&larr;</a>
          <div>
            <input 
              type="text" 
              id="doc-title-input" 
              value="${judul}" 
              placeholder="Judul dokumen..." 
              class="form-control" 
              style="height: 32px; font-weight: 700; font-size: 0.85rem; width: 200px; padding: 0.25rem 0.6rem;"
            >
          </div>
          <div>
            <input 
              type="text" 
              id="doc-nomor-input" 
              value="${nomorDokumen}" 
              placeholder="Nomor surat..." 
              class="form-control" 
              style="height: 32px; font-family: monospace; font-size: 0.8rem; width: 170px; padding: 0.25rem 0.6rem;"
              title="Nomor Surat Resmi"
            >
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- History -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-undo" title="Urungkan (Ctrl+Z)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2M3 10l6-6m-6 6l6 6"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-redo" title="Ulangi (Ctrl+Y)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a5 5 0 00-5 5v2M21 10l-6-6m6 6l-6 6"></path></svg>
          </button>
        </div>

        <!-- Heading Selector -->
        <select id="select-heading" class="tb-select">
          <option value="p">Paragraf Normal</option>
          <option value="h1">Judul 1 (H1)</option>
          <option value="h2">Judul 2 (H2)</option>
          <option value="h3">Judul 3 (H3)</option>
        </select>

        <div class="toolbar-divider"></div>

        <!-- Formatting -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-bold" title="Tebal (Ctrl+B)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-italic" title="Miring (Ctrl+I)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 0h-6m2 16H8"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-underline" title="Garis Bawah (Ctrl+U)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 3v7a6 6 0 0012 0V3M4 21h16"></path></svg>
          </button>
        </div>

        <!-- Alignment -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-align-left" title="Rata Kiri">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h14"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-align-center" title="Rata Tengah">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M5 18h14"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-align-right" title="Rata Kanan">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M6 18h14"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-align-justify" title="Rata Kanan-Kiri">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>

        <!-- Lists -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-bullet-list" title="Daftar Poin">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-ordered-list" title="Daftar Nomor">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h13M7 12h13M7 18h13M3 5h1v3H3m1-1H3M3 17h2v1H3v1h2M3 11h2l-2 2h2"></path></svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Table Operations -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-insert-table" title="Sisipkan Tabel">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-10v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-add-row" title="Tambah Baris">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-delete-row" title="Hapus Baris">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-add-col" title="Tambah Kolom">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-delete-col" title="Hapus Kolom">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-delete-table" title="Hapus Tabel">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>

        <input type="file" id="editor-image-file-input" accept="image/*" style="display: none;">
        <button type="button" class="tb-btn" id="btn-insert-image" title="Sisipkan Gambar Lokal">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </button>

        <button type="button" class="tb-btn" id="btn-toggle-find-replace" title="Cari & Ganti Teks (Ctrl+F)">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>

        <!-- Aksi Utama: Simpan Arsip, Word, Cetak F4 -->
        <div style="margin-left: auto; display: flex; align-items: center; gap: 0.4rem;">
          <button type="button" class="tb-action-btn btn-primary" id="btn-simpan-arsip" title="Simpan dokumen ke Arsip Resmi">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <span>Simpan Arsip</span>
          </button>

          <button type="button" class="tb-action-btn btn-outline" id="btn-unduh-word" title="Export langsung ke berkas Word (.docx) F4">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Word (.docx)</span>
          </button>

          <button type="button" class="tb-action-btn btn-gold" id="btn-print-doc" title="Cetak atau simpan PDF Kertas F4">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>Cetak (F4)</span>
          </button>
        </div>
      </div>

      <!-- Panel Cari & Ganti -->
      <div id="find-replace-panel" class="find-replace-panel">
        <div class="find-replace-form">
          <div class="find-input-group">
            <input type="text" id="find-input" class="find-input" placeholder="Cari teks...">
            <span id="find-counter" class="find-count-badge">0/0</span>
          </div>
          <button type="button" class="tb-btn" id="btn-find-prev">▲</button>
          <button type="button" class="tb-btn" id="btn-find-next">▼</button>
          <div class="find-input-group">
            <input type="text" id="replace-input" class="find-input" placeholder="Ganti dengan...">
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-replace-one">Ganti</button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-replace-all">Ganti Semua</button>
          <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.775rem;">
            <input type="checkbox" id="check-case-sensitive"> Huruf Besar/Kecil
          </label>
          <button type="button" class="tb-btn" id="btn-close-find" style="margin-left: auto;">✕</button>
        </div>
      </div>
    </div>

    <!-- Kanvas Kerja F4 -->
    <div class="editor-workspace-desk">
      <div class="editor-f4-paper" id="f4-paper-container">
        <span class="paper-meta-badge">Surat Resmi F4 &bull; 215 &times; 330 mm</span>

        <!-- Kop Surat PMII Otomatis -->
        <div class="kop-surat-header" style="border-bottom: 3px double #000000; padding-bottom: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
          <div style="width: 75px; text-align: center; flex-shrink: 0;">
            <img src="${logoSrc}" alt="Logo PMII" style="max-width: 70px; max-height: 85px; object-fit: contain;">
          </div>
          <div style="flex: 1; text-align: center; font-family: 'Times New Roman', Times, serif; color: #000000;">
            <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px;">PENGURUS RAYON</div>
            <div style="font-size: 15pt; font-weight: bold; color: #003366; letter-spacing: 0.5px;">PERGERAKAN MAHASISWA ISLAM INDONESIA</div>
            <div style="font-size: 9.5pt; font-style: italic; color: #d99b00; margin-top: -2px;">(Indonesian Muslim Student Movement)</div>
            <div style="font-size: 12pt; font-weight: bold; margin-top: 2px;">${namaRayon} ${namaKomisariat} ${namaCabang}</div>
            <div style="font-size: 8.5pt; margin-top: 4px;">Sekretariat: ${alamat}</div>
          </div>
        </div>

        <!-- Sasaran Konten TipTap Surat -->
        <div id="tiptap-surat-editor"></div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="editor-status-bar">
      <div>
        <span id="stat-words">0 kata</span> &bull; <span id="stat-chars">0 karakter</span>
      </div>
      <div id="save-status-indicator" class="status-badge-saved">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span id="save-status-text">Dokumen Siap</span>
      </div>
    </div>

    <!-- Bundle & Logika Interaktif Surat -->
    <script src="/js/tiptap-bundle.js"></script>
    <script src="/js/surat-editor-app.js"></script>
  `;
}

module.exports = {
  renderSuratEditorPage
};
