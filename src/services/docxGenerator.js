/**
 * Service Generator Berkas Dokumen Word (.docx) Berstandar F4 (215 x 330 mm)
 * Mengonversi TipTap JSON & Kop Surat Resmi PMII ke OpenXML Word (.docx)
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Tab,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  Header,
  Footer,
  PageBreak,
  AlignmentType,
  WidthType,
  BorderStyle
} = require('docx');
const fs = require('node:fs');
const path = require('node:path');

// Dimensi Kertas F4 (21 x 33 cm) sesuai Pedoman Surat PMII (dalam satuan twips / dxa)
// 1 mm = 56.6929 twips
const F4_WIDTH_DXA = 11906;  // 210 mm (21 cm)
const F4_HEIGHT_DXA = 18709; // 330 mm (33 cm)
const MARGIN_20MM_DXA = 1134; // 20 mm = 2.0 cm sekeliling

/**
 * Menghasilkan buffer dokumen .docx dari TipTap JSON dan Kop Surat PMII
 */
async function generateDocxFromTipTap({ docData, settings, includeKop = true }) {
  const children = [];

  // Parse Konten TipTap JSON
  let tiptapJson = docData.konten_json;
  if (typeof tiptapJson === 'string') {
    try {
      tiptapJson = JSON.parse(tiptapJson);
    } catch (e) {
      tiptapJson = null;
    }
  }

  let lineSpacingVal = 360; // Default 1.5 baris standar PMII
  if (docData && docData.line_spacing) {
    const spacingMap = {
      '1.0': 240,
      '1.15': 276,
      '1.5': 360,
      '2.0': 480
    };
    if (spacingMap[docData.line_spacing]) {
      lineSpacingVal = spacingMap[docData.line_spacing];
    }
  }

  if (tiptapJson && Array.isArray(tiptapJson.content)) {
    for (const node of tiptapJson.content) {
      const docxNode = convertTipTapNodeToDocx(node, lineSpacingVal);
      if (docxNode) {
        if (Array.isArray(docxNode)) {
          children.push(...docxNode);
        } else {
          children.push(docxNode);
        }
      }
    }
  } else if (docData.konten_html) {
    // Fallback jika hanya ada teks biasa
    children.push(new Paragraph({
      children: [new TextRun({ text: docData.konten_html.replace(/<[^>]+>/g, ' ') })]
    }));
  }

  // Margin dinamis: margin atas 0.5 cm (284 twips / dxa) sesuai kop surat resmi PMII
  let topMargin = 284;
  let bottomMargin = MARGIN_20MM_DXA;
  let leftMargin = MARGIN_20MM_DXA;
  let rightMargin = MARGIN_20MM_DXA;

  if (docData && docData.margin) {
    const marginMap = {
      '15mm': 850,
      '20mm': 1134,
      '25mm': 1417,
      '30mm': 1701
    };
    if (marginMap[docData.margin]) {
      bottomMargin = marginMap[docData.margin];
      leftMargin = marginMap[docData.margin];
      rightMargin = marginMap[docData.margin];
    }
  }

  // Kop Surat & Footer Berulang di Setiap Halaman
  const headerChildren = includeKop ? createKopSuratDocx(settings) : [];
  const mottoText = settings.motto_kop || 'Dzikir, Fikir, Amal Sholeh';

  // Susun Dokumen Word dengan Ukuran Kertas F4 (21 x 33 cm) & Margin yang Dipilih
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: F4_WIDTH_DXA,
            height: F4_HEIGHT_DXA
          },
          margin: {
            top: topMargin,
            bottom: bottomMargin,
            left: leftMargin,
            right: rightMargin,
            header: 284, // 0.5 cm (5 mm) dari tepi atas kertas
            footer: 567  // 10 mm dari tepi bawah kertas
          }
        }
      },
      headers: includeKop ? {
        default: new Header({
          children: headerChildren
        })
      } : undefined,
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80 },
              children: [
                new TextRun({
                  text: mottoText,
                  italics: true,
                  color: '51A0D8',
                  font: 'Times New Roman',
                  size: 20 // 10pt
                })
              ]
            })
          ]
        })
      },
      children: children
    }]
  });

  return await Packer.toBuffer(doc);
}

