/**
 * SISTEM ADMINISTRASI PMII RAYON - JS LURING (OFFLINE)
 * Script interaktivitas lokal, tanpa dependensi luar
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto-dismiss flash alerts setelah 5 detik
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-5px)';
      setTimeout(() => alert.remove(), 400);
    }, 5000);
  });

  // 2. Preview gambar saat unggah logo rayon
  const logoInput = document.getElementById('input-logo-rayon');
  const logoPreview = document.getElementById('preview-logo-rayon');
  if (logoInput && logoPreview) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          logoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview Logo">`;
          logoPreview.classList.remove('empty');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 3. Konfirmasi sebelum tindakan penting (misal hapus atau reset)
  const confirmButtons = document.querySelectorAll('[data-confirm]');
  confirmButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const message = btn.getAttribute('data-confirm') || 'Apakah Anda yakin ingin melanjutkan tindakan ini?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
});
