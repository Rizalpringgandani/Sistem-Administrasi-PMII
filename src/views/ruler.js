/**
 * Komponen Penggaris Horizontal Kayak di Word (Word-like Horizontal Ruler)
 * Ukuran kertas F4 (215mm / 21.5 cm) dengan penanda margin, cm, mm, dan hairline guide
 */

function renderWordRulerHtml(marginMm = 20) {
  let ticksSvg = '';
  for (let mm = 0; mm <= 215; mm++) {
    if (mm % 10 === 0) {
      ticksSvg += `<line x1="${mm}" y1="13" x2="${mm}" y2="25" stroke="#64748b" stroke-width="0.7"/>`;
      if (mm > 0 && mm < 215) {
        ticksSvg += `<text x="${mm}" y="10" font-size="6.8" font-family="'Segoe UI', Roboto, Arial, sans-serif" font-weight="600" fill="#334155" text-anchor="middle">${mm / 10}</text>`;
      }
    } else if (mm % 5 === 0) {
      ticksSvg += `<line x1="${mm}" y1="17" x2="${mm}" y2="25" stroke="#94a3b8" stroke-width="0.5"/>`;
    } else {
      ticksSvg += `<line x1="${mm}" y1="21" x2="${mm}" y2="25" stroke="#cbd5e1" stroke-width="0.35"/>`;
    }
  }

  const rightX = 215 - marginMm;

  return `
    <div class="word-ruler-wrapper" id="word-ruler-wrapper">
      <div class="word-ruler" id="word-ruler">
        <svg viewBox="0 0 215 26" preserveAspectRatio="none" style="width: 100%; height: 26px;">
          <!-- Shading Margin Kiri -->
          <rect id="ruler-margin-left" x="0" y="0" width="${marginMm}" height="26" fill="#e2e8f0" />
          <!-- Area Teks Putih -->
          <rect id="ruler-body" x="${marginMm}" y="0" width="${215 - (marginMm * 2)}" height="26" fill="#ffffff" />
          <!-- Shading Margin Kanan -->
          <rect id="ruler-margin-right" x="${rightX}" y="0" width="${marginMm}" height="26" fill="#e2e8f0" />
          
          <!-- Garis Batas Bawah Penggaris -->
          <line x1="0" y1="25.5" x2="215" y2="25.5" stroke="#94a3b8" stroke-width="0.8" />
          
          <!-- Tanda Skala Garis & Angka cm/mm -->
          ${ticksSvg}

          <!-- Penanda Indentasi / Margin Kiri (First line indent & Left indent) -->
          <g id="group-marker-left">
            <polygon id="marker-indent-first" points="${marginMm},0.5 ${marginMm - 3},5.5 ${marginMm + 3},5.5" fill="#1e293b" />
            <polygon id="marker-indent-left" points="${marginMm},18 ${marginMm - 3},13.5 ${marginMm + 3},13.5" fill="#1e293b" />
            <rect id="marker-indent-box" x="${marginMm - 3}" y="19" width="6" height="4.5" fill="#1e293b" />
          </g>

          <!-- Penanda Indentasi / Margin Kanan -->
          <g id="group-marker-right">
            <polygon id="marker-indent-right" points="${rightX},18 ${rightX - 3},13.5 ${rightX + 3},13.5" fill="#1e293b" />
            <rect id="marker-indent-right-box" x="${rightX - 3}" y="19" width="6" height="4.5" fill="#1e293b" />
          </g>
        </svg>
        <div class="word-ruler-hairline" id="ruler-hairline"></div>
        <div class="word-ruler-tooltip" id="ruler-tooltip">0.0 cm</div>
      </div>
    </div>
  `;
}

module.exports = {
  renderWordRulerHtml
};