/**
 * Membuat Header Kop Surat Resmi PMII di Word Sesuai PEDOMAN_SURAT.md:
 * - Logo PMII di kiri dengan "V-02" di bawahnya (Arial Narrow Bold #51A0D8)
 * - Teks tengah 7 baris warna #51A0D8, rata tengah, spasi 1.0
 * - Logo Rayon/Komisariat di kanan dengan nama rayon kecil di bawahnya
 * - Garis atas 1 1/2 pt biru #51A0D8, garis bawah 2 1/4 pt abu-abu
 */
function createKopSuratDocx(settings) {
  const elements = [];

  const kopTingkat = (settings.kop_tingkat || 'PENGURUS RAYON').toUpperCase();
  const kopLembaga = (settings.kop_lembaga || 'PERGERAKAN MAHASISWA ISLAM INDONESIA').toUpperCase();
  const kopInggris = settings.kop_inggris || '(Rayon Board Of Indonesian Moslem Student Movement)';
  const namaFakultas = (settings.nama_fakultas || settings.nama_rayon || 'FAKULTAS EKONOMI DAN BISNIS').toUpperCase();
  const namaKomisariatUniv = (settings.nama_komisariat_univ || `${settings.nama_komisariat || ''} ${settings.kampus || ''}`).toUpperCase().trim();
  const alamat = settings.alamat_sekretariat || 'Alamat Sekretariat';
  const kontak = settings.telepon_rayon ? `Telpon : ${settings.telepon_rayon}` : '';
  const email = settings.email_rayon ? `Email : ${settings.email_rayon}` : '';
  const kontakStr = [kontak, email].filter(Boolean).join('  ');
  const kodeWilayah = settings.kode_wilayah || 'V-02';
  const namaRayonPendek = (settings.nama_rayon || 'Rayon FEB').replace(/^PENGURUS\s+RAYON\s+/i, '');

  // 1. Logo Kiri: Logo PMII
  let pmiiLogoPath = path.join(__dirname, '../../public/img/pmii-logo.png');
  let leftCellChildren = [];
  if (fs.existsSync(pmiiLogoPath)) {
    try {
      leftCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 15 },
          children: [
            new ImageRun({
              data: fs.readFileSync(pmiiLogoPath),
              transformation: { width: 68, height: 90 }
            })
          ]
        })
      );
    } catch (e) {
      console.warn('Gagal memuat logo PMII:', e.message);
    }
  }

  // Teks kode wilayah di bawah logo PMII
  leftCellChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: kodeWilayah,
          bold: true,
          size: 22, // 11pt
          color: '51A0D8',
          font: 'Arial'
        })
      ]
    })
  );

  // 2. Teks Tengah (Warna #51A0D8, spasi 1.0)
  const centerCellChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 220, before: 0, after: 15 },
      children: [
        new TextRun({
          text: kopTingkat,
          bold: true,
          size: 26, // 13pt
          color: '51A0D8',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 220, before: 0, after: 15 },
      children: [
        new TextRun({
          text: kopLembaga,
          bold: true,
          size: 27, // 13.5pt
          color: '51A0D8',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 220, before: 0, after: 15 },
      children: [
        new TextRun({
          text: kopInggris,
          italics: true,
          size: 20, // 10pt
          color: '51A0D8',
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 220, before: 0, after: 15 },
      children: [
        new TextRun({
          text: namaFakultas,
          bold: true,
          size: 26, // 13pt
          color: '51A0D8',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 220, before: 0, after: 30 },
      children: [
        new TextRun({
          text: namaKomisariatUniv,
          bold: true,
          size: 26, // 13pt
          color: '51A0D8',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 210, before: 0, after: 15 },
      children: [
        new TextRun({
          text: `Sekretariat : ${alamat}`,
          bold: true,
          size: 19, // 9.5pt
          color: '51A0D8',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 210, before: 0, after: 30 },
      children: [
        new TextRun({
          text: kontakStr,
          bold: true,
          size: 19, // 9.5pt
          color: '51A0D8',
          font: 'Arial'
        })
      ]
    })
  ];

  // 3. Logo Kanan: Logo Rayon / Komisariat
  let rayonLogoPath = null;
  if (settings.logo_rayon && fs.existsSync(path.join(__dirname, '../../public', settings.logo_rayon))) {
    rayonLogoPath = path.join(__dirname, '../../public', settings.logo_rayon);
  } else if (fs.existsSync(pmiiLogoPath)) {
    rayonLogoPath = pmiiLogoPath;
  }

  let rightCellChildren = [];
  if (rayonLogoPath) {
    try {
      rightCellChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new ImageRun({
              data: fs.readFileSync(rayonLogoPath),
              transformation: { width: 75, height: 75 }
            })
          ]
        })
      );
    } catch (e) {
      console.warn('Gagal memuat logo rayon:', e.message);
    }
  }

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  };

  const kopTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: leftCellChildren.length ? leftCellChildren : [new Paragraph({})]
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: centerCellChildren
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: rightCellChildren.length ? rightCellChildren : [new Paragraph({})]
          })
        ]
      })
    ]
  });

  elements.push(kopTable);

  // Garis Pembatas Kop Ganda:
  // Garis atas 1 1/2 pt (#51A0D8) dan Garis bawah 2 1/4 pt (#808080)
  elements.push(
    new Paragraph({
      spacing: { before: 40, after: 20 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 12, // 1.5 pt
          color: '51A0D8'
        }
      }
    }),
    new Paragraph({
      spacing: { before: 0, after: 120 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 18, // 2.25 pt
          color: '808080'
        }
      }
    })
  );

  return elements;
}

