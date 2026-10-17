/**
 * Halaman Pengaturan Organisasi & Akun Admin PMII Rayon
 */

const { escapeHtml } = require('./layout');

function renderPengaturanPage({ settings }) {
  const namaRayon = escapeHtml(settings.nama_rayon || '');
  const namaKomisariat = escapeHtml(settings.nama_komisariat || '');
  const namaCabang = escapeHtml(settings.nama_cabang || '');
  const kampus = escapeHtml(settings.kampus || '');
  const alamat = escapeHtml(settings.alamat_sekretariat || '');
  const email = escapeHtml(settings.email_rayon || '');
  const telepon = escapeHtml(settings.telepon_rayon || '');
  const kodeRayon = escapeHtml(settings.kode_rayon || '');
  const formatNomor = escapeHtml(settings.format_nomor_surat || '{no}/{kd}/{rayon}/PMII/{romawi}/{tahun}');
  const logoRayon = settings.logo_rayon || '';
  const logoPmii = settings.logo_pmii || '/img/pmii-logo.svg';

  return `
    <div class="grid-cols-3">
      <!-- Kolom 1 & 2: Form Identitas Organisasi -->
      <div style="grid-column: span 2;">
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Identitas Rayon & Organisasi
            </h3>
          </div>
          <form action="/pengaturan" method="POST">
            <div class="card-body">
              <div class="grid-cols-2">
                <div class="form-group">
                  <label class="form-label" for="nama_rayon">Nama Rayon <span class="required">*</span></label>
                  <input type="text" id="nama_rayon" name="nama_rayon" class="form-control" value="${namaRayon}" required placeholder="Contoh: Rayon Pancasila">
                </div>

                <div class="form-group">
                  <label class="form-label" for="nama_komisariat">Komisariat <span class="required">*</span></label>
                  <input type="text" id="nama_komisariat" name="nama_komisariat" class="form-control" value="${namaKomisariat}" required placeholder="Contoh: Komisariat Raden Rahmat">
                </div>
              </div>

              <div class="grid-cols-2">
                <div class="form-group">
                  <label class="form-label" for="nama_cabang">Pengurus Cabang (PC) <span class="required">*</span></label>
                  <input type="text" id="nama_cabang" name="nama_cabang" class="form-control" value="${namaCabang}" required placeholder="Contoh: PC PMII Kota Malang">
                </div>

                <div class="form-group">
                  <label class="form-label" for="kampus">Perguruan Tinggi / Kampus</label>
                  <input type="text" id="kampus" name="kampus" class="form-control" value="${kampus}" placeholder="Contoh: UIN Maulana Malik Ibrahim">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="alamat_sekretariat">Alamat Sekretariat Lengkap</label>
                <textarea id="alamat_sekretariat" name="alamat_sekretariat" class="form-control" placeholder="Alamat jalan, kelurahan, kecamatan, dan kota sekretariat">${alamat}</textarea>
                <div class="form-hint">Alamat ini otomatis dicantumkan pada kop surat dan dokumen resmi rayon.</div>
              </div>

              <div class="grid-cols-2">
                <div class="form-group">
                  <label class="form-label" for="email_rayon">Email Resmi Rayon</label>
                  <input type="email" id="email_rayon" name="email_rayon" class="form-control" value="${email}" placeholder="rayon@pmii.org">
                </div>

                <div class="form-group">
                  <label class="form-label" for="telepon_rayon">Nomor Kontak / WhatsApp Sekretariat</label>
                  <input type="text" id="telepon_rayon" name="telepon_rayon" class="form-control" value="${telepon}" placeholder="08xxxxxxxxxx">
                </div>
              </div>

              <hr style="border: 0; border-top: 1px solid var(--border); margin: 1.25rem 0;">

              <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem;">Standar Penomoran Surat PMII</h4>

              <div class="grid-cols-2">
                <div class="form-group">
                  <label class="form-label" for="kode_rayon">Kode Singkatan Rayon</label>
                  <input type="text" id="kode_rayon" name="kode_rayon" class="form-control" value="${kodeRayon}" placeholder="Contoh: PR-PANCASILA">
                  <div class="form-hint">Kode rayon dalam penomoran surat.</div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="format_nomor_surat">Format Nomor Surat Bawaan</label>
                  <input type="text" id="format_nomor_surat" name="format_nomor_surat" class="form-control" value="${formatNomor}">
                  <div class="form-hint">Variabel: <code>{no}</code>, <code>{kd}</code>, <code>{rayon}</code>, <code>{romawi}</code>, <code>{tahun}</code></div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button type="submit" class="btn btn-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Simpan Perubahan Identitas
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Kolom 3: Upload Logo & Keamanan Kata Sandi -->
      <div>
        <!-- Logo Organisasi -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Logo Resmi Rayon
            </h3>
          </div>
          <form action="/pengaturan/logo" method="POST" enctype="multipart/form-data">
            <div class="card-body" style="text-align: center;">
              <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.35rem;">Logo PMII (Baku)</div>
                  <div class="logo-preview-box">
                    <img src="${logoPmii}" alt="Logo PMII">
                  </div>
                </div>
                <div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.35rem;">Logo Rayon</div>
                  <div id="preview-logo-rayon" class="logo-preview-box ${logoRayon ? '' : 'empty'}">
                    ${logoRayon ? `<img src="${logoRayon}" alt="Logo Rayon">` : 'Belum Ada Logo'}
                  </div>
                </div>
              </div>

              <div class="form-group" style="text-align: left;">
                <label class="form-label" for="input-logo-rayon">Pilih Berkas Logo Rayon (PNG/JPG)</label>
                <input type="file" id="input-logo-rayon" name="logo_rayon" class="form-control" accept="image/png, image/jpeg, image/jpg">
                <div class="form-hint">Disarankan gambar transparan PNG beresolusi tajam.</div>
              </div>

              <button type="submit" class="btn btn-outline btn-sm" style="width: 100%;">
                Unggah Logo Rayon
              </button>
            </div>
          </form>
        </div>

        <!-- Ubah Kata Sandi Admin -->
        <div class="card">
          <div class="card-header">
            <h3>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Keamanan Kata Sandi
            </h3>
          </div>
          <form action="/pengaturan/kata-sandi" method="POST">
            <div class="card-body">
              <div class="form-group">
                <label class="form-label" for="kata_sandi_lama">Kata Sandi Saat Ini <span class="required">*</span></label>
                <input type="password" id="kata_sandi_lama" name="kata_sandi_lama" class="form-control" required placeholder="Kata sandi saat ini">
              </div>

              <div class="form-group">
                <label class="form-label" for="kata_sandi_baru">Kata Sandi Baru <span class="required">*</span></label>
                <input type="password" id="kata_sandi_baru" name="kata_sandi_baru" class="form-control" required placeholder="Minimal 6 karakter" minlength="6">
              </div>

              <div class="form-group">
                <label class="form-label" for="konfirmasi_kata_sandi">Ulangi Kata Sandi Baru <span class="required">*</span></label>
                <input type="password" id="konfirmasi_kata_sandi" name="konfirmasi_kata_sandi" class="form-control" required placeholder="Ketik ulang kata sandi baru">
              </div>

              <button type="submit" class="btn btn-gold btn-sm" style="width: 100%;">
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  renderPengaturanPage
};
