import { Business } from '../types';

export type QrTheme = 'google-classic' | 'dark-luxe' | 'acrylic-minimal';

export interface QrCardOptions {
  theme?: QrTheme;
  whiteLabelText?: string;
}

const drawGoogleGLogo = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): Promise<void> => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>`;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
};

/**
 * Renders a high-resolution Google Review styled QR Standee Poster on an HTML Canvas.
 * Dynamically scales canvas height to match content exactly with ZERO excess blank space.
 */
export const generateStyledQrCardCanvas = async (
  business: Business,
  qrDataUrl: string,
  options: QrTheme | QrCardOptions = 'google-classic'
): Promise<string> => {
  const theme = typeof options === 'string' ? options : (options.theme || 'google-classic');
  const whiteLabelText = typeof options === 'object' ? (options.whiteLabelText || '') : '';

  const isDark = theme === 'dark-luxe';
  const isAcrylic = theme === 'acrylic-minimal';

  const width = 1000;
  const margin = 40;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 1450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return qrDataUrl;

  const cardW = width - margin * 2;
  const rx = 44;

  let currentY = margin + 65;

  // Header Badge
  await drawGoogleGLogo(ctx, width / 2 - 140, currentY, 44);

  ctx.textAlign = 'left';
  ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('Review us on Google', width / 2 - 105, currentY + 10);

  currentY += 52;

  // 5 Gold Stars
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('★ ★ ★ ★ ★', width / 2, currentY);

  currentY += 34;
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('VERIFIED 4.9 / 5.0 RATING', width / 2, currentY);

  currentY += 55;

  // Business Logo
  if (business.logo) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = business.logo;
      });

      const logoSize = 120;
      const logoX = width / 2 - logoSize / 2;
      const logoY = currentY;

      ctx.fillStyle = isDark ? '#0f172a' : '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(logoX - 10, logoY - 10, logoSize + 20, logoSize + 20, 24);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 20);
      ctx.clip();
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      currentY += logoSize + 42;
    } catch {
      currentY += 10;
    }
  } else {
    currentY += 10;
  }

  // Business Name
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = 'extrabold 44px sans-serif';

  const words = business.name.split(' ');
  let line = '';
  let lineY = currentY;
  const maxW = cardW - 100;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxW && n > 0) {
      ctx.fillText(line.trim(), width / 2, lineY);
      line = words[n] + ' ';
      lineY += 52;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), width / 2, lineY);
  currentY = lineY + 40;

  // Subtitle
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '500 26px sans-serif';
  ctx.fillText('Share Your Experience', width / 2, currentY);
  currentY += 50;

  // QR Code Framed Container
  const qrBoxSize = 420;
  const qrBoxX = width / 2 - qrBoxSize / 2;
  const qrBoxY = currentY;

  ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
  ctx.fill();

  ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw QR Image
  const qrImg = new Image();
  await new Promise((resolve) => {
    qrImg.onload = resolve;
    qrImg.src = qrDataUrl;
  });

  const qrInnerSize = 350;
  const qrInnerX = width / 2 - qrInnerSize / 2;
  const qrInnerY = qrBoxY + (qrBoxSize - qrInnerSize) / 2;
  ctx.drawImage(qrImg, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);

  currentY = qrBoxY + qrBoxSize + 35;

  // Contactless NFC Pill
  const pillW = 480;
  const pillH = 46;
  const pillX = width / 2 - pillW / 2;
  ctx.fillStyle = isDark ? '#334155' : '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(pillX, currentY, pillW, pillH, 23);
  ctx.fill();

  ctx.strokeStyle = isDark ? '#475569' : '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = isDark ? '#f8fafc' : '#334155';
  ctx.font = 'bold 19px sans-serif';
  ctx.fillText('TAP PHONE HERE OR SCAN QR CODE', width / 2, currentY + 30);

  currentY += 68;

  // 3-Step Process Ribbon
  const ribW = 680;
  const ribH = 68;
  const ribX = width / 2 - ribW / 2;

  ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(ribX, currentY, ribW, ribH, 20);
  ctx.fill();
  ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Vertical Divider Lines
  const colW = ribW / 3;
  ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(ribX + colW, currentY + 12);
  ctx.lineTo(ribX + colW, currentY + ribH - 12);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ribX + colW * 2, currentY + 12);
  ctx.lineTo(ribX + colW * 2, currentY + ribH - 12);
  ctx.stroke();

  const stepItems = [
    { num: '1', title: 'Scan Code' },
    { num: '2', title: 'Copy Text' },
    { num: '3', title: 'Post Google' },
  ];

  stepItems.forEach((item, idx) => {
    const cx = ribX + idx * colW + colW / 2;
    const circleRadius = 14;
    const circleX = cx - 50;
    const circleY = currentY + ribH / 2;

    ctx.fillStyle = '#4285F4';
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(item.num, circleX, circleY + 5);

    ctx.textAlign = 'left';
    ctx.fillStyle = isDark ? '#f8fafc' : '#1e293b';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText(item.title, circleX + 22, circleY + 6);
    ctx.textAlign = 'center';
  });

  currentY += ribH + 35;

  // White Labeling Footer Text
  const footerText = whiteLabelText.trim()
    ? `OFFICIAL VERIFIED LISTING • POWERED BY ${whiteLabelText.trim().toUpperCase()}`
    : 'OFFICIAL VERIFIED LISTING • WHITE LABEL FEEDBACK PORTAL';

  ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(footerText, width / 2, currentY);

  currentY += 35; // Final bottom padding before card border bottom

  // Calculate tight final heights
  const cardH = currentY - margin;
  const finalHeight = currentY + margin;

  // Now create the final perfectly cropped canvas
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;
  finalCanvas.height = finalHeight;
  const fCtx = finalCanvas.getContext('2d');
  if (!fCtx) return canvas.toDataURL('image/png');

  // Outer Canvas Background
  if (isDark) {
    const grad = fCtx.createLinearGradient(0, 0, width, finalHeight);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    fCtx.fillStyle = grad;
  } else if (isAcrylic) {
    const grad = fCtx.createLinearGradient(0, 0, width, finalHeight);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(1, '#f1f5f9');
    fCtx.fillStyle = grad;
  } else {
    fCtx.fillStyle = '#f8fafc';
  }
  fCtx.fillRect(0, 0, width, finalHeight);

  // Draw main card background
  fCtx.shadowColor = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(15, 23, 42, 0.08)';
  fCtx.shadowBlur = 30;
  fCtx.shadowOffsetY = 12;

  fCtx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  fCtx.beginPath();
  fCtx.roundRect(margin, margin, cardW, cardH, rx);
  fCtx.fill();

  fCtx.shadowBlur = 0;
  fCtx.shadowOffsetY = 0;

  // Copy drawn content from initial canvas onto final Canvas
  fCtx.drawImage(canvas, 0, 0);

  // Draw Card Border Stroke
  fCtx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
  fCtx.lineWidth = 2.5;
  fCtx.beginPath();
  fCtx.roundRect(margin, margin, cardW, cardH, rx);
  fCtx.stroke();

  // Draw Top & Bottom 4-Color Google Stripe Accents
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
  const segmentW = cardW / 4;
  const topStripeH = 12;
  const bottomStripeH = 12;

  fCtx.save();
  fCtx.beginPath();
  fCtx.roundRect(margin, margin, cardW, cardH, rx);
  fCtx.clip();

  colors.forEach((c, idx) => {
    // Top stripe
    fCtx.fillStyle = c;
    fCtx.fillRect(margin + idx * segmentW, margin, segmentW, topStripeH);
    // Bottom stripe flush at card bottom
    fCtx.fillRect(margin + idx * segmentW, margin + cardH - bottomStripeH, segmentW, bottomStripeH);
  });
  fCtx.restore();

  return finalCanvas.toDataURL('image/png');
};