/**
 * Konversi satu node TipTap ke komponen docx
 */
function convertTipTapNodeToDocx(node, lineSpacing = 360) {
  if (!node) return null;

  switch (node.type) {
    case 'heading': {
      const level = node.attrs && node.attrs.level ? node.attrs.level : 1;
      const align = mapAlignment(node.attrs && node.attrs.textAlign);
      const textRuns = parseTextRuns(node.content);
      const fontSize = level === 1 ? 32 : level === 2 ? 28 : 24;
      const indentLevel = node.attrs && node.attrs.indent ? parseInt(node.attrs.indent, 10) : 0;
      const indentOpt = indentLevel > 0 ? { left: indentLevel * 720 } : undefined;

      // Beri style bold pada heading
      textRuns.forEach(r => {
        r.bold = true;
        r.size = fontSize;
        r.font = 'Times New Roman';
      });

      return new Paragraph({
        alignment: align,
        indent: indentOpt,
        spacing: { before: 180, after: 100, line: lineSpacing },
        children: textRuns
      });
    }

    case 'paragraph': {
      const align = mapAlignment(node.attrs && node.attrs.textAlign);
      const textRuns = parseTextRuns(node.content);
      const indentLevel = node.attrs && node.attrs.indent ? parseInt(node.attrs.indent, 10) : 0;
      const indentOpt = indentLevel > 0 ? { left: indentLevel * 720 } : undefined;

      return new Paragraph({
        alignment: align,
        indent: indentOpt,
        spacing: { after: 120, line: lineSpacing },
        children: textRuns.length ? textRuns : [new TextRun('')]
      });
    }

    case 'bulletList': {
      const items = [];
      if (Array.isArray(node.content)) {
        for (const listItem of node.content) {
          if (Array.isArray(listItem.content)) {
            for (const p of listItem.content) {
              const textRuns = parseTextRuns(p.content);
              items.push(new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 80, line: 280 },
                children: textRuns
              }));
            }
          }
        }
      }
      return items;
    }

    case 'orderedList': {
      const items = [];
      if (Array.isArray(node.content)) {
        let index = 1;
        for (const listItem of node.content) {
          if (Array.isArray(listItem.content)) {
            for (const p of listItem.content) {
              const textRuns = parseTextRuns(p.content);
              // Tambahkan nomor manual untuk kompatibilitas tinggi
              textRuns.unshift(new TextRun({ text: `${index}. `, font: 'Times New Roman' }));
              items.push(new Paragraph({
                spacing: { after: 80, line: 280 },
                children: textRuns
              }));
              index++;
            }
          }
        }
      }
      return items;
    }

    case 'horizontalRule': {
      return new Paragraph({
        children: [new PageBreak()]
      });
    }

    case 'table': {
      const rows = [];
      let hasHeader = false;

      // Periksa apakah tabel ini memiliki baris judul (header)
      if (Array.isArray(node.content)) {
        for (const tr of node.content) {
          if (Array.isArray(tr.content)) {
            for (const tc of tr.content) {
              if (tc.type === 'tableHeader') {
                hasHeader = true;
                break;
              }
            }
          }
          if (hasHeader) break;
        }
      }

      if (Array.isArray(node.content)) {
        for (const tr of node.content) {
          if (tr.type === 'tableRow' && Array.isArray(tr.content)) {
            const cells = [];
            for (const tc of tr.content) {
              const isHeader = tc.type === 'tableHeader';
              const cellParagraphs = [];

              if (Array.isArray(tc.content)) {
                for (const child of tc.content) {
                  const p = convertTipTapNodeToDocx(child);
                  if (p && !Array.isArray(p)) cellParagraphs.push(p);
                }
              }

              if (!cellParagraphs.length) {
                cellParagraphs.push(new Paragraph(''));
              }

              // Jika tabel berkepala (seperti susunan acara): beri garis hitam & header kuning (#FEF08A)
              // Jika tabel tata letak (seperti rincian acara atau tanda tangan): buat tanpa border (borderless)
              const cellBorders = hasHeader ? {
                top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '000000' }
              } : {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
              };

              cells.push(new TableCell({
                children: cellParagraphs,
                shading: isHeader ? { fill: 'FEF08A' } : undefined,
                borders: cellBorders
              }));
            }
            rows.push(new TableRow({ children: cells }));
          }
        }
      }

      if (!rows.length) return null;

      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows
      });
    }

    case 'image': {
      if (node.attrs && node.attrs.src) {
        let imgPath = node.attrs.src;
        if (imgPath.startsWith('/')) {
          imgPath = path.join(__dirname, '../../public', imgPath);
        }

        if (fs.existsSync(imgPath) && (imgPath.endsWith('.png') || imgPath.endsWith('.jpg') || imgPath.endsWith('.jpeg'))) {
          try {
            return new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 120 },
              children: [
                new ImageRun({
                  data: fs.readFileSync(imgPath),
                  transformation: {
                    width: 320,
                    height: 200
                  }
                })
              ]
            });
          } catch (e) {
            console.warn('Gagal memasukkan ImageRun:', e.message);
          }
        }
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Parsing TextRuns dari content TipTap dengan dukungan warna teks & tabulasi (\t)
 */
