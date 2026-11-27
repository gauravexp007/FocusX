import React, { useEffect, useRef, useState } from 'react';
import { BookItem, RibbonColorId } from '../types';
import { BookCoverArt } from './BookCoverArt';
import { gsap, prefersReducedMotion } from '../utils/gsapMotion';

export interface BookOpenRequest {
  book: BookItem;
  mode: 'cover' | 'bookmark';
  originRect?: { left: number; top: number; width: number; height: number };
}

interface InteractiveBookCoverProps {
  book: BookItem;
  onOpenBook: (req: BookOpenRequest) => void;
  className?: string;
}

const RIBBON_THEMES: Record<
  RibbonColorId,
  { bg: string; edge: string; stitch: string; text: string; glow: string }
> = {
  crimson: {
    bg: 'linear-gradient(180deg, #9F1239 0%, #BE123C 55%, #881337 100%)',
    edge: '#FDA4AF',
    stitch: 'rgba(253, 224, 71, 0.72)',
    text: '#FFF1F2',
    glow: 'rgba(190, 18, 60, 0.38)',
  },
  emerald: {
    bg: 'linear-gradient(180deg, #065F46 0%, #047857 55%, #064E3B 100%)',
    edge: '#6EE7B7',
    stitch: 'rgba(253, 224, 71, 0.75)',
    text: '#ECFDF5',
    glow: 'rgba(4, 120, 87, 0.36)',
  },
  gold: {
    bg: 'linear-gradient(180deg, #B45309 0%, #D97706 55%, #92400E 100%)',
    edge: '#FDE68A',
    stitch: 'rgba(255, 251, 235, 0.75)',
    text: '#FFFBEB',
    glow: 'rgba(217, 119, 6, 0.36)',
  },
  royal: {
    bg: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 55%, #1E40AF 100%)',
    edge: '#93C5FD',
    stitch: 'rgba(253, 224, 71, 0.72)',
    text: '#EFF6FF',
    glow: 'rgba(37, 99, 235, 0.36)',
  },
  plum: {
    bg: 'linear-gradient(180deg, #6B21A8 0%, #9333EA 55%, #581C87 100%)',
    edge: '#E9D5FF',
    stitch: 'rgba(253, 224, 71, 0.72)',
    text: '#FAF5FF',
    glow: 'rgba(147, 51, 234, 0.36)',
  },
};

function defaultRibbonForVariant(variant: BookItem['coverVariant']): RibbonColorId {
  switch (variant) {
    case 'kahneman':
      return 'crimson';
    case 'kleppmann':
      return 'gold';
    case 'newport':
      return 'emerald';
    case 'neuro':
      return 'plum';
    case 'algorithms':
      return 'royal';
    case 'macro':
      return 'emerald';
    case 'atomic':
      return 'crimson';
    default:
      return 'gold';
  }
}

