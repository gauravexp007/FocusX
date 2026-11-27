import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Printer,
  Save,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  HandwritingArtifact,
  HandwritingFontId,
  InkColorId,
  PaperStyleId,
} from '../types';
import {
  exportHandwritingPng,
  FONT_FAMILIES,
  INK_COLORS,
  PAPER_STYLES,
} from '../utils/handwritingExport';
import {
  FLOW_EASE,
  FLOW_SPRING,
  flowItem,
  staggerContainer,
} from './MotionPrimitives';

interface HandwritingStudioSectionProps {
  text: string;
  onChangeText: (text: string) => void;
  font: HandwritingFontId;
  onChangeFont: (font: HandwritingFontId) => void;
  paper: PaperStyleId;
  onChangePaper: (paper: PaperStyleId) => void;
  ink: InkColorId;
  onChangeInk: (ink: InkColorId) => void;
  artifacts: HandwritingArtifact[];
  onLoadArtifact: (art: HandwritingArtifact) => void;
  onSaveArtifact: (title: string, subject: string) => void;
  onNotify: (msg: string) => void;
}

export const HandwritingStudioSection: React.FC<HandwritingStudioSectionProps> = ({
  text,
  onChangeText,
  font,
  onChangeFont,
  paper,
  onChangePaper,
  ink,
  onChangeInk,
  artifacts,
  onLoadArtifact,
  onSaveArtifact,
  onNotify,
}) => {
  const [fontSize, setFontSize] = useState(22);
  const [lineSpacing, setLineSpacing] = useState(32);
  const [organicJitter, setOrganicJitter] = useState(true);
  const [showMarginMarks, setShowMarginMarks] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(true);
  const [fullscreenSheet, setFullscreenSheet] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const wordCount = useMemo(() => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [text]);

  const parsedLines = useMemo(() => text.split('\n'), [text]);

  const handleExportPng = async () => {
    setIsExporting(true);
    try {
      await exportHandwritingPng({
        text,
        font,
        paper,
        ink,
        fontSize,
        lineSpacing,
        organicJitter,
        showMarginMarks,
        fileName: 'focusx-handwritten-notes.png',
      });
      onNotify('Handwritten sheet exported as high-resolution PNG.');
    } catch {
      onNotify('Could not export PNG — please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveSheet = () => {
    const firstLine = parsedLines.find((l) => l.trim().length > 0) || 'Untitled Handwritten Sheet';
    const cleanTitle = firstLine.replace(/^#\s*/, '').slice(0, 48);
    onSaveArtifact(cleanTitle, 'FocusX Studio');
  };

  const showRedMargin = paper === 'ruled' || paper === 'parchment';

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Header Toolbar */}
      <motion.div variants={flowItem} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
            Text to Handwriting Studio
          </h1>
          <p className="text-sm text-[#574146] dark:text-[#B5A8B2] mt-1">
            Convert typed notes into realistic handwritten study sheets with custom pen styles, ink, and paper stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSaveSheet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold fx-card text-[#1F1A1E] dark:text-[#F5EFF3] hover:border-[#006948]/50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Save className="w-4 h-4 text-[#006948] dark:text-[#6EE7B7]" />
            Save Sheet
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExportPng}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFB9F9] hover:bg-[#F8A2F0] text-[#3B1837] dark:bg-[#F56498] dark:text-[#1A0814] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 shadow-xs"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Rendering...' : 'Download PNG'}
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#006948] hover:bg-[#00573B] text-white dark:bg-[#58CD9B] dark:text-[#072116] transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            Export PDF / Print
          </motion.button>
        </div>
      </motion.div>

      {/* Saved Templates Strip */}
      <motion.div variants={flowItem} className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-[#8A7177] dark:text-[#9D8F99] shrink-0 mr-1">
          Templates:
        </span>
        {artifacts.map((art) => (
          <motion.button
            key={art.id}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onLoadArtifact(art)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium fx-card text-[#1F1A1E] dark:text-[#F5EFF3] hover:border-[#A3265B] dark:hover:border-[#F56498] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#A3265B] dark:text-[#FFB1C6]" />
            {art.title}
          </motion.button>
        ))}
      </motion.div>

      {/* Main Split Workspace */}
      <motion.div variants={flowItem} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Editor & Style Controls (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <section className="fx-card rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#1F1A1E] dark:text-[#F5EFF3]">
                Typed Notes Input
              </h2>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettingsDrawer((s) => !s)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FCF1F6] dark:bg-[#25202D] text-[#574146] dark:text-[#C4B7C1] cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#A3265B] dark:text-[#FFB1C6]" />
                {showSettingsDrawer ? 'Hide Styling' : 'Show Styling'}
              </motion.button>
            </div>

            <textarea
              value={text}
              onChange={(e) => onChangeText(e.target.value)}
              rows={13}
              placeholder="# Lecture Title&#10;1. Main Section&#10;- Key bullet points..."
              className="w-full p-4 bg-[#FCF1F6] dark:bg-[#231E2B] border border-[#EAE0E5] dark:border-[#342D3E] rounded-xl font-mono text-xs leading-relaxed text-[#1F1A1E] dark:text-[#F5EFF3] outline-none focus:border-[#A3265B] resize-y"
            />

            <div className="flex items-center justify-between text-xs text-[#8A7177] dark:text-[#9D8F99] font-mono tabular-nums">
              <span>
                {wordCount} words · {parsedLines.length} lines
              </span>
              <span className="inline-flex items-center gap-1 text-[#006948] dark:text-[#6EE7B7] font-sans font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Live rendering active
              </span>
            </div>
          </section>

          <AnimatePresence initial={false}>
            {showSettingsDrawer && (
              <motion.section
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: FLOW_EASE }}
                className="fx-card rounded-2xl p-5 flex flex-col gap-4"
              >
                {/* Paper Style with shared layoutId */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                    Paper Style
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(PAPER_STYLES) as PaperStyleId[]).map((pId) => {
                      const active = paper === pId;
                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => onChangePaper(pId)}
                          className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? 'text-white dark:text-[#072116] font-semibold'
                              : 'bg-[#FCF1F6] dark:bg-[#25202D] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="hw-paper-pill"
                              transition={FLOW_SPRING}
                              className="absolute inset-0 rounded-lg bg-[#006948] dark:bg-[#58CD9B]"
                            />
                          )}
                          <span className="relative z-10">{PAPER_STYLES[pId].label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ink Color */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#574146] dark:text-[#C4B7C1]">
                    Fountain Pen Ink
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(INK_COLORS) as InkColorId[]).map((cId) => {
                      const active = ink === cId;
                      return (
                        <motion.button
                          key={cId}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onChangeInk(cId)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            active
                              ? 'border-[#A3265B] dark:border-[#F56498] bg-[#FCF1F6] dark:bg-[#291E2D] font-semibold text-[#1F1A1E] dark:text-[#F5EFF3]'
                              : 'border-[#EAE0E5] dark:border-[#342D3E] text-[#574146] dark:text-[#B5A8B2]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: INK_COLORS[cId].hex }}
                          />
                          {INK_COLORS[cId].label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#574146] dark:text-[#C4B7C1]">Ink Size</span>
                      <span className="font-mono tabular-nums text-[#8A7177]">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={30}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="accent-[#A3265B] dark:accent-[#F56498] cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#574146] dark:text-[#C4B7C1]">Line Height</span>
                      <span className="font-mono tabular-nums text-[#8A7177]">{lineSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={44}
                      value={lineSpacing}
                      onChange={(e) => setLineSpacing(Number(e.target.value))}
                      className="accent-[#006948] dark:accent-[#58CD9B] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-[#F0E5EB] dark:border-[#2B2533] text-xs">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-[#1F1A1E] dark:text-[#F5EFF3]">
                    <input
                      type="checkbox"
                      checked={organicJitter}
                      onChange={(e) => setOrganicJitter(e.target.checked)}
                      className="accent-[#A3265B] w-4 h-4 rounded cursor-pointer"
                    />
                    Natural handwriting tilt
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-[#1F1A1E] dark:text-[#F5EFF3]">
                    <input
                      type="checkbox"
                      checked={showMarginMarks}
                      onChange={(e) => setShowMarginMarks(e.target.checked)}
                      className="accent-[#006948] w-4 h-4 rounded cursor-pointer"
                    />
                    Study margin annotations
                  </label>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT PANE: Realistic Paper Sheet Preview (7 cols) */}
        <div
          className={
            fullscreenSheet
              ? 'fixed inset-0 z-50 bg-[#EDE7EB] dark:bg-[#121016] p-6 overflow-y-auto flex flex-col items-center gap-4'
              : 'xl:col-span-7 flex flex-col gap-4'
          }
        >
          {/* Handwriting Font Selector Bar */}
          <div className="w-full fx-card rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-[#574146] dark:text-[#B5A8B2] mr-1">
                Handwriting:
              </span>
              {(Object.keys(FONT_FAMILIES) as HandwritingFontId[]).map((fId) => {
                const active = font === fId;
                return (
                  <button
                    key={fId}
                    type="button"
                    onClick={() => onChangeFont(fId)}
                    style={{ fontFamily: FONT_FAMILIES[fId].css }}
                    className={`relative px-3 py-1 rounded-lg text-sm transition-colors cursor-pointer ${
                      active
                        ? 'text-white dark:text-[#072116] font-bold'
                        : 'bg-[#FCF1F6] dark:bg-[#25202D] text-[#574146] dark:text-[#C4B7C1] hover:text-[#1F1A1E] dark:hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="hw-font-pill"
                        transition={FLOW_SPRING}
                        className="absolute inset-0 rounded-lg bg-[#006948] dark:bg-[#58CD9B] shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{FONT_FAMILIES[fId].label}</span>
                  </button>
                );
              })}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setFullscreenSheet((f) => !f)}
              aria-label={fullscreenSheet ? 'Exit fullscreen preview' : 'Fullscreen preview'}
              className="p-1.5 rounded-lg text-[#574146] dark:text-[#C4B7C1] hover:bg-[#FCF1F6] dark:hover:bg-[#25202D] cursor-pointer"
            >
              {fullscreenSheet ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Paper Canvas Stage */}
          <div className="w-full rounded-2xl bg-[#EFE9EE]/90 dark:bg-[#16131C]/90 border border-[#EAE0E5] dark:border-[#2B2533] p-4 sm:p-8 flex justify-center overflow-x-auto">
            <motion.div
              key={`${paper}-${font}`}
              initial={{ opacity: 0.85, scale: 0.992 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: FLOW_EASE }}
              id="handwritten-printable-sheet"
              className={`relative w-full max-w-[660px] min-h-[780px] rounded-sm shadow-[0_20px_45px_-14px_rgba(20,25,35,0.22)] overflow-hidden transition-transform duration-300 ${
                PAPER_STYLES[paper].className
              } ${organicJitter ? '-rotate-[0.3deg] hover:rotate-0' : ''}`}
            >
              {showRedMargin && (
                <>
                  <div className="absolute left-3 top-10 flex flex-col gap-12 z-10 pointer-events-none">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full bg-[#E1DDD5] shadow-inner"
                      />
                    ))}
                  </div>
                  <div className="absolute left-16 sm:left-20 top-0 bottom-0 w-[1.5px] bg-[#F87171]/60 z-10 pointer-events-none" />
                </>
              )}

              {showMarginMarks && showRedMargin && (
                <div
                  className="hidden sm:flex flex-col items-center absolute left-4 top-28 text-[#DC2626] -rotate-12 select-none pointer-events-none z-20"
                  style={{ fontFamily: FONT_FAMILIES[font].css }}
                >
                  <span className="font-bold text-base leading-none">KEY!</span>
                  <span className="text-xs text-[#D97706]">★ ★</span>
                </div>
              )}

              {showMarginMarks && showRedMargin && (
                <div
                  className="hidden sm:block absolute left-5 top-[340px] text-[#DC2626] -rotate-12 font-bold text-sm select-none pointer-events-none z-20"
                  style={{ fontFamily: FONT_FAMILIES[font].css }}
                >
                  EXAM!!
                </div>
              )}

              <div
                className={`relative z-10 pt-12 pb-16 pr-7 sm:pr-10 ${
                  showRedMargin ? 'pl-20 sm:pl-24' : 'pl-8 sm:pl-12'
                }`}
                style={{
                  fontFamily: FONT_FAMILIES[font].css,
                  color: INK_COLORS[ink].hex,
                  fontSize: `${fontSize}px`,
                  lineHeight: `${lineSpacing}px`,
                  textShadow: '0 0 0.4px rgba(0,0,0,0.18)',
                }}
              >
                {parsedLines.map((line, index) => {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    return <div key={index} style={{ height: `${Math.round(lineSpacing * 0.6)}px` }} />;
                  }

                  const isHeading = trimmed.startsWith('# ');
                  const isSection = /^\d+\.\s/.test(trimmed);
                  const isCallout = trimmed.startsWith('* ');
                  const tiltDeg = organicJitter ? ((index % 3) - 1) * 0.35 : 0;

                  if (isHeading) {
                    return (
                      <h2
                        key={index}
                        className="font-bold tracking-tight mb-2 inline-block px-1.5 rounded-xs"
                        style={{
                          fontSize: `${Math.round(fontSize * 1.42)}px`,
                          lineHeight: `${Math.round(lineSpacing * 1.25)}px`,
                          transform: `rotate(${tiltDeg}deg)`,
                          backgroundColor: 'rgba(254, 240, 138, 0.55)',
                        }}
                      >
                        {trimmed.replace(/^#\s+/, '')}
                      </h2>
                    );
                  }

                  if (isSection) {
                    return (
                      <div
                        key={index}
                        className="font-bold underline decoration-current/40 mt-2"
                        style={{
                          fontSize: `${Math.round(fontSize * 1.15)}px`,
                          transform: `rotate(${tiltDeg}deg)`,
                        }}
                      >
                        {trimmed}
                      </div>
                    );
                  }

                  if (isCallout) {
                    return (
                      <div
                        key={index}
                        className="mt-3 font-bold text-[#B45309]"
                        style={{ transform: `rotate(${tiltDeg - 0.5}deg)` }}
                      >
                        ★ {trimmed.replace(/^\*\s+/, '')}
                      </div>
                    );
                  }

                  return (
                    <p
                      key={index}
                      style={{ transform: `rotate(${tiltDeg}deg)` }}
                      className="break-words"
                    >
                      {line}
                    </p>
                  );
                })}
              </div>

              <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-black/[0.08] to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
