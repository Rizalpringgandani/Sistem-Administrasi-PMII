/**
 * Service Generator Berkas Dokumen Word (.docx) Berstandar F4 (215 x 330 mm)
 * Mengonversi TipTap JSON & Kop Surat Resmi PMII ke OpenXML Word (.docx)
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  convertInchesToTwip
} = require('docx');
const fs = require('node:fs');
const path = require('node:path');

// Dimensi Kertas F4 (215 x 330 mm) dalam satuan dxa (twips)
// 1 mm = 56.6929 twips
const F4_WIDTH_DXA = 12189;  // 215 mm
const F4_HEIGHT_DXA = 18709; // 330 mm
const MARGIN_25MM_DXA = 1417; // 25 mm = 2.5 cm

/**
 * Menghasilkan buffer dokumen .docx dari TipTap JSON dan Kop Surat PMII
 */
async function generateDocxFromTipTap({ docData, settings, includeKop = true }) {
  const children = [];

  // 1. Buat Kop Surat Resmi PMII jika diminta
  if (includeKop) {
    const kopElements = createKopSuratDocx(settings);
    children.push(...kopElements);
  }

  // 2. Parse Konten TipTap JSON
  let tiptapJson = docData.konten_json;
  if (typeof tiptapJson === 'string') {
    try {
      tiptapJson = JSON.parse(tiptapJson);
    } catch (e) {
      tiptapJson = null;
    }
  }

  if (tiptapJson && Array.isArray(tiptapJson.content)) {
    for (const node of tiptapJson.content) {
      const docxNode = convertTipTapNodeToDocx(node);
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

  // 3. Susun Dokumen Word dengan Ukuran Kertas F4
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: F4_WIDTH_DXA,
            height: F4_HEIGHT_DXA
          },
          margin: {
            top: MARGIN_25MM_DXA,
            bottom: MARGIN_25MM_DXA,
            left: MARGIN_25MM_DXA,
            right: MARGIN_25MM_DXA
          }
        }
      },
      children: children
    }]
  });

  return await Packer.toBuffer(doc);
}

/**
 * Membuat Header Kop Surat Resmi PMII di Word
 */
function createKopSuratDocx(settings) {
  const elements = [];

  const namaRayon = (settings.nama_rayon || 'RAYON PMII').toUpperCase();
  const namaKomisariat = (settings.nama_komisariat || '').toUpperCase();
  const namaCabang = (settings.nama_cabang || '').toUpperCase();
  const alamat = settings.alamat_sekretariat || 'Alamat Sekretariat';
  const kontak = settings.telepon_rayon ? `Telp/WA: ${settings.telepon_rayon}` : '';
  const email = settings.email_rayon ? `Email: ${settings.email_rayon}` : '';
  const kontakStr = [kontak, email].filter(Boolean).join(' | ');

  // Periksa apakah ada logo lokal yang bisa disematkan
  let logoRun = null;
  let logoPath = null;
  if (settings.logo_rayon && fs.existsSync(path.join(__dirname, '../../public', settings.logo_rayon))) {
    logoPath = path.join(__dirname, '../../public', settings.logo_rayon);
  } else if (fs.existsSync(path.join(__dirname, '../../public/img/pmii-logo.png'))) {
    logoPath = path.join(__dirname, '../../public/img/pmii-logo.png');
  }

  if (logoPath && (logoPath.endsWith('.png') || logoPath.endsWith('.jpg') || logoPath.endsWith('.jpeg'))) {
    try {
      logoRun = new ImageRun({
        data: fs.readFileSync(logoPath),
        transformation: {
          width: 75,
          height: 85
        }
      });
    } catch (e) {
      console.warn('Gagal memuat gambar logo untuk kop Word:', e.message);
    }
  }

  // Kop disusun menggunakan tabel 2 kolom borderless
  const leftCellChildren = logoRun ? [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [logoRun]
    })
  ] : [];

  const rightCellChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240, after: 40 },
      children: [
        new TextRun({
          text: 'PENGURUS RAYON',
          bold: true,
          size: 24, // 12pt
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240, after: 40 },
      children: [
        new TextRun({
          text: 'PERGERAKAN MAHASISWA ISLAM INDONESIA',
          bold: true,
          size: 28, // 14pt
          color: '003366',
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240, after: 40 },
      children: [
        new TextRun({
          text: '(Indonesian Muslim Student Movement)',
          italics: true,
          size: 18, // 9pt
          color: 'D99B00',
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240, after: 60 },
      children: [
        new TextRun({
          text: `${namaRayon} ${namaKomisariat} ${namaCabang}`,
          bold: true,
          size: 22, // 11pt
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 220, after: 80 },
      children: [
        new TextRun({
          text: alamat,
          size: 17, // 8.5pt
          font: 'Times New Roman'
        }),
        kontakStr ? new TextRun({
          text: `\n${kontakStr}`,
          size: 17,
          font: 'Times New Roman'
        }) : new TextRun({ text: '' })
      ]
    })
  ];

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
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: leftCellChildren.length ? leftCellChildren : [new Paragraph({})]
          }),
          new TableCell({
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: rightCellChildren
          })
        ]
      })
    ]
  });

  elements.push(kopTable);

  // Garis Pembatas Ganda Tebal Kop Surat
  elements.push(
    new Paragraph({
      spacing: { before: 80, after: 200 },
      border: {
        bottom: {
          style: BorderStyle.DOUBLE,
          size: 18,
          color: '000000'
        }
      }
    })
  );

  return elements;
}

/**
 * Konversi satu node TipTap ke komponen docx
 */
function convertTipTapNodeToDocx(node) {
  if (!node) return null;

  switch (node.type) {
    case 'heading': {
      const level = node.attrs && node.attrs.level ? node.attrs.level : 1;
      const align = mapAlignment(node.attrs && node.attrs.textAlign);
      const textRuns = parseTextRuns(node.content);
      const fontSize = level === 1 ? 32 : level === 2 ? 28 : 24;

      // Beri style bold pada heading
      textRuns.forEach(r => {
        r.bold = true;
        r.size = fontSize;
        r.font = 'Times New Roman';
      });

      return new Paragraph({
        alignment: align,
        spacing: { before: 180, after: 100, line: 300 },
        children: textRuns
      });
    }

    case 'paragraph': {
      const align = mapAlignment(node.attrs && node.attrs.textAlign);
      const textRuns = parseTextRuns(node.content);

      return new Paragraph({
        alignment: align,
        spacing: { after: 120, line: 300 }, // Spasi 1.25x
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

    case 'table': {
      const rows = [];
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

              cells.push(new TableCell({
                children: cellParagraphs,
                shading: isHeader ? { fill: 'F1F5F9' } : undefined,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
                  left: { style: BorderStyle.SINGLE, size: 4, color: '334155' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: '334155' }
                }
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
 * Parsing TextRuns dari content TipTap
 */
function parseTextRuns(content) {
  if (!Array.isArray(content)) return [];

  const runs = [];
  for (const item of content) {
    if (item.type === 'text') {
      let isBold = false;
      let isItalic = false;
      let isUnderline = false;

      if (Array.isArray(item.marks)) {
        for (const mark of item.marks) {
          if (mark.type === 'bold') isBold = true;
          if (mark.type === 'italic') isItalic = true;
          if (mark.type === 'underline') isUnderline = true;
        }
      }

      runs.push(new TextRun({
        text: item.text,
        bold: isBold,
        italics: isItalic,
        underline: isUnderline ? {} : undefined,
        size: 24, // 12pt standar Word
        font: 'Times New Roman'
      }));
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
