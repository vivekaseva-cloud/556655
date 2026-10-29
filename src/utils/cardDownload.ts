import {
  formatFullAadhaar,
  generateReporterIdCode,
  type ReporterRecord,
} from './newsLogic';

export function triggerDataUrlDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadReporterPressIdCard(
  reporter: ReporterRecord
): Promise<void> {
  const idCode = generateReporterIdCode(reporter);
  const safeSlug = (reporter.username || reporter.id || 'reporter').replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 675;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Card Background
  ctx.fillStyle = '#FFFDF9';
  ctx.fillRect(0, 0, 1080, 675);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 1072, 667);

  // Header Gradient
  const grad = ctx.createLinearGradient(0, 0, 1080, 160);
  grad.addColorStop(0, '#0B1D3A');
  grad.addColorStop(0.6, '#1E3A8A');
  grad.addColorStop(1, '#7C2D12');
  ctx.fillStyle = grad;
  ctx.fillRect(8, 8, 1064, 152);

  // Header Text
  ctx.fillStyle = '#FDE047';
  ctx.font = '900 40px "Noto Sans Telugu", sans-serif';
  ctx.fillText('నేటిభారతం · NETI BHARATAM', 44, 68);

  ctx.fillStyle = '#FED7AA';
  ctx.font = '700 21px "Noto Sans Telugu", sans-serif';
  ctx.fillText('జాతీయ · రాష్ట్ర · జిల్లా · మండల స్థాయి అధికారిక ప్రెస్ ఐడి కార్డు', 44, 108);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px "Noto Sans Telugu", sans-serif';
  ctx.fillText('ఒక దేశం - ఒకే చట్టం | OFFICIAL MANDAL PRESS ACCREDITATION CARD', 44, 140);

  // PRESS Badge
  ctx.fillStyle = '#991B1B';
  ctx.fillRect(830, 32, 206, 96);
  ctx.strokeStyle = '#FDE047';
  ctx.lineWidth = 3;
  ctx.strokeRect(830, 32, 206, 96);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRESS', 933, 82);
  ctx.fillStyle = '#FDE047';
  ctx.font = '700 15px sans-serif';
  ctx.fillText('MANDAL REPORTER', 933, 112);
  ctx.textAlign = 'left';

  // Photo Box
  ctx.fillStyle = '#0B1D3A';
  ctx.fillRect(48, 198, 230, 270);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 198, 230, 270);

  if (reporter.photoDataUrl && reporter.photoDataUrl.startsWith('data:image/')) {
    try {
      const img = await loadImage(reporter.photoDataUrl);
      ctx.drawImage(img, 52, 202, 222, 262);
    } catch {
      // fallback initials
    }
  }

  // ID Code Pill under photo
  ctx.fillStyle = '#0B1D3A';
  ctx.fillRect(48, 482, 230, 44);
  ctx.fillStyle = '#FDE047';
  ctx.font = '800 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(idCode, 163, 510);
  ctx.textAlign = 'left';

  // Details on Right
  ctx.fillStyle = '#64748B';
  ctx.font = '700 19px "Noto Sans Telugu", sans-serif';
  ctx.fillText('రిపోర్టర్ పూర్తి పేరు / REPORTER NAME:', 318, 226);

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 34px "Noto Sans Telugu", sans-serif';
  ctx.fillText(reporter.name, 318, 270);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 19px "Noto Sans Telugu", sans-serif';
  ctx.fillText('కేటాయించిన మండలం / ASSIGNED MANDAL DESK:', 318, 322);

  ctx.fillStyle = '#FFFBEB';
  ctx.fillRect(318, 336, 710, 62);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.strokeRect(318, 336, 710, 62);

  ctx.fillStyle = '#9A3412';
  ctx.font = '800 26px "Noto Sans Telugu", sans-serif';
  ctx.fillText(
    `${reporter.mandal} మండలం (${reporter.district}, ${reporter.state})`,
    336,
    377
  );

  ctx.fillStyle = '#64748B';
  ctx.font = '700 18px "Noto Sans Telugu", sans-serif';
  ctx.fillText('మొబైల్ నెంబర్ / MOBILE:', 318, 442);
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 25px monospace';
  ctx.fillText(`+91 ${reporter.mobile}`, 318, 476);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 18px "Noto Sans Telugu", sans-serif';
  ctx.fillText('యూజర్ ఐడి / USERNAME:', 660, 442);
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 24px monospace';
  ctx.fillText(`@${reporter.username}`, 660, 476);

  ctx.fillStyle = '#475569';
  ctx.font = '700 17px "Noto Sans Telugu", sans-serif';
  ctx.fillText(
    'అధికారిక ఆమోదం / AUTHORIZED BY: నేటిభారతం చీఫ్ ఎడిటర్ డెస్క్ (Admin Approved)',
    318,
    532
  );

  // Bottom Status Bar
  const isApproved = reporter.status === 'approved';
  ctx.fillStyle = isApproved ? '#15803D' : '#B45309';
  ctx.fillRect(8, 575, 1064, 92);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Noto Sans Telugu", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    isApproved
      ? 'APPROVED · అడ్మిన్ ఆమోదించిన అధికారిక ప్రెస్ గుర్తింపు కార్డు'
      : 'PENDING · అడ్మిన్ ఆమోదం కోసం వేచి ఉంది',
    540,
    616
  );
  ctx.fillStyle = '#FEF3C7';
  ctx.font = '600 17px "Noto Sans Telugu", sans-serif';
  ctx.fillText(
    'ఈ ఐడి కార్డు ఉన్న రిపోర్టర్ మాత్రమే తన మండలంలో నేటిభారతం వార్తలను అప్‌లోడ్ చేయగలరు',
    540,
    648
  );

  triggerDataUrlDownload(
    canvas.toDataURL('image/png', 0.96),
    `NetiBharatam_Press_ID_${idCode}_${safeSlug}.png`
  );
}