function parseTextRuns(content) {
  if (!Array.isArray(content)) return [];

  const runs = [];
  for (const item of content) {
    if (item.type === 'text') {
      let isBold = false;
      let isItalic = false;
      let isUnderline = false;
      let textColor = undefined;

      if (Array.isArray(item.marks)) {
        for (const mark of item.marks) {
          if (mark.type === 'bold') isBold = true;
          if (mark.type === 'italic') isItalic = true;
          if (mark.type === 'underline') isUnderline = true;
          if ((mark.type === 'textColor' || mark.type === 'textStyle') && mark.attrs && mark.attrs.color) {
            textColor = mark.attrs.color.replace(/^#/, '');
          }
        }
      }

      const text = item.text || '';
      if (text.includes('\t')) {
        const parts = text.split('\t');
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            runs.push(new TextRun({
              text: parts[i],
              bold: isBold,
              italics: isItalic,
              underline: isUnderline ? {} : undefined,
              color: textColor,
              size: 24, // 12pt standar Word
              font: 'Times New Roman'
            }));
          }
          if (i < parts.length - 1) {
            runs.push(new Tab());
          }
        }
      } else {
        runs.push(new TextRun({
          text: text,
          bold: isBold,
          italics: isItalic,
          underline: isUnderline ? {} : undefined,
          color: textColor,
          size: 24, // 12pt standar Word
          font: 'Times New Roman'
        }));
      }
    }
  }

  return runs;
}

/**
 * Mapping string alignment TipTap ke docx AlignmentType
 */
function mapAlignment(align) {
  switch (align) {
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    case 'left':
    default:
      return AlignmentType.LEFT;
  }
}

module.exports = {
  generateDocxFromTipTap,
  createKopSuratDocx
};
