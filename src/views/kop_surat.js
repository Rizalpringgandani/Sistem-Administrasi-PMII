/**
 * Komponen Bersama Kop Surat dan Footer Halaman Resmi PMII Rayon
 * Sesuai Pedoman Penyelenggaraan Tertib Administrasi (PPTA) & PEDOMAN_SURAT.md
 */

const { escapeHtml } = require('./layout');

/**
 * Merender Kop Surat Resmi PMII Rayon:
 * - Logo PMII di kiri dengan "V-02" di bawahnya (Arial Narrow Bold #51A0D8)
 * - Teks tengah 7 baris warna #51A0D8, spasi 1.0, rata tengah
 * - Logo Rayon/Komisariat di kanan dengan nama rayon kecil di bawahnya
 * - Garis atas 1 1/2 pt biru #51A0D8, garis bawah 2 1/4 pt abu-abu #808080
 */
function renderKopSuratHtml(settings = {}) {
  const kopTingkat = escapeHtml((settings.kop_tingkat || 'PENGURUS RAYON').toUpperCase());
  const kopLembaga = escapeHtml((settings.kop_lembaga || 'PERGERAKAN MAHASISWA ISLAM INDONESIA').toUpperCase());
  const kopInggris = escapeHtml(settings.kop_inggris || '(Rayon Board Of Indonesian Moslem Student Movement)');
  const namaFakultas = escapeHtml((settings.nama_fakultas || settings.nama_rayon || 'FAKULTAS EKONOMI DAN BISNIS').toUpperCase());
  const namaKomisariatUniv = escapeHtml((settings.nama_komisariat_univ || `${settings.nama_komisariat || ''} ${settings.kampus || ''}`).toUpperCase().trim());
  const alamat = escapeHtml(settings.alamat_sekretariat || 'Alamat Sekretariat');
  const kontak = settings.telepon_rayon ? `Telpon : ${escapeHtml(settings.telepon_rayon)}` : '';
  const email = settings.email_rayon ? `Email : ${escapeHtml(settings.email_rayon)}` : '';
  const kontakStr = [kontak, email].filter(Boolean).join('  ');
  const kodeWilayah = escapeHtml(settings.kode_wilayah || 'V-02');
  const logoPmii = settings.logo_pmii || '/img/pmii-logo.png';
  const logoRayon = settings.logo_rayon || logoPmii;
  const namaRayonPendek = escapeHtml((settings.nama_rayon || 'Rayon FEB').replace(/^PENGURUS\s+RAYON\s+/i, ''));
  const namaKomisariat = escapeHtml(settings.nama_komisariat || '');

  return `
    <div class="kop-surat-header" style="padding-bottom: 2px; margin-bottom: 16px;">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
        <!-- Kiri: Logo PMII & Kode Wilayah -->
        <div style="width: 88px; text-align: center; flex-shrink: 0;">
          <img src="${logoPmii}" alt="Logo PMII" style="width: 70px; height: auto; max-height: 94px; object-fit: contain; display: block; margin: 0 auto;">
          <div style="font-family: 'Arial Narrow', 'Liberation Sans Narrow', Arial, sans-serif; font-weight: bold; font-size: 11pt; color: #51A0D8; margin-top: 3px; letter-spacing: 0.5px;">
            ${kodeWilayah}
          </div>
        </div>

        <!-- Tengah: Teks Identitas Resmi PMII (#51A0D8, spasi 1.0) -->
        <div style="flex: 1; text-align: center; color: #51A0D8; font-family: 'Arial Narrow', 'Liberation Sans Narrow', Arial, sans-serif; line-height: 1.08;">
          <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 1px;">
            ${kopTingkat}
          </div>
          <div style="font-size: 13.5pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 1px;">
            ${kopLembaga}
          </div>
          <div style="font-family: 'Monotype Corsiva', 'Apple Chancery', cursive, serif; font-style: italic; font-size: 10.5pt; margin-bottom: 2px;">
            ${kopInggris}
          </div>
          <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 1px;">
            ${namaFakultas}
          </div>
          <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 3px;">
            ${namaKomisariatUniv}
          </div>
          <div style="font-size: 10pt; font-weight: bold; margin-bottom: 1px;">
            Sekretariat : ${alamat}
          </div>
          <div style="font-size: 10pt; font-weight: bold;">
            ${kontakStr}
          </div>
        </div>

        <!-- Kanan: Logo Rayon / Komisariat (Hanya logo saja, tanpa teks di bawahnya) -->
        <div style="width: 88px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${logoRayon}" alt="Logo Rayon" style="width: 76px; height: auto; max-height: 94px; object-fit: contain; display: block; margin: 0 auto;">
        </div>
      </div>

      <!-- Garis Ganda Pembatas: Garis atas 1.5pt biru #51A0D8, Garis bawah 2.25pt abu-abu #808080 -->
      <div style="margin-top: 6px;">
        <div style="border-top: 1.5pt solid #51A0D8; margin-bottom: 1.5px;"></div>
        <div style="border-top: 2.25pt solid #808080;"></div>
      </div>
    </div>
  `;
}

/**
 * Merender Footer Halaman Motto PMII
 */
function renderFooterHtml(settings = {}) {
  const motto = escapeHtml(settings.motto_kop || 'Dzikir, Fikir, Amal Sholeh');
  return `
    <div class="paper-footer" style="margin-top: 25px; text-align: center; font-style: italic; color: #51A0D8; font-size: 10pt; font-family: 'Times New Roman', Times, serif;">
      ${motto}
    </div>
  `;
}

module.exports = {
  renderKopSuratHtml,
  renderFooterHtml
};
