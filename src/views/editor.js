/**
 * Tampilan Halaman Editor Dokumen F4 TipTap
 */

const { escapeHtml } = require('./layout');
const { renderWordRulerHtml } = require('./ruler');

function renderEditorPage({ settings = {}, savedDraft = null }) {
  const initialTitle = savedDraft && savedDraft.judul ? escapeHtml(savedDraft.judul) : 'Dokumen Baru F4';
  const initialJsonStr = savedDraft && savedDraft.jsonContent ? JSON.stringify(savedDraft.jsonContent) : '';

  return `
    <link rel="stylesheet" href="/css/editor.css">

    <!-- Kontainer Data Inisial TipTap -->
    <script id="initial-doc-json" type="application/json">${initialJsonStr ? initialJsonStr.replace(/</g, '\\u003c') : ''}</script>

    <!-- Toolbar Editor Lengkap -->
    <div class="editor-toolbar-container">
      <div class="editor-toolbar">
        
        <!-- Judul Dokumen -->
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-right: 0.5rem;">
          <input 
            type="text" 
            id="doc-title-input" 
            value="${initialTitle}" 
            placeholder="Ketik judul dokumen..." 
            class="form-control" 
            style="height: 32px; font-weight: 700; font-size: 0.85rem; width: 220px; padding: 0.25rem 0.6rem;"
          >
        </div>

        <div class="toolbar-divider"></div>

        <!-- History: Undo / Redo -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-undo" title="Urungkan (Ctrl+Z)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2M3 10l6-6m-6 6l6 6"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-redo" title="Ulangi (Ctrl+Y)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a5 5 0 00-5 5v2M21 10l-6-6m6 6l-6 6"></path></svg>
          </button>
        </div>

        <!-- Heading / Format Text Selector -->
        <select id="select-heading" class="tb-select" title="Gaya Teks / Paragraf">
          <option value="p">Paragraf Normal</option>
          <option value="h1">Judul 1 (H1)</option>
          <option value="h2">Judul 2 (H2)</option>
          <option value="h3">Judul 3 (H3)</option>
        </select>

        <div class="toolbar-divider"></div>

        <!-- Format Karakter: Bold, Italic, Underline -->
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

        <!-- Perataan Paragraf: Kiri, Tengah, Kanan, Rata Kanan-Kiri -->
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
          <button type="button" class="tb-btn" id="btn-align-justify" title="Rata Kanan-Kiri (Justify)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>

        <!-- Daftar: Poin / Angka -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-bullet-list" title="Daftar Poin">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-ordered-list" title="Daftar Nomor">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h13M7 12h13M7 18h13M3 5h1v3H3m1-1H3M3 17h2v1H3v1h2M3 11h2l-2 2h2"></path></svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Operasi Tabel -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-insert-table" title="Sisipkan Tabel (3x3)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-10v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-add-row" title="Tambah Baris (Di Bawah)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-delete-row" title="Hapus Baris Terpilih">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-add-col" title="Tambah Kolom (Di Kanan)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-delete-col" title="Hapus Kolom Terpilih">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-delete-table" title="Hapus Seluruh Tabel">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>

        <!-- Sisipkan Gambar Lokal -->
        <div class="toolbar-group">
          <input type="file" id="editor-image-file-input" accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp" style="display: none;">
          <button type="button" class="tb-btn" id="btn-insert-image" title="Sisipkan Gambar dari File Lokal">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </button>
        </div>

        <!-- Warna Teks & Biru PMII -->
        <div class="toolbar-group" title="Warna Teks">
          <button type="button" class="tb-btn tb-btn-color-pmii" id="btn-color-pmii" title="Warna Biru PMII (#51A0D8)">
            A
          </button>
          <input type="color" id="text-color-picker" value="#51A0D8" class="tb-color-picker" title="Pilih Warna Teks Bebas">
          <button type="button" class="tb-btn" id="btn-color-reset" title="Warna Teks Hitam / Default" style="font-size: 0.75rem; font-weight: 700;">
            ✕
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Tab & Indentasi -->
        <div class="toolbar-group" title="Tabulasi & Indentasi Teks">
          <button type="button" class="tb-btn" id="btn-insert-tab" title="Sisipkan Tab (⇥ Tab)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7M5 12h11M19 5v14"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-indent" title="Tambah Indentasi (Geser Kanan)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M4 6h7M4 12h5M4 18h7"></path></svg>
          </button>
          <button type="button" class="tb-btn" id="btn-outdent" title="Kurangi Indentasi (Geser Kiri)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M20 6H9M20 12h-5M20 18H9"></path></svg>
          </button>
        </div>

        <!-- Spasi Baris -->
        <div class="toolbar-group" title="Jarak Spasi Baris">
          <select id="select-line-spacing" class="tb-select">
            <option value="1.0">Spasi 1.0</option>
            <option value="1.15">Spasi 1.15</option>
            <option value="1.5" selected>Spasi 1.5</option>
            <option value="2.0">Spasi 2.0</option>
          </select>
        </div>

        <!-- Atur Margin F4 -->
        <div class="toolbar-group" title="Atur Margin Kertas F4">
          <select id="select-margin" class="tb-select">
            <option value="20mm" selected>Margin 2 cm (PMII)</option>
            <option value="25mm">Margin 2.5 cm</option>
            <option value="15mm">Margin 1.5 cm</option>
            <option value="30mm">Margin 3 cm</option>
          </select>
        </div>

        <!-- Cari dan Ganti Teks & Penggaris -->
        <div class="toolbar-group">
          <button type="button" class="tb-btn" id="btn-toggle-find-replace" title="Cari & Ganti Teks (Ctrl+F)">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          <button type="button" class="tb-btn is-active" id="btn-toggle-ruler" title="Tampilkan / Sembunyikan Penggaris (Ruler Kayak di Word)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 17h18M7 7v4M11 7v3M15 7v4M19 7v3M3 7v10M21 7v10"/>
            </svg>
          </button>
        </div>

        <div style="margin-left: auto; display: flex; align-items: center; gap: 0.5rem;">
          <!-- Cetak F4 -->
          <button type="button" class="tb-action-btn btn-gold" id="btn-print-doc" title="Cetak atau Simpan PDF Kertas F4 (215 x 330 mm)">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <span>Cetak (F4)</span>
          </button>

          <!-- Simpan Dokumen JSON TipTap -->
          <button type="button" class="tb-action-btn btn-primary" id="btn-save-doc" title="Simpan Dokumen ke Sistem (JSON TipTap)">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            <span>Simpan</span>
          </button>

          <!-- Unduh JSON TipTap -->
          <button type="button" class="tb-action-btn btn-outline" id="btn-download-json" title="Unduh Berkas Mentah TipTap JSON">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span>JSON</span>
          </button>
        </div>
      </div>

      <!-- Panel Cari dan Ganti Teks (Terbuka saat tombol ditekan / Ctrl+F) -->
      <div id="find-replace-panel" class="find-replace-panel">
        <div class="find-replace-form">
          <div class="find-input-group">
            <svg width="16" height="16" fill="none" stroke="#64748b" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" id="find-input" class="find-input" placeholder="Cari teks...">
            <span id="find-counter" class="find-count-badge">0/0</span>
          </div>

          <div style="display: flex; gap: 2px;">
            <button type="button" class="tb-btn" id="btn-find-prev" title="Kecocokan Sebelumnya (Shift+Enter)">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button type="button" class="tb-btn" id="btn-find-next" title="Kecocokan Selanjutnya (Enter)">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
          </div>

          <div class="find-input-group">
            <input type="text" id="replace-input" class="find-input" placeholder="Ganti dengan...">
          </div>

          <button type="button" class="btn btn-outline btn-sm" id="btn-replace-one">Ganti</button>
          <button type="button" class="btn btn-outline btn-sm" id="btn-replace-all">Ganti Semua</button>

          <label style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.775rem; color: #475569; cursor: pointer; user-select: none;">
            <input type="checkbox" id="check-case-sensitive">
            <span>Huruf Besar/Kecil</span>
          </label>

          <button type="button" class="tb-btn" id="btn-close-find" title="Tutup Panel Cari" style="margin-left: auto;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Container Toast Notifikasi Simpan -->
    <div id="toast-container" class="toast-container"></div>

    <!-- Meja Kerja Kanvas Editor -->
    <div class="editor-workspace-desk">
      <!-- Penggaris Horizontal Kayak di Word -->
      ${renderWordRulerHtml(20)}

      <!-- Lembar Kertas Fisik F4 (215 x 330 mm) -->
      <div class="editor-f4-paper" id="f4-paper-container" style="--paper-margin-top: 5mm; --paper-margin-side: 20mm; --paper-margin-bottom: 20mm; --paper-line-height: 1.5; padding: 5mm 20mm 20mm 20mm;">
        <span class="paper-meta-badge">Kertas F4 &bull; 215 &times; 330 mm</span>
        <!-- Elemen Sasaran TipTap -->
        <div id="tiptap-editor"></div>
      </div>
    </div>

    <!-- Status Bar Bawah -->
    <div class="editor-status-bar">
      <div>
        <span id="stat-words">0 kata</span> &bull; <span id="stat-chars">0 karakter</span>
      </div>
      <div id="save-status-indicator" class="status-badge-saved">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        <span id="save-status-text">Siap Mengedit</span>
      </div>
    </div>

    <!-- Muat Bundle TipTap dan Logika Interaktif Editor -->
    <script src="/js/tiptap-bundle.js"></script>
    <script src="/js/editor-app.js"></script>
  `;
}

module.exports = {
  renderEditorPage
};