export const InteractiveBookCover: React.FC<InteractiveBookCoverProps> = ({
  book,
  onOpenBook,
  className = 'w-24 h-36 sm:w-28 sm:h-40',
}) => {
  const coverShellRef = useRef<HTMLDivElement | null>(null);
  const ribbonRef = useRef<HTMLButtonElement | null>(null);
  const [pullProgress, setPullProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const dragStateRef = useRef<{
    active: boolean;
    startY: number;
    maxDy: number;
    pointerId: number;
  }>({ active: false, startY: 0, maxDy: 0, pointerId: -1 });

  const ribbonColor = book.ribbonColor || defaultRibbonForVariant(book.coverVariant);
  const theme = RIBBON_THEMES[ribbonColor];
  const lastReadPage = Math.max(1, book.currentPage || 1);
  const PULL_THRESHOLD = 28;
  const MAX_PULL = 56;

  // Subtle idle ribbon pendulum breath on mount (GSAP)
  useEffect(() => {
    const el = ribbonRef.current;
    if (!el || prefersReducedMotion()) return;
    const tween = gsap.to(el, {
      rotation: 2.2,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      transformOrigin: 'top center',
    });
    return () => {
      tween.kill();
    };
  }, []);

  const triggerOpenBookSequence = (mode: 'cover' | 'bookmark') => {
    if (isOpening) return;
    setIsOpening(true);

    const coverEl = coverShellRef.current;
    const ribbonEl = ribbonRef.current;
    const rect = coverEl?.getBoundingClientRect();
    const originRect = rect
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : undefined;

    if (prefersReducedMotion() || !coverEl || !ribbonEl) {
      setIsOpening(false);
      onOpenBook({ book, mode, originRect });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        onOpenBook({ book, mode, originRect });
        gsap.set([coverEl, ribbonEl], { clearProps: 'transform,opacity' });
        setPullProgress(0);
        setIsPulling(false);
        setIsOpening(false);
      },
    });

    if (mode === 'bookmark') {
      tl.to(ribbonEl, {
        y: 40,
        scaleY: 1.08,
        rotation: 0,
        duration: 0.2,
        ease: 'power2.out',
      }).to(
        coverEl,
        {
          x: -14,
          rotateY: -18,
          scale: 1.04,
          duration: 0.22,
          ease: 'power2.inOut',
          transformOrigin: 'left center',
        },
        '-=0.1'
      );
    } else {
      tl.to(coverEl, {
        scale: 1.06,
        y: -4,
        duration: 0.18,
        ease: 'power2.out',
      });
    }
  };

  const handleRibbonPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const ribbonEl = ribbonRef.current;
    if (!ribbonEl) return;

    ribbonEl.setPointerCapture(e.pointerId);
    gsap.killTweensOf(ribbonEl);
    dragStateRef.current = {
      active: true,
      startY: e.clientY,
      maxDy: 0,
      pointerId: e.pointerId,
    };
    setIsPulling(true);
  };

  const handleRibbonPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current.active) return;
    e.stopPropagation();

    const rawDy = Math.max(0, e.clientY - dragStateRef.current.startY);
    const dy = Math.min(MAX_PULL, rawDy);
    dragStateRef.current.maxDy = Math.max(dragStateRef.current.maxDy, dy);
    const progress = Math.min(1, dy / PULL_THRESHOLD);
    setPullProgress(progress);

    if (ribbonRef.current && !prefersReducedMotion()) {
      gsap.set(ribbonRef.current, {
        y: dy,
        rotation: (e.movementX || 0) * -0.18,
        scaleY: 1 + progress * 0.08,
      });
    }
    if (coverShellRef.current && !prefersReducedMotion()) {
      gsap.set(coverShellRef.current, {
        rotateY: -18 * progress,
        transformOrigin: 'left center',
      });
    }
  };

  const finishRibbonPull = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStateRef.current.active) return;
    e.stopPropagation();
    const { maxDy, startY } = dragStateRef.current;
    const endDy = Math.max(0, e.clientY - startY);
    dragStateRef.current.active = false;

    const ribbonEl = ribbonRef.current;
    if (ribbonEl && ribbonEl.hasPointerCapture(e.pointerId)) {
      ribbonEl.releasePointerCapture(e.pointerId);
    }

    // Simple click (< 8px drag) OR pulled past threshold (>= PULL_THRESHOLD) opens via bookmark cascade!
    if (maxDy < 8 || endDy >= PULL_THRESHOLD) {
      triggerOpenBookSequence('bookmark');
      return;
    }

    // Released before threshold -> elastic silk snap-back!
    setIsPulling(false);
    setPullProgress(0);
    if (ribbonEl && !prefersReducedMotion()) {
      gsap.to(ribbonEl, {
        y: 0,
        rotation: 0,
        scaleY: 1,
        duration: 0.65,
        ease: 'elastic.out(1.15, 0.42)',
      });
    }
    if (coverShellRef.current && !prefersReducedMotion()) {
      gsap.to(coverShellRef.current, {
        rotateY: 0,
        duration: 0.48,
        ease: 'power3.out',
      });
    }
  };

  const handleCoverHoverEnter = () => {
    if (isPulling || isOpening || prefersReducedMotion()) return;
    if (coverShellRef.current) {
      gsap.to(coverShellRef.current, {
        rotateY: -9,
        y: -2,
        duration: 0.32,
        ease: 'power3.out',
        transformOrigin: 'left center',
      });
    }
    if (ribbonRef.current) {
      gsap.to(ribbonRef.current, {
        y: 5,
        duration: 0.35,
        ease: 'back.out(2)',
      });
    }
  };

  const handleCoverHoverLeave = () => {
    if (isPulling || isOpening || prefersReducedMotion()) return;
    if (coverShellRef.current) {
      gsap.to(coverShellRef.current, {
        rotateY: 0,
        y: 0,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
    if (ribbonRef.current) {
      gsap.to(ribbonRef.current, {
        y: 0,
        duration: 0.45,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  };

  return (
    <div
      className="relative shrink-0 pb-10 pr-2 select-none group/book"
      onMouseEnter={handleCoverHoverEnter}
      onMouseLeave={handleCoverHoverLeave}
    >
      <div className="relative book-cover-3d">
        {/* Stacked cream page block peeking out right & bottom edges */}
        <div
          aria-hidden="true"
          className="absolute top-1 -right-1.5 bottom-0.5 w-2.5 rounded-r-md pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(90deg, #F8F3E8 0px, #F8F3E8 1.5px, #DDD3C0 1.5px, #DDD3C0 2.5px)',
            boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.18), 2px 3px 8px rgba(0,0,0,0.14)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute left-1.5 -bottom-1.5 right-0 h-2 rounded-b-md pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(180deg, #F5EFE2 0px, #F5EFE2 1.5px, #D6CBB8 1.5px, #D6CBB8 2.5px)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.16)',
          }}
        />

        {/* Unique Hanging Silk Ribbon Bookmark emerging from the bottom page block */}
        <button
          ref={ribbonRef}
          type="button"
          onPointerDown={handleRibbonPointerDown}
          onPointerMove={handleRibbonPointerMove}
          onPointerUp={finishRibbonPull}
          onPointerCancel={finishRibbonPull}
          title={`Pull or click ribbon to resume ${book.title} at page ${lastReadPage}`}
          aria-label={`Pull or click bookmark ribbon to open ${book.title} at page ${lastReadPage}`}
          style={{
            background: theme.bg,
            boxShadow: `0 6px 14px -3px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.28)`,
            touchAction: 'none',
          }}
          className="ribbon-swallowtail ribbon-silk-weave absolute right-3.5 -bottom-10 z-0 w-7 h-14 pt-3.5 pb-3 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[#A3265B] transition-shadow"
        >
          {/* Metallic gold stitch & eyelet */}
          <span
            aria-hidden="true"
            className="w-3.5 border-t border-dashed mb-1 opacity-80"
            style={{ borderColor: theme.stitch }}
          />
          <span
            className="font-mono text-[8.5px] font-bold leading-none tracking-tighter tabular-nums"
            style={{ color: theme.text }}
          >
            p.{lastReadPage}
          </span>
          {/* Tiny golden eyelet charm */}
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full mt-1 border"
            style={{ borderColor: theme.edge, backgroundColor: 'rgba(255,255,255,0.25)' }}
          />
        </button>

        {/* Interactive Pull / Click Cue Floating Pill */}
        <div
          className={`pointer-events-none absolute -bottom-11 left-0 z-20 transition-all duration-200 ${
            isPulling
              ? 'opacity-100 translate-y-1'
              : 'opacity-0 translate-y-0 group-hover/book:opacity-100'
          }`}
        >
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold bg-[#1F1A1E]/90 dark:bg-[#F5EFF3]/95 text-[#FFF8FB] dark:text-[#1F1A1E] shadow-sm">
            {pullProgress >= 1
              ? `Release → p.${lastReadPage}`
              : isPulling
                ? 'Pull down…'
                : `Pull ribbon · p.${lastReadPage}`}
          </span>
        </div>

        {/* Hardcover Front Cover (Click cover to open smoothly from center!) */}
        <div
          ref={coverShellRef}
          data-book-cover-id={book.id}
          onClick={() => triggerOpenBookSequence('cover')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerOpenBookSequence('cover');
            }
          }}
          aria-label={`Open ${book.title} at page ${lastReadPage}`}
          className="relative z-10 cursor-pointer rounded-lg overflow-hidden shadow-md ring-1 ring-black/10 dark:ring-white/10"
        >
          {book.coverImageUrl ? (
            <div className={`relative overflow-hidden bg-[#1F1A1E] ${className}`}>
              <img
                src={book.coverImageUrl}
                alt={`Cover of ${book.title}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Spine crease & subtle gloss */}
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/40 via-white/15 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-2 pt-5">
                <p className="text-[10px] font-bold text-white leading-tight line-clamp-2">
                  {book.title}
                </p>
              </div>
            </div>
          ) : (
            <BookCoverArt
              variant={book.coverVariant}
              title={book.title}
              author={book.author}
              className={className}
            />
          )}

          {/* Soft bookmark crease peek at bottom-right edge */}
          <div
            aria-hidden="true"
            className="absolute right-3.5 bottom-0 w-7 h-1.5 opacity-85 pointer-events-none"
            style={{ background: theme.bg }}
          />
        </div>
      </div>
    </div>
  );
};