export async function downloadReporterAadhaarDocument(
  reporter: ReporterRecord
): Promise<void> {
  const safeSlug = (reporter.username || reporter.id || 'reporter').replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );

  if (
    reporter.aadhaarDocDataUrl &&
    reporter.aadhaarDocDataUrl.startsWith('data:application/pdf')
  ) {
    triggerDataUrlDownload(
      reporter.aadhaarDocDataUrl,
      reporter.aadhaarDocName || `NetiBharatam_Aadhaar_${safeSlug}.pdf`
    );
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 960, 600);
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 954, 594);

  // Tricolor Header
  ctx.fillStyle = '#FF9933';
  ctx.fillRect(6, 6, 948, 76);
  ctx.fillStyle = '#138808';
  ctx.fillRect(6, 82, 948, 42);

  ctx.fillStyle = '#0B1D3A';
  ctx.font = '800 26px "Noto Sans Telugu", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'భారత విశిష్ట గుర్తింపు ప్రాధికార సంస్థ · UIDAI AADHAAR KYC DOCUMENT',
    480,
    54
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px "Noto Sans Telugu", sans-serif';
  ctx.fillText(
    'నేటిభారతం (NETI BHARATAM) — REPORTER VERIFICATION COPY',
    480,
    110
  );
  ctx.textAlign = 'left';

  // Photo
  ctx.fillStyle = '#0B1D3A';
  ctx.fillRect(48, 164, 190, 220);
  if (reporter.photoDataUrl && reporter.photoDataUrl.startsWith('data:image/')) {
    try {
      const img = await loadImage(reporter.photoDataUrl);
      ctx.drawImage(img, 52, 168, 182, 212);
    } catch {
      // fallback
    }
  }

  // Details
  ctx.fillStyle = '#64748B';
  ctx.font = '700 20px "Noto Sans Telugu", sans-serif';
  ctx.fillText('పూర్తి పేరు / Full Name:', 272, 196);
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 30px "Noto Sans Telugu", sans-serif';
  ctx.fillText(reporter.name, 272, 236);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 20px "Noto Sans Telugu", sans-serif';
  ctx.fillText('మొబైల్ నెంబర్ / Mobile Number:', 272, 290);
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 26px monospace';
  ctx.fillText(`+91 ${reporter.mobile}`, 272, 326);

  ctx.fillStyle = '#64748B';
  ctx.font = '700 20px "Noto Sans Telugu", sans-serif';
  ctx.fillText('చిరునామా / Mandal & District:', 272, 378);
  ctx.fillStyle = '#9A3412';
  ctx.font = '800 24px "Noto Sans Telugu", sans-serif';
  ctx.fillText(
    `${reporter.mandal} మండలం, ${reporter.district}, ${reporter.state}`,
    272,
    414
  );

  // Bottom 12-Digit Aadhaar Number
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(6, 456, 948, 138);
  ctx.fillStyle = '#0B1D3A';
  ctx.font = '900 46px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(formatFullAadhaar(reporter.aadhaarNumber), 480, 524);

  ctx.fillStyle = '#15803D';
  ctx.font = '700 18px "Noto Sans Telugu", sans-serif';
  ctx.fillText(
    'VERIFIED FOR NETI BHARATAM MANDAL REPORTER ACCREDITATION',
    480,
    568
  );

  triggerDataUrlDownload(
    canvas.toDataURL('image/png', 0.96),
    `NetiBharatam_Aadhaar_${safeSlug}.png`
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
