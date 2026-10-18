/**
 * Halaman Pembuat & Penyunting Template Surat TipTap F4
 */

const { escapeHtml } = require('./layout');
const { renderKopSuratHtml, renderFooterHtml } = require('./kop_surat');

function renderTemplateEditorPage({ template = null, settings = {} }) {
  const isEdit = Boolean(template && template.id);
  const judul = template ? escapeHtml(template.judul) : '';
  const kode = template ? escapeHtml(template.kode) : `TPL-${Date.now().toString().slice(-6)}`;
  const kategori = template ? escapeHtml(template.kategori || 'Undangan') : 'Undangan';
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

        <button type="button" class="tb-btn" id="btn-insert-pagebreak" title="Pisah Halaman / Lampiran (Page Break)">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12h16M4 6h16M4 18h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Kanvas Kerja F4 -->
    <div class="editor-workspace-desk">
      <div class="editor-f4-paper" id="f4-paper-container">
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
        const { Editor, StarterKit, Underline, TextAlign, Table, TableRow, TableCell, TableHeader, Image } = window.TipTap;

        let initialDoc = null;
        const initEl = document.getElementById('initial-template-json');
        if (initEl && initEl.textContent.trim()) {
          try {
            initialDoc = JSON.parse(initEl.textContent);
          } catch(e) {}
        }

        if (!initialDoc) {
          initialDoc = {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'Nomor\\t: ' },
                  { type: 'text', marks: [{ type: 'bold' }], text: '{{nomor_surat}}' },
                  { type: 'text', text: '\\nLampiran\\t: {{lampiran}}\\nPerihal\\t: ' },
                  { type: 'text', marks: [{ type: 'bold' }], text: '{{perihal}}' }
                ]
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'right' },
                content: [{ type: 'text', text: '{{tempat_surat}}, {{tanggal_surat}}' }]
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [
                  { type: 'text', text: 'Kepada Yth.\\n' },
                  { type: 'text', marks: [{ type: 'bold' }], text: '{{tujuan}}\\n' },
                  { type: 'text', text: 'di -\\n\\t{{tempat_tujuan}}' }
                ]
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [{ type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: "Assalamu'alaikum Warahmatullahi Wabarakatuh" }]
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'justify' },
                content: [{ type: 'text', text: "Salam silaturrahim teriring do'a kami sampaikan semoga Sahabat/i senantiasa dalam lindungan Allah SWT serta eksis dalam menjalankan aktivitas keseharian. Aamiin." }]
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'justify' },
                content: [{ type: 'text', text: 'Tuliskan isi surat template di sini dengan menandai bagian yang akan diisi pengguna menggunakan kurung kurawal ganda, misalnya: {{nama_kegiatan}}, {{hari_tanggal}}, {{tempat}}.' }]
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'justify' },
                content: [{ type: 'text', text: 'Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami haturkan terima kasih.' }]
              },
              {
                type: 'paragraph',
                attrs: { textAlign: 'left' },
                content: [{ type: 'text', marks: [{ type: 'italic' }, { type: 'bold' }], text: 'Wallahul Muwaffiq Ila Aqwamith Tharieq\\nWassalamu’alaikum Warahmatullahi Wabarakatuh' }]
              },
              {
                type: 'table',
                content: [
                  {
                    type: 'tableRow',
                    content: [
                      {
                        type: 'tableCell',
                        content: [
                          { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Ketua Rayon' }] },
                          { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '\\n\\n\\n' }] },
                          { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_ketua}}' }] }
                        ]
                      },
                      {
                        type: 'tableCell',
                        content: [
                          { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Sekretaris Rayon' }] },
                          { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: '\\n\\n\\n' }] },
                          { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: '{{nama_sekretaris}}' }] }
                        ]
                      }
                    ]
                  }
                ]
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
            Image.configure({ inline: true, allowBase64: true })
          ],
          content: initialDoc,
          autofocus: true
        });

        // Binding tombol toolbar
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

        document.getElementById('btn-insert-table').onclick = () => editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
        document.getElementById('btn-add-row').onclick = () => editor.chain().focus().addRowAfter().run();
        document.getElementById('btn-delete-row').onclick = () => editor.chain().focus().deleteRow().run();
        document.getElementById('btn-add-col').onclick = () => editor.chain().focus().addColumnAfter().run();
        document.getElementById('btn-delete-col').onclick = () => editor.chain().focus().deleteColumn().run();
        document.getElementById('btn-delete-table').onclick = () => editor.chain().focus().deleteTable().run();

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
                jsonContent,
                htmlContent
              })
            });
            const data = await res.json();
            if (data.success) {
              window.location.href = '/template';
            } else {
              alert(data.message || 'Gagal menyimpan template.');
            }
          } catch(e) {
            console.error(e);
            alert('Terjadi kesalahan saat menyimpan template.');
          }
        };
      });
    </script>
  `;
}

module.exports = {
  renderTemplateEditorPage
};
