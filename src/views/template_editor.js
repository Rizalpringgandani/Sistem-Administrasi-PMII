/**
 * Halaman Pembuat & Penyunting Template Surat TipTap F4
 */

const { escapeHtml } = require('./layout');
const { renderKopSuratHtml, renderFooterHtml } = require('./kop_surat');
const { renderWordRulerHtml } = require('./ruler');

function renderTemplateEditorPage({ template = null, settings = {} }) {
  const isEdit = Boolean(template && template.id);
  const judul = template ? escapeHtml(template.judul) : '';
  const kode = template ? escapeHtml(template.kode) : `TPL-${Date.now().toString().slice(-6)}`;
  const kategori = template ? escapeHtml(template.kategori || 'Undangan') : 'Undangan';
  const marginMm = parseInt(template && template.margin ? template.margin : '20', 10) || 20;
  const initialJsonStr = template && template.konten_json ? template.konten_json : '';

  return `
    <link rel="stylesheet" href="/css/editor.css">

    <!-- Kontainer Data Inisial TipTap Template -->
    <script id="initial-template-json" type="application/json">${initialJsonStr ? initialJsonStr.replace(/</g, '\\u003c') : ''}</script>

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <a href="/template" class="btn btn-outline btn-sm">&larr; Kembali ke Daftar Template</a>
          <h1 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0;">
            ${isEdit ? 'Sunting Template Surat' : 'Buat Template Surat Baru'}
          </h1>
        </div>
      </div>
      <div>
        <button type="button" class="btn btn-primary btn-sm" id="btn-save-template">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          Simpan Template
        </button>
      </div>
    </div>

    <!-- Metadata Form Template -->
    <div class="card" style="margin-bottom: 1rem;">
      <div class="card-body" style="padding: 1rem 1.25rem;">
        <div class="grid-cols-3" style="gap: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="tpl-judul">Nama / Judul Template <span class="required">*</span></label>
            <input type="text" id="tpl-judul" class="form-control" value="${judul}" placeholder="Contoh: Surat Undangan Rapat Pleno" required>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="tpl-kategori">Kategori</label>
            <select id="tpl-kategori" class="form-control">
              <option value="Undangan" ${kategori === 'Undangan' ? 'selected' : ''}>Undangan</option>
              <option value="Permohonan" ${kategori === 'Permohonan' ? 'selected' : ''}>Permohonan</option>
              <option value="Pemberitahuan" ${kategori === 'Pemberitahuan' ? 'selected' : ''}>Pemberitahuan</option>
              <option value="Mandat" ${kategori === 'Mandat' ? 'selected' : ''}>Mandat</option>
              <option value="Keterangan" ${kategori === 'Keterangan' ? 'selected' : ''}>Keterangan</option>
              <option value="SK" ${kategori === 'SK' ? 'selected' : ''}>Surat Keputusan (SK)</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="tpl-kode">Kode Template</label>
            <input type="text" id="tpl-kode" class="form-control" value="${kode}" placeholder="Contoh: TPL-UND-01" required>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Tombol Cepat Sisipkan Variabel -->
    <div class="card" style="margin-bottom: 1rem; background: #f8fafc;">
      <div class="card-body" style="padding: 0.75rem 1.25rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Sisipkan Penanda Isian:</span>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{nomor_surat}}">+ {{nomor_surat}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{lampiran}}">+ {{lampiran}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{perihal}}">+ {{perihal}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{tanggal_surat}}">+ {{tanggal_surat}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{tempat_surat}}">+ {{tempat_surat}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{tujuan}}">+ {{tujuan}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{tempat_tujuan}}">+ {{tempat_tujuan}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{nama_kegiatan}}">+ {{nama_kegiatan}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{tema}}">+ {{tema}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{hari_tanggal}}">+ {{hari_tanggal}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{waktu}}">+ {{waktu}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{tempat}}">+ {{tempat}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{nama_ketua}}">+ {{nama_ketua}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{nama_sekretaris}}">+ {{nama_sekretaris}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{nama_ketua_panitia}}">+ {{nama_ketua_panitia}}</button>
        <button type="button" class="btn btn-outline btn-sm btn-insert-tag" data-tag="{{nama_sekretaris_panitia}}">+ {{nama_sekretaris_panitia}}</button>
      </div>
    </div>

    <!-- Toolbar TipTap F4 -->
    <div class="editor-toolbar-container">
      <div class="editor-toolbar">
        <!-- History: Undo / Redo -->
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

        <!-- Format Text -->
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
        <button type="button" class="tb-btn" id="btn-insert-image" title="Sisipkan Gambar">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </button>

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

        <button type="button" class="tb-btn" id="btn-insert-pagebreak" title="Pisah Halaman / Lampiran (Page Break)">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16M4 6h16M4 18h16"></path></svg>
        </button>

        <button type="button" class="tb-btn is-active" id="btn-toggle-ruler" title="Tampilkan / Sembunyikan Penggaris (Ruler Kayak di Word)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 17h18M7 7v4M11 7v3M15 7v4M19 7v3M3 7v10M21 7v10"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Container Toast Notifikasi Simpan -->
    <div id="toast-container" class="toast-container"></div>

    <!-- Kanvas Kerja F4 -->
    <div class="editor-workspace-desk">
      <!-- Penggaris Horizontal Kayak di Word -->
      ${renderWordRulerHtml(marginMm)}

      <div class="editor-f4-paper" id="f4-paper-container" style="--paper-margin-top: 5mm; --paper-margin-side: ${template && template.margin ? template.margin : '20mm'}; --paper-margin-bottom: ${template && template.margin ? template.margin : '20mm'}; --paper-line-height: ${template && template.line_spacing ? template.line_spacing : '1.5'}; padding: 5mm ${template && template.margin ? template.margin : '20mm'} ${template && template.margin ? template.margin : '20mm'} ${template && template.margin ? template.margin : '20mm'};">
        <span class="paper-meta-badge">Template Surat F4 &bull; 215 &times; 330 mm</span>

        <!-- Tampilan Otomatis Kop Surat PMII Sesuai Pedoman Surat -->
        ${renderKopSuratHtml(settings)}

        <!-- Sasaran TipTap Isi Template -->
        <div id="tiptap-template-editor"></div>

        <!-- Footer Halaman Motto PMII -->
        ${renderFooterHtml(settings)}
      </div>
    </div>

    <!-- Bundle & Logika -->
    <script src="/js/tiptap-bundle.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const {
          Editor,
          StarterKit,
          Underline,
          TextAlign,
          Table,
          TableRow,
          TableCell,
          TableHeader,
          Image,
          TextColor,
          Indent,
          TabKey,
          LineHeight
        } = window.TipTap;

        let initialDoc = null;
        const initEl = document.getElementById('initial-template-json');
        if (initEl && initEl.textContent.trim()) {
          try {
            initialDoc = JSON.parse(initEl.textContent);
          } catch(e) {}
        }

        // Untuk template baru: dibuat kosong agar sekretaris bebas merancang penuh dari awal
        if (!initialDoc) {
          initialDoc = {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' }
              }
            ]
          };
        }

        const editor = new Editor({
          element: document.getElementById('tiptap-template-editor'),
          extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Image.configure({ inline: true, allowBase64: true }),
            TextColor,
            Indent,
            TabKey,
            LineHeight
          ],
          content: initialDoc,
          autofocus: true
        });

        // Binding tombol toolbar format dasar
        document.getElementById('btn-undo').onclick = () => editor.chain().focus().undo().run();
        document.getElementById('btn-redo').onclick = () => editor.chain().focus().redo().run();
        document.getElementById('btn-bold').onclick = () => editor.chain().focus().toggleBold().run();
        document.getElementById('btn-italic').onclick = () => editor.chain().focus().toggleItalic().run();
        document.getElementById('btn-underline').onclick = () => editor.chain().focus().toggleUnderline().run();

        document.getElementById('select-heading').onchange = (e) => {
          const v = e.target.value;
          if (v === 'p') editor.chain().focus().setParagraph().run();
          else if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
          else if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
          else if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
        };

        document.getElementById('btn-align-left').onclick = () => editor.chain().focus().setTextAlign('left').run();
        document.getElementById('btn-align-center').onclick = () => editor.chain().focus().setTextAlign('center').run();
        document.getElementById('btn-align-right').onclick = () => editor.chain().focus().setTextAlign('right').run();
        document.getElementById('btn-align-justify').onclick = () => editor.chain().focus().setTextAlign('justify').run();

        document.getElementById('btn-bullet-list').onclick = () => editor.chain().focus().toggleBulletList().run();
        document.getElementById('btn-ordered-list').onclick = () => editor.chain().focus().toggleOrderedList().run();

        // Tabel
        document.getElementById('btn-insert-table').onclick = () => editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
        document.getElementById('btn-add-row').onclick = () => editor.chain().focus().addRowAfter().run();
        document.getElementById('btn-delete-row').onclick = () => editor.chain().focus().deleteRow().run();
        document.getElementById('btn-add-col').onclick = () => editor.chain().focus().addColumnAfter().run();
        document.getElementById('btn-delete-col').onclick = () => editor.chain().focus().deleteColumn().run();
        document.getElementById('btn-delete-table').onclick = () => editor.chain().focus().deleteTable().run();

        // Sisipkan Gambar
        const btnImage = document.getElementById('btn-insert-image');
        const inputImage = document.getElementById('editor-image-file-input');
        if (btnImage && inputImage) {
          btnImage.onclick = () => inputImage.click();
          inputImage.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (re) => {
              editor.chain().focus().setImage({ src: re.target.result }).run();
              inputImage.value = '';
            };
            reader.readAsDataURL(file);
          };
        }

        // Warna Teks #51A0D8 & Color Picker
        const btnColorPmii = document.getElementById('btn-color-pmii');
        if (btnColorPmii) {
          btnColorPmii.onclick = () => editor.chain().focus().setColor('#51A0D8').run();
        }
        const textColorPicker = document.getElementById('text-color-picker');
        if (textColorPicker) {
          textColorPicker.oninput = (e) => editor.chain().focus().setColor(e.target.value).run();
        }
        const btnColorReset = document.getElementById('btn-color-reset');
        if (btnColorReset) {
          btnColorReset.onclick = () => editor.chain().focus().unsetColor().run();
        }

        // Tab & Indentasi
        const btnInsertTab = document.getElementById('btn-insert-tab');
        if (btnInsertTab) {
          btnInsertTab.onclick = () => editor.chain().focus().insertContent('\t').run();
        }
        const btnIndent = document.getElementById('btn-indent');
        if (btnIndent) {
          btnIndent.onclick = () => editor.chain().focus().indent().run();
        }
        const btnOutdent = document.getElementById('btn-outdent');
        if (btnOutdent) {
          btnOutdent.onclick = () => editor.chain().focus().outdent().run();
        }

        // Jarak Spasi Baris (Diterapkan ke teks/paragraf yang dipilih)
        const paperContainer = document.getElementById('f4-paper-container');
        const selectLineSpacing = document.getElementById('select-line-spacing');
        if (selectLineSpacing && paperContainer) {
          selectLineSpacing.onchange = (e) => {
            const val = e.target.value;
            // 1. Terapkan spasi baris ke teks/paragraf yang sedang dipilih
            if (editor && editor.commands && editor.commands.setLineHeight) {
              editor.chain().focus().setLineHeight(val).run();
            }
            // 2. Set fallback line-height pada kertas
            paperContainer.style.setProperty('--paper-line-height', val);
            const pm = paperContainer.querySelector('.ProseMirror');
            if (pm) pm.style.lineHeight = val;
          };
        }

        // Atur Margin F4 (Margin atas tetap 0.5 cm = 5mm, sisi & bawah dinamis)
        const selectMargin = document.getElementById('select-margin');
        if (selectMargin && paperContainer) {
          selectMargin.onchange = (e) => {
            const val = e.target.value;
            paperContainer.style.setProperty('--paper-margin-side', val);
            paperContainer.style.setProperty('--paper-margin-bottom', val);
            paperContainer.style.padding = '5mm ' + val + ' ' + val + ' ' + val;
            updateRuler(val);
          };
        }

        // Fungsi Sinkronisasi Penggaris Horizontal Kayak di Word
        function updateRuler(marginStr) {
          const mm = parseInt(marginStr || '20', 10) || 20;
          const rightMm = 215 - mm;
          const leftRect = document.getElementById('ruler-margin-left');
          const bodyRect = document.getElementById('ruler-body');
          const rightRect = document.getElementById('ruler-margin-right');
          const markerFirst = document.getElementById('marker-indent-first');
          const markerLeft = document.getElementById('marker-indent-left');
          const markerBox = document.getElementById('marker-indent-box');
          const markerRight = document.getElementById('marker-indent-right');
          const markerRightBox = document.getElementById('marker-indent-right-box');

          if (leftRect) leftRect.setAttribute('width', mm);
          if (bodyRect) {
            bodyRect.setAttribute('x', mm);
            bodyRect.setAttribute('width', 215 - (mm * 2));
          }
          if (rightRect) {
            rightRect.setAttribute('x', rightMm);
            rightRect.setAttribute('width', mm);
          }
          if (markerFirst) markerFirst.setAttribute('points', mm + ',0.5 ' + (mm - 3) + ',5.5 ' + (mm + 3) + ',5.5');
          if (markerLeft) markerLeft.setAttribute('points', mm + ',18 ' + (mm - 3) + ',13.5 ' + (mm + 3) + ',13.5');
          if (markerBox) markerBox.setAttribute('x', mm - 3);
          if (markerRight) markerRight.setAttribute('points', rightMm + ',18 ' + (rightMm - 3) + ',13.5 ' + (rightMm + 3) + ',13.5');
          if (markerRightBox) markerRightBox.setAttribute('x', rightMm - 3);
        }

        // Interaktivitas Hairline & Tooltip Penggaris
        const rulerEl = document.getElementById('word-ruler');
        const hairlineEl = document.getElementById('ruler-hairline');
        const tooltipEl = document.getElementById('ruler-tooltip');
        if (rulerEl && hairlineEl && tooltipEl) {
          rulerEl.addEventListener('mousemove', (e) => {
            const rect = rulerEl.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, offsetX / rect.width));
            const mm = (percent * 215).toFixed(1);
            const cm = (mm / 10).toFixed(1);
            hairlineEl.style.display = 'block';
            hairlineEl.style.left = offsetX + 'px';
            tooltipEl.style.display = 'block';
            tooltipEl.style.left = offsetX + 'px';
            tooltipEl.textContent = cm + ' cm (' + mm + ' mm)';
          });
          rulerEl.addEventListener('mouseleave', () => {
            hairlineEl.style.display = 'none';
            tooltipEl.style.display = 'none';
          });
        }

        // Tombol Toggle Tampilkan/Sembunyikan Penggaris
        const btnToggleRuler = document.getElementById('btn-toggle-ruler');
        const rulerWrapper = document.getElementById('word-ruler-wrapper');
        if (btnToggleRuler && rulerWrapper) {
          btnToggleRuler.onclick = () => {
            const isVisible = rulerWrapper.style.display !== 'none';
            rulerWrapper.style.display = isVisible ? 'none' : 'block';
            btnToggleRuler.classList.toggle('is-active', !isVisible);
          };
        }

        // Helper Toast Notifikasi
        function showToast(title, type, subtitle) {
          type = type || 'success';
          subtitle = subtitle || '';
          let container = document.getElementById('toast-container');
          if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
          }
          const toast = document.createElement('div');
          toast.className = 'toast-notification toast-' + type;
          const isSuccess = type === 'success';
          toast.innerHTML = 
            '<div class="toast-icon">' +
              (isSuccess ? 
                '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' :
                '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>'
              ) +
            '</div>' +
            '<div class="toast-content">' +
              '<div class="toast-title">' + title + '</div>' +
              (subtitle ? '<div class="toast-subtitle">' + subtitle + '</div>' : '') +
            '</div>' +
            '<button type="button" class="toast-close" title="Tutup">✕</button>';
          toast.querySelector('.toast-close').onclick = () => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
          };
          container.appendChild(toast);
          setTimeout(() => {
            if (toast.parentElement) {
              toast.classList.add('toast-hide');
              setTimeout(() => toast.remove(), 300);
            }
          }, 3500);
        }

        // Pisah Halaman / Lampiran (Page Break)
        const btnPageBreak = document.getElementById('btn-insert-pagebreak');
        if (btnPageBreak) {
          btnPageBreak.onclick = () => editor.chain().focus().setHorizontalRule().run();
        }

        // Tombol sisipkan tag variabel
        document.querySelectorAll('.btn-insert-tag').forEach(btn => {
          btn.onclick = () => {
            const tag = btn.getAttribute('data-tag');
            editor.chain().focus().insertContent(tag + ' ').run();
          };
        });

        // Simpan Template
        document.getElementById('btn-save-template').onclick = async () => {
          const judul = document.getElementById('tpl-judul').value.trim();
          const kode = document.getElementById('tpl-kode').value.trim();
          const kategori = document.getElementById('tpl-kategori').value;
          const margin = selectMargin ? selectMargin.value : '20mm';
          const line_spacing = selectLineSpacing ? selectLineSpacing.value : '1.5';

          if (!judul || !kode) {
            alert('Judul dan Kode Template wajib diisi.');
            return;
          }

          const jsonContent = editor.getJSON();
          const htmlContent = editor.getHTML();

          try {
            const res = await fetch('/template/simpan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: ${template && template.id ? template.id : 'null'},
                judul,
                kode,
                kategori,
                jenis: 'surat_keluar',
                margin,
                line_spacing,
                jsonContent,
                htmlContent
              })
            });
            const data = await res.json();
            if (data.success) {
              const btnSave = document.getElementById('btn-save-template');
              if (btnSave) {
                btnSave.style.backgroundColor = '#10b981';
                btnSave.style.color = '#ffffff';
                btnSave.innerHTML = '✓ Berhasil Disimpan!';
              }
              showToast('Template Berhasil Disimpan!', 'success', 'Kode: ' + kode);
              setTimeout(() => {
                window.location.href = '/template';
              }, 800);
            } else {
              showToast('Gagal Menyimpan Template', 'error', data.message || 'Periksa kembali data template.');
            }
          } catch(e) {
            console.error(e);
            showToast('Kesalahan Jaringan', 'error', 'Tidak dapat terhubung ke server lokal.');
          }
        };
      });
    </script>
  `;
}

module.exports = {
  renderTemplateEditorPage
};
