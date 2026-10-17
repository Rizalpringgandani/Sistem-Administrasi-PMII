/**
 * LOGIKA APLIKASI EDITOR TIPTAP KERTAS F4 (100% OFFLINE)
 * Mendukung Formatting, Heading, Lists, Align, Table, Image, Find & Replace, Print F4, dan JSON Save
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.TipTap) {
    console.error('Library TipTap belum termuat.');
    return;
  }

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
    FindAndReplace
  } = window.TipTap;

  // 1. Ambil data dokumen awal jika ada
  let initialContent = null;
  const initialJsonEl = document.getElementById('initial-doc-json');
  if (initialJsonEl && initialJsonEl.textContent.trim()) {
    try {
      initialContent = JSON.parse(initialJsonEl.textContent);
    } catch (e) {
      console.warn('Gagal membaca initial doc JSON:', e);
    }
  }

  // Jika tidak ada draft tersimpan, gunakan struktur awal dokumen resmi PMII F4
  if (!initialContent) {
    initialContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [{ type: 'text', text: 'PENGURUS RAYON PMII' }]
        },
        {
          type: 'heading',
          attrs: { level: 2, textAlign: 'center' },
          content: [{ type: 'text', text: 'KOMISARIAT RADEN RAHMAT' }]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'center' },
          content: [{ type: 'text', text: 'Sekretariat: Jl. Pergerakan No. 1960 | Email: rayon.pmii@email.local' }]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: 'Dokumen ini dibuat menggunakan ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'Editor TipTap Dokumen Standar F4' },
            { type: 'text', text: ' (215 x 330 mm). Anda dapat menyunting format teks tebal, miring, garis bawah, perataan paragraf, menyisipkan tabel, menambahkan gambar lokal, serta mencari dan mengganti teks secara mandiri.' }
          ]
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'No' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Agenda Kegiatan' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Waktu / Keterangan' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '1.' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rapat Pleno Pengurus Rayon' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Setiap Jumat Malam' }] }] }
              ]
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '2.' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kajian Rutin Kaderisasi' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Setiap Minggu Pagi' }] }] }
              ]
            }
          ]
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [{ type: 'text', text: 'Demikian dokumen administrasi ini disusun untuk dipergunakan sebagaimana mestinya.' }]
        }
      ]
    };
  }

  // 2. Inisialisasi Editor TipTap
  const editor = new Editor({
    element: document.getElementById('tiptap-editor'),
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left'
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      FindAndReplace.configure({
        searchDebounceMs: 150
      })
    ],
    content: initialContent,
    autofocus: 'end',
    onTransaction: () => {
      updateToolbarActiveStates();
      updateDocumentStats();
      updateFindCounter();
    }
  });

  // 3. Tombol Formatting & Toolbar
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  const btnBold = document.getElementById('btn-bold');
  const btnItalic = document.getElementById('btn-italic');
  const btnUnderline = document.getElementById('btn-underline');
  const selectHeading = document.getElementById('select-heading');

  const btnAlignLeft = document.getElementById('btn-align-left');
  const btnAlignCenter = document.getElementById('btn-align-center');
  const btnAlignRight = document.getElementById('btn-align-right');
  const btnAlignJustify = document.getElementById('btn-align-justify');

  const btnBulletList = document.getElementById('btn-bullet-list');
  const btnOrderedList = document.getElementById('btn-ordered-list');

  // History
  btnUndo.addEventListener('click', () => editor.chain().focus().undo().run());
  btnRedo.addEventListener('click', () => editor.chain().focus().redo().run());

  // Marks
  btnBold.addEventListener('click', () => editor.chain().focus().toggleBold().run());
  btnItalic.addEventListener('click', () => editor.chain().focus().toggleItalic().run());
  btnUnderline.addEventListener('click', () => editor.chain().focus().toggleUnderline().run());

  // Headings
  selectHeading.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'p') {
      editor.chain().focus().setParagraph().run();
    } else if (val === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  });

  // Alignment
  btnAlignLeft.addEventListener('click', () => editor.chain().focus().setTextAlign('left').run());
  btnAlignCenter.addEventListener('click', () => editor.chain().focus().setTextAlign('center').run());
  btnAlignRight.addEventListener('click', () => editor.chain().focus().setTextAlign('right').run());
  btnAlignJustify.addEventListener('click', () => editor.chain().focus().setTextAlign('justify').run());

  // Lists
  btnBulletList.addEventListener('click', () => editor.chain().focus().toggleBulletList().run());
  btnOrderedList.addEventListener('click', () => editor.chain().focus().toggleOrderedList().run());

  // 4. Operasi Tabel
  const btnInsertTable = document.getElementById('btn-insert-table');
  const btnAddRow = document.getElementById('btn-add-row');
  const btnDeleteRow = document.getElementById('btn-delete-row');
  const btnAddCol = document.getElementById('btn-add-col');
  const btnDeleteCol = document.getElementById('btn-delete-col');
  const btnDeleteTable = document.getElementById('btn-delete-table');

  btnInsertTable.addEventListener('click', () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  });
  btnAddRow.addEventListener('click', () => editor.chain().focus().addRowAfter().run());
  btnDeleteRow.addEventListener('click', () => editor.chain().focus().deleteRow().run());
  btnAddCol.addEventListener('click', () => editor.chain().focus().addColumnAfter().run());
  btnDeleteCol.addEventListener('click', () => editor.chain().focus().deleteColumn().run());
  btnDeleteTable.addEventListener('click', () => editor.chain().focus().deleteTable().run());

  // 5. Sisipkan Gambar dari File Lokal
  const btnInsertImage = document.getElementById('btn-insert-image');
  const imageFileInput = document.getElementById('editor-image-file-input');

  btnInsertImage.addEventListener('click', () => imageFileInput.click());

  imageFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('gambar', file);

    const statusText = document.getElementById('save-status-text');
    statusText.textContent = 'Mengunggah gambar lokal...';

    try {
      const response = await fetch('/api/editor/upload-gambar', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success && data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        statusText.textContent = 'Gambar berhasil disisipkan';
      } else {
        alert(data.message || 'Gagal mengunggah gambar.');
        statusText.textContent = 'Gagal menyisipkan gambar';
      }
    } catch (err) {
      console.error('Error upload gambar:', err);
      alert('Terjadi kesalahan saat mengunggah gambar.');
      statusText.textContent = 'Error koneksi lokal';
    } finally {
      imageFileInput.value = '';
    }
  });

  // 6. Fitur Cari dan Ganti Teks (Find & Replace)
  const panelFindReplace = document.getElementById('find-replace-panel');
  const btnToggleFindReplace = document.getElementById('btn-toggle-find-replace');
  const btnCloseFind = document.getElementById('btn-close-find');
  const findInput = document.getElementById('find-input');
  const replaceInput = document.getElementById('replace-input');
  const findCounter = document.getElementById('find-counter');
  const btnFindPrev = document.getElementById('btn-find-prev');
  const btnFindNext = document.getElementById('btn-find-next');
  const btnReplaceOne = document.getElementById('btn-replace-one');
  const btnReplaceAll = document.getElementById('btn-replace-all');
  const checkCaseSensitive = document.getElementById('check-case-sensitive');

  function toggleFindPanel(open) {
    const isOpen = open !== undefined ? open : !panelFindReplace.classList.contains('is-open');
    if (isOpen) {
      panelFindReplace.classList.add('is-open');
      btnToggleFindReplace.classList.add('is-active');
      setTimeout(() => findInput.focus(), 50);
      if (findInput.value) {
        editor.commands.setSearchTerm(findInput.value);
      }
    } else {
      panelFindReplace.classList.remove('is-open');
      btnToggleFindReplace.classList.remove('is-active');
      editor.commands.clearSearch();
      editor.commands.focus();
    }
    updateFindCounter();
  }

  btnToggleFindReplace.addEventListener('click', () => toggleFindPanel());
  btnCloseFind.addEventListener('click', () => toggleFindPanel(false));

  // Shortcut Keyboard Ctrl+F untuk Cari & Ganti
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'h')) {
      e.preventDefault();
      toggleFindPanel(true);
    }
    if (e.key === 'Escape' && panelFindReplace.classList.contains('is-open')) {
      toggleFindPanel(false);
    }
  });

  findInput.addEventListener('input', (e) => {
    const term = e.target.value;
    if (term) {
      editor.commands.setSearchTerm(term);
    } else {
      editor.commands.clearSearch();
    }
    setTimeout(updateFindCounter, 160);
  });

  findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        editor.commands.goToPreviousResult();
      } else {
        editor.commands.goToNextResult();
      }
      setTimeout(updateFindCounter, 50);
    }
  });

  replaceInput.addEventListener('input', (e) => {
    editor.commands.setReplaceTerm(e.target.value);
  });

  checkCaseSensitive.addEventListener('change', (e) => {
    editor.commands.setCaseSensitive(e.target.checked);
    setTimeout(updateFindCounter, 50);
  });

  btnFindNext.addEventListener('click', () => {
    editor.commands.goToNextResult();
    setTimeout(updateFindCounter, 50);
  });

  btnFindPrev.addEventListener('click', () => {
    editor.commands.goToPreviousResult();
    setTimeout(updateFindCounter, 50);
  });

  btnReplaceOne.addEventListener('click', () => {
    if (replaceInput.value) {
      editor.commands.setReplaceTerm(replaceInput.value);
    }
    editor.commands.replace();
    setTimeout(updateFindCounter, 50);
  });

  btnReplaceAll.addEventListener('click', () => {
    if (replaceInput.value) {
      editor.commands.setReplaceTerm(replaceInput.value);
    }
    editor.commands.replaceAll();
    setTimeout(updateFindCounter, 50);
  });

  function updateFindCounter() {
    if (!editor.storage.findAndReplace) return;
    const results = editor.storage.findAndReplace.results || [];
    const current = editor.storage.findAndReplace.currentIndex;
    if (results.length > 0) {
      const idx = current !== null ? current + 1 : 0;
      findCounter.textContent = `${idx}/${results.length}`;
    } else {
      findCounter.textContent = '0/0';
    }
  }

  // 7. Tombol Cetak Kertas F4
  const btnPrintDoc = document.getElementById('btn-print-doc');
  btnPrintDoc.addEventListener('click', () => {
    // Pastikan highlight pencarian dibersihkan sebelum mencetak
    if (panelFindReplace.classList.contains('is-open')) {
      toggleFindPanel(false);
    }
    window.print();
  });

  // 8. Simpan Dokumen TipTap (JSON & HTML)
  const btnSaveDoc = document.getElementById('btn-save-doc');
  const titleInput = document.getElementById('doc-title-input');
  const saveStatusText = document.getElementById('save-status-text');

  async function simpanDokumen() {
    const judul = titleInput.value.trim() || 'Dokumen F4 PMII';
    const jsonContent = editor.getJSON();
    const htmlContent = editor.getHTML();

    saveStatusText.textContent = 'Menyimpan...';

    try {
      const res = await fetch('/api/editor/simpan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          jsonContent,
          htmlContent
        })
      });
      const data = await res.json();

      if (data.success) {
        const waktu = new Date().toLocaleTimeString('id-ID');
        saveStatusText.textContent = `Tersimpan (${waktu})`;
      } else {
        saveStatusText.textContent = 'Gagal menyimpan';
        alert(data.message || 'Gagal menyimpan dokumen.');
      }
    } catch (e) {
      console.error('Error simpan dokumen:', e);
      saveStatusText.textContent = 'Gagal menyimpan (Error jaringan)';
    }
  }

  btnSaveDoc.addEventListener('click', simpanDokumen);

  // Shortcut Keyboard Ctrl+S untuk Simpan
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      simpanDokumen();
    }
  });

  // 9. Unduh JSON Mentah TipTap
  const btnDownloadJson = document.getElementById('btn-download-json');
  btnDownloadJson.addEventListener('click', () => {
    const json = editor.getJSON();
    const judul = (titleInput.value.trim() || 'dokumen-f4').toLowerCase().replace(/\s+/g, '-');
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${judul}-tiptap.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // 10. Update Active States Toolbar & Statistik Dokumen
  function updateToolbarActiveStates() {
    btnBold.classList.toggle('is-active', editor.isActive('bold'));
    btnItalic.classList.toggle('is-active', editor.isActive('italic'));
    btnUnderline.classList.toggle('is-active', editor.isActive('underline'));

    // Headings
    if (editor.isActive('heading', { level: 1 })) {
      selectHeading.value = 'h1';
    } else if (editor.isActive('heading', { level: 2 })) {
      selectHeading.value = 'h2';
    } else if (editor.isActive('heading', { level: 3 })) {
      selectHeading.value = 'h3';
    } else {
      selectHeading.value = 'p';
    }

    // Alignments
    btnAlignLeft.classList.toggle('is-active', editor.isActive({ textAlign: 'left' }));
    btnAlignCenter.classList.toggle('is-active', editor.isActive({ textAlign: 'center' }));
    btnAlignRight.classList.toggle('is-active', editor.isActive({ textAlign: 'right' }));
    btnAlignJustify.classList.toggle('is-active', editor.isActive({ textAlign: 'justify' }));

    // Lists
    btnBulletList.classList.toggle('is-active', editor.isActive('bulletList'));
    btnOrderedList.classList.toggle('is-active', editor.isActive('orderedList'));
  }

  function updateDocumentStats() {
    const text = editor.getText();
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    const elWords = document.getElementById('stat-words');
    const elChars = document.getElementById('stat-chars');
    if (elWords) elWords.textContent = `${wordCount} kata`;
    if (elChars) elChars.textContent = `${charCount} karakter`;
  }

  // Panggil sekali di awal
  updateToolbarActiveStates();
  updateDocumentStats();
});
