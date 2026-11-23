import { HandwritingFontId, InkColorId, PaperStyleId } from '../types';

export const FONT_FAMILIES: Record<HandwritingFontId, { label: string; css: string; canvasFont: string }> = {
  caveat: { label: 'Natural Cursive', css: '"Caveat", cursive', canvasFont: 'Caveat, cursive' },
  patrick: { label: 'Neat Print', css: '"Patrick Hand", cursive', canvasFont: '"Patrick Hand", cursive' },
  architect: { label: 'Architect', css: '"Architects Daughter", cursive', canvasFont: '"Architects Daughter", cursive' },
  kalam: { label: 'Fast Scribble', css: '"Kalam", cursive', canvasFont: 'Kalam, cursive' },
};

export const INK_COLORS: Record<InkColorId, { label: string; hex: string }> = {
  royal: { label: 'Royal Blue', hex: '#1E3A8A' },
  charcoal: { label: 'Obsidian Ink', hex: '#1F2937' },
  forest: { label: 'Forest Pen', hex: '#065F46' },
  plum: { label: 'Academic Plum', hex: '#701A75' },
  crimson: { label: 'Grading Red', hex: '#991B1B' },
};

export const PAPER_STYLES: Record<PaperStyleId, { label: string; bg: string; className: string }> = {
  ruled: { label: 'College Ruled', bg: '#FEFDFB', className: 'paper-ruled' },
  grid: { label: 'Engineering Grid', bg: '#FCFCFA', className: 'paper-grid' },
  dotted: { label: 'Bullet Dotted', bg: '#FDFCF8', className: 'paper-dotted' },
  parchment: { label: 'Warm Parchment', bg: '#F6EEDC', className: 'paper-parchment' },
  blank: { label: 'Clean Sheet', bg: '#FFFFFF', className: 'paper-blank' },
};

interface ExportOptions {
  text: string;
  font: HandwritingFontId;
  paper: PaperStyleId;
  ink: InkColorId;
  fontSize: number;
  lineSpacing: number;
  organicJitter: boolean;
  showMarginMarks: boolean;
  fileName?: string;
}

export async function exportHandwritingPng(opts: ExportOptions): Promise<void> {
  if (typeof document === 'undefined') return;
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const width = 1240;
  const height = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Paper Base
  ctx.fillStyle = PAPER_STYLES[opts.paper].bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Paper Texture / Ruling
  const lineStep = Math.round(opts.lineSpacing * 2);
  const topOffset = 140;

  if (opts.paper === 'ruled' || opts.paper === 'parchment') {
    ctx.strokeStyle = opts.paper === 'parchment' ? 'rgba(161, 130, 92, 0.25)' : 'rgba(147, 197, 253, 0.55)';
    ctx.lineWidth = 1.5;
    for (let y = topOffset; y < height - 60; y += lineStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    // Red vertical margin
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(165, 0);
    ctx.lineTo(165, height);
    ctx.stroke();

    // Binder punch holes
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = '#E5E1D8';
      ctx.beginPath();
      ctx.arc(54, 160 + i * 175, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (opts.paper === 'grid') {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1;
    const step = 42;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (opts.paper === 'dotted') {
    ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
    const step = 40;
    for (let x = 40; x < width - 20; x += step) {
      for (let y = 40; y < height - 20; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Optional Margin Annotations
  if (opts.showMarginMarks && (opts.paper === 'ruled' || opts.paper === 'parchment')) {
    ctx.save();
    ctx.translate(82, 270);
    ctx.rotate(-0.14);
    ctx.fillStyle = '#DC2626';
    ctx.font = `700 30px ${FONT_FAMILIES[opts.font].canvasFont}`;
    ctx.fillText('KEY!', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(78, 620);
    ctx.rotate(-0.18);
    ctx.fillStyle = '#D97706';
    ctx.font = `700 28px ${FONT_FAMILIES[opts.font].canvasFont}`;
    ctx.fillText('★ EXAM', 0, 0);
    ctx.restore();
  }

  // 4. Render Wrapped Text
  const leftMargin = opts.paper === 'ruled' || opts.paper === 'parchment' ? 195 : 100;
  const maxWidth = width - leftMargin - 85;
  const inkHex = INK_COLORS[opts.ink].hex;
  const baseFontSize = Math.round(opts.fontSize * 1.9);

  const rawLines = opts.text.split('\n');
  let cursorY = topOffset - 10;

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    if (cursorY > height - 90) break;

    if (raw.trim() === '') {
      cursorY += lineStep * 0.7;
      continue;
    }

    const isHeading = raw.startsWith('# ');
    const isNumbered = /^\d+\.\s/.test(raw);
    const isStar = raw.startsWith('* ');
    const displayStr = isHeading ? raw.replace(/^#\s+/, '') : raw;

    const size = isHeading ? Math.round(baseFontSize * 1.38) : isNumbered ? Math.round(baseFontSize * 1.12) : baseFontSize;
    const weight = isHeading || isNumbered ? '700' : '400';
    ctx.font = `${weight} ${size}px ${FONT_FAMILIES[opts.font].canvasFont}`;
    ctx.fillStyle = isStar ? '#B45309' : inkHex;

    // Word wrap
    const words = displayStr.split(' ');
    let currentLine = '';
    const wrapped: string[] = [];

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        wrapped.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) wrapped.push(currentLine);

    for (const line of wrapped) {
      if (cursorY > height - 90) break;
      ctx.save();
      const tilt = opts.organicJitter ? ((Math.sin(cursorY * 0.05) * 0.45) * Math.PI) / 180 : 0;
      const offsetX = opts.organicJitter ? Math.cos(cursorY * 0.1) * 3 : 0;
      ctx.translate(leftMargin + offsetX, cursorY);
      ctx.rotate(tilt);

      if (isHeading) {
        // Subtle highlighter stroke under heading
        const metrics = ctx.measureText(line);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.55)';
        ctx.fillRect(-4, -size * 0.25, Math.min(metrics.width + 8, maxWidth), size * 0.35);
        ctx.fillStyle = inkHex;
      }

      ctx.fillText(line, 0, 0);
      ctx.restore();
      cursorY += lineStep;
    }
  }

  // Trigger download
  const link = document.createElement('a');
  link.download = opts.fileName || 'scholarpulse-handwritten-notes.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
