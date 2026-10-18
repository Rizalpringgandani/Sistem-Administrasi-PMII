/**
 * LOGIKA EDITOR SURAT F4 TERINTEGRASI ARSIP & EXPORT WORD
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
    FindAndReplace,
    TextColor,
    Indent,
    TabKey,
    LineHeight,
    ParagraphSpacing
  } = window.TipTap;

  // Baca JSON dokumen inisial
  let initialContent = null;
  const initialJsonEl = document.getElementById('initial-doc-json');
  if (initialJsonEl && initialJsonEl.textContent.trim()) {
    try {
      initialContent = JSON.parse(initialJsonEl.textContent);
    } catch (e) {
      console.warn('Gagal membaca initial doc JSON:', e);
    }
  }

  if (!initialContent) {
    initialContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tuliskan isi surat di sini...' }] }]
    };
  }

  // Inisialisasi Editor
  const editor = new Editor({
    element: document.getElementById('tiptap-surat-editor'),
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left'
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: true, allowBase64: true }),
      FindAndReplace.configure({ searchDebounceMs: 150 }),
      TextColor,
      Indent,
      TabKey,
      LineHeight,
      ParagraphSpacing
    ],
    content: initialContent,
    autofocus: true,
    onTransaction: () => {
      updateToolbarActiveStates();
      updateDocumentStats();
      updateFindCounter();
    }
  });

  // Toolbar Element Bindings
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

  btnUndo.onclick = () => editor.chain().focus().undo().run();
  btnRedo.onclick = () => editor.chain().focus().redo().run();
  btnBold.onclick = () => editor.chain().focus().toggleBold().run();
  btnItalic.onclick = () => editor.chain().focus().toggleItalic().run();
  btnUnderline.onclick = () => editor.chain().focus().toggleUnderline().run();

  selectHeading.onchange = (e) => {
    const val = e.target.value;
    if (val === 'p') editor.chain().focus().setParagraph().run();
    else if (val === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (val === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (val === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  btnAlignLeft.onclick = () => editor.chain().focus().setTextAlign('left').run();
  btnAlignCenter.onclick = () => editor.chain().focus().setTextAlign('center').run();
  btnAlignRight.onclick = () => editor.chain().focus().setTextAlign('right').run();
  btnAlignJustify.onclick = () => editor.chain().focus().setTextAlign('justify').run();

  btnBulletList.onclick = () => editor.chain().focus().toggleBulletList().run();
  btnOrderedList.onclick = () => editor.chain().focus().toggleOrderedList().run();

  // Tabel
  document.getElementById('btn-insert-table').onclick = () => editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run();
  document.getElementById('btn-add-row').onclick = () => editor.chain().focus().addRowAfter().run();
  document.getElementById('btn-delete-row').onclick = () => editor.chain().focus().deleteRow().run();
  document.getElementById('btn-add-col').onclick = () => editor.chain().focus().addColumnAfter().run();
  document.getElementById('btn-delete-col').onclick = () => editor.chain().focus().deleteColumn().run();
  document.getElementById('btn-delete-table').onclick = () => editor.chain().focus().deleteTable().run();

  // Gambar
  const btnInsertImage = document.getElementById('btn-insert-image');
  const imageFileInput = document.getElementById('editor-image-file-input');
  btnInsertImage.onclick = () => imageFileInput.click();
  imageFileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('gambar', file);
    try {
      const res = await fetch('/api/editor/upload-gambar', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } else {
        alert(data.message || 'Gagal mengunggah gambar.');
      }
    } catch(err) {
      alert('Terjadi kesalahan saat mengunggah gambar.');
    } finally {
      imageFileInput.value = '';
    }
  };

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

  // Jarak Spasi Baris & Hilangkan Space (Diterapkan ke teks/paragraf yang dipilih)
  const paperContainer = document.getElementById('f4-paper-container');
  const selectLineSpacing = document.getElementById('select-line-spacing');
  const btnToggleNoSpacing = document.getElementById('btn-toggle-no-spacing');

  if (btnToggleNoSpacing) {
    btnToggleNoSpacing.onclick = () => {
      if (editor && editor.commands && editor.commands.toggleNoSpacing) {
        editor.chain().focus().toggleNoSpacing().run();
      }
    };
  }

  if (selectLineSpacing && paperContainer) {
    selectLineSpacing.onchange = (e) => {
      const val = e.target.value;
      if (val === 'tight') {
        if (editor && editor.commands && editor.commands.setNoSpacing) {
          editor.chain().focus().setNoSpacing(true).run();
        } else if (editor && editor.commands && editor.commands.setLineHeight) {
          editor.chain().focus().setLineHeight('1.0').run();
        }
        paperContainer.style.setProperty('--paper-line-height', '1.0');
        const pm = paperContainer.querySelector('.ProseMirror');
        if (pm) pm.style.lineHeight = '1.0';
      } else {
        if (editor && editor.commands && editor.commands.setLineHeight) {
          editor.chain().focus().setLineHeight(val).run();
        }
        if (editor && editor.commands && editor.commands.setNoSpacing) {
          editor.chain().focus().setNoSpacing(false).run();
        }
        paperContainer.style.setProperty('--paper-line-height', val);
        const pm = paperContainer.querySelector('.ProseMirror');
        if (pm) pm.style.lineHeight = val;
      }
    };
  }

  // Atur Margin F4 (Margin atas tetap 0.5 cm = 5mm, sisi & bawah dinamis)
  const selectMargin = document.getElementById('select-margin');
  if (selectMargin && paperContainer) {
    selectMargin.onchange = (e) => {
      const val = e.target.value;
      paperContainer.style.setProperty('--paper-margin-side', val);
      paperContainer.style.setProperty('--paper-margin-bottom', val);
      paperContainer.style.padding = `5mm ${val} ${val} ${val}`;
      // Perbarui posisi visual batas margin pada penggaris
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
    if (markerFirst) markerFirst.setAttribute('points', `${mm},0.5 ${mm - 3},5.5 ${mm + 3},5.5`);
    if (markerLeft) markerLeft.setAttribute('points', `${mm},18 ${mm - 3},13.5 ${mm + 3},13.5`);
    if (markerBox) markerBox.setAttribute('x', mm - 3);
    if (markerRight) markerRight.setAttribute('points', `${rightMm},18 ${rightMm - 3},13.5 ${rightMm + 3},13.5`);
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
      hairlineEl.style.left = `${offsetX}px`;
      tooltipEl.style.display = 'block';
      tooltipEl.style.left = `${offsetX}px`;
      tooltipEl.textContent = `${cm} cm (${mm} mm)`;
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

  // Pisah Halaman / Lampiran (Page Break)
  const btnPageBreak = document.getElementById('btn-insert-pagebreak');
  if (btnPageBreak) {
    btnPageBreak.onclick = () => editor.chain().focus().setHorizontalRule().run();
  }

  // Find & Replace
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
      if (findInput.value) editor.commands.setSearchTerm(findInput.value);
    } else {
      panelFindReplace.classList.remove('is-open');
      btnToggleFindReplace.classList.remove('is-active');
      editor.commands.clearSearch();
      editor.commands.focus();
    }
    updateFindCounter();
  }

  btnToggleFindReplace.onclick = () => toggleFindPanel();
  btnCloseFind.onclick = () => toggleFindPanel(false);

  findInput.oninput = (e) => {
    const term = e.target.value;
    if (term) editor.commands.setSearchTerm(term);
    else editor.commands.clearSearch();
    setTimeout(updateFindCounter, 160);
  };

  replaceInput.oninput = (e) => editor.commands.setReplaceTerm(e.target.value);
  checkCaseSensitive.onchange = (e) => {
    editor.commands.setCaseSensitive(e.target.checked);
    setTimeout(updateFindCounter, 50);
  };
  btnFindNext.onclick = () => { editor.commands.goToNextResult(); setTimeout(updateFindCounter, 50); };
  btnFindPrev.onclick = () => { editor.commands.goToPreviousResult(); setTimeout(updateFindCounter, 50); };
  btnReplaceOne.onclick = () => {
    if (replaceInput.value) editor.commands.setReplaceTerm(replaceInput.value);
    editor.commands.replace();
    setTimeout(updateFindCounter, 50);
  };
  btnReplaceAll.onclick = () => {
    if (replaceInput.value) editor.commands.setReplaceTerm(replaceInput.value);
    editor.commands.replaceAll();
    setTimeout(updateFindCounter, 50);
  };

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

  // Cetak F4
  document.getElementById('btn-print-doc').onclick = () => {
    if (panelFindReplace.classList.contains('is-open')) toggleFindPanel(false);
    window.print();
  };

  // Simpan ke Arsip
  const btnSimpanArsip = document.getElementById('btn-simpan-arsip');
  const docIdInput = document.getElementById('doc-id');
  const titleInput = document.getElementById('doc-title-input');
  const nomorInput = document.getElementById('doc-nomor-input');
  const templateIdInput = document.getElementById('doc-template-id');
  const tujuanInput = document.getElementById('doc-tujuan');
  const perihalInput = document.getElementById('doc-perihal');
  const tanggalInput = document.getElementById('doc-tanggal');
  const noTotalInput = document.getElementById('doc-no-urut-total');
  const noJenisInput = document.getElementById('doc-no-urut-jenis');
  const sifatInput = document.getElementById('doc-sifat-surat');
  const ttdInput = document.getElementById('doc-kode-penandatangan');
  const panitiaInput = document.getElementById('doc-nama-panitia');
  const bulanInput = document.getElementById('doc-bulan-surat');
  const tahunInput = document.getElementById('doc-tahun-surat');
  const saveStatusText = document.getElementById('save-status-text');

  // Helper Toast Notifikasi Modern & Menarik
  function showToast(title, type = 'success', subtitle = '') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const isSuccess = type === 'success';
    toast.innerHTML = `
      <div class="toast-icon">
        ${isSuccess ? 
          '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>' :
          '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>'
        }
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${subtitle ? `<div class="toast-subtitle">${subtitle}</div>` : ''}
      </div>
      <button type="button" class="toast-close" title="Tutup">✕</button>
    `;

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
    }, 4000);
  }

  async function simpanKeArsip() {
    const originalBtnHtml = btnSimpanArsip.innerHTML;
    btnSimpanArsip.disabled = true;
    btnSimpanArsip.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-linecap="round"></circle>
      </svg>
      <span>Menyimpan...</span>
    `;
    saveStatusText.textContent = 'Menyimpan ke arsip...';

    const payload = {
      id: docIdInput.value || null,
      judul: titleInput.value.trim() || 'Surat Keluar PMII',
      nomor_dokumen: nomorInput.value.trim(),
      jenis: 'surat_keluar',
      template_id: templateIdInput.value || null,
      tujuan: tujuanInput.value,
      perihal: perihalInput.value,
      tanggal_dokumen: tanggalInput.value || new Date().toISOString().slice(0, 10),
      no_urut_total: noTotalInput ? (noTotalInput.value || null) : null,
      no_urut_jenis: noJenisInput ? (noJenisInput.value || null) : null,
      sifat_surat: sifatInput ? (sifatInput.value || '01') : '01',
      kode_penandatangan: ttdInput ? (ttdInput.value || 'A-I') : 'A-I',
      nama_panitia: panitiaInput ? (panitiaInput.value || '') : '',
      bulan_surat: bulanInput ? (bulanInput.value || '') : '',
      tahun_surat: tahunInput ? (tahunInput.value || '') : '',
      margin: selectMargin ? selectMargin.value : '20mm',
      line_spacing: selectLineSpacing ? selectLineSpacing.value : '1.5',
      konten_json: editor.getJSON(),
      konten_html: editor.getHTML()
    };

    try {
      const res = await fetch('/api/surat/simpan-arsip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.dokumenId) {
        docIdInput.value = data.dokumenId;
        const waktu = new Date().toLocaleTimeString('id-ID');
        saveStatusText.textContent = `✓ Tersimpan di Arsip (${waktu})`;

        // Indikator tombol Berhasil Disimpan (Warna Hijau)
        btnSimpanArsip.disabled = false;
        btnSimpanArsip.style.backgroundColor = '#10b981';
        btnSimpanArsip.style.borderColor = '#059669';
        btnSimpanArsip.style.color = '#ffffff';
        btnSimpanArsip.innerHTML = `
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Berhasil Disimpan!</span>
        `;

        // Tampilkan floating Toast Notifikasi berhasil disimpan
        showToast(
          'Dokumen Berhasil Disimpan ke Arsip!',
          'success',
          `Nomor: ${nomorInput.value || '-'} &bull; Judul: ${titleInput.value || 'Surat Keluar'}`
        );

        setTimeout(() => {
          btnSimpanArsip.innerHTML = originalBtnHtml;
          btnSimpanArsip.style.backgroundColor = '';
          btnSimpanArsip.style.borderColor = '';
          btnSimpanArsip.style.color = '';
        }, 2500);

        return data.dokumenId;
      } else {
        btnSimpanArsip.disabled = false;
        btnSimpanArsip.innerHTML = originalBtnHtml;
        saveStatusText.textContent = 'Gagal menyimpan arsip';
        showToast('Gagal Menyimpan ke Arsip', 'error', data.message || 'Silakan periksa kembali isian formulir.');
        return null;
      }
    } catch(err) {
      console.error(err);
      btnSimpanArsip.disabled = false;
      btnSimpanArsip.innerHTML = originalBtnHtml;
      saveStatusText.textContent = 'Error koneksi lokal';
      showToast('Kesalahan Jaringan', 'error', 'Tidak dapat terhubung ke server lokal.');
      return null;
    }
  }

  btnSimpanArsip.onclick = simpanKeArsip;

  // Unduh Word (.docx)
  document.getElementById('btn-unduh-word').onclick = async () => {
    let currentId = docIdInput.value;
    if (!currentId) {
      // Simpan dulu agar dokumen ada ID di server
      currentId = await simpanKeArsip();
    }
    if (currentId) {
      const mVal = selectMargin ? selectMargin.value : '20mm';
      const lsVal = selectLineSpacing ? selectLineSpacing.value : '1.5';
      window.location.href = `/dokumen/${currentId}/export-word?margin=${encodeURIComponent(mVal)}&line_spacing=${encodeURIComponent(lsVal)}`;
    }
  };

  // Keyboard shortcut Ctrl+S
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      simpanKeArsip();
    }
  });

  function updateToolbarActiveStates() {
    btnBold.classList.toggle('is-active', editor.isActive('bold'));
    btnItalic.classList.toggle('is-active', editor.isActive('italic'));
    btnUnderline.classList.toggle('is-active', editor.isActive('underline'));

    if (editor.isActive('heading', { level: 1 })) selectHeading.value = 'h1';
    else if (editor.isActive('heading', { level: 2 })) selectHeading.value = 'h2';
    else if (editor.isActive('heading', { level: 3 })) selectHeading.value = 'h3';
    else selectHeading.value = 'p';

    btnAlignLeft.classList.toggle('is-active', editor.isActive({ textAlign: 'left' }));
    btnAlignCenter.classList.toggle('is-active', editor.isActive({ textAlign: 'center' }));
    btnAlignRight.classList.toggle('is-active', editor.isActive({ textAlign: 'right' }));
    btnAlignJustify.classList.toggle('is-active', editor.isActive({ textAlign: 'justify' }));

    btnBulletList.classList.toggle('is-active', editor.isActive('bulletList'));
    btnOrderedList.classList.toggle('is-active', editor.isActive('orderedList'));

    if (selectLineSpacing) {
      const { from, to } = editor.state.selection;
      let activeLineHeight = null;
      let activeNoSpacing = false;
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (['paragraph', 'heading'].includes(node.type.name)) {
          if (node.attrs.noSpacing) activeNoSpacing = true;
          if (node.attrs.lineHeight) activeLineHeight = node.attrs.lineHeight;
        }
      });
      if (activeNoSpacing) {
        selectLineSpacing.value = 'tight';
      } else if (activeLineHeight) {
        selectLineSpacing.value = activeLineHeight;
      }
      if (btnToggleNoSpacing) {
        btnToggleNoSpacing.classList.toggle('is-active', activeNoSpacing);
      }
    }
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

  updateToolbarActiveStates();
  updateDocumentStats();
});
