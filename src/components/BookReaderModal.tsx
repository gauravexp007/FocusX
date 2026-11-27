import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  ArrowRight,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Circle,
  Eraser,
  Hand,
  Highlighter,
  Layers,
  Maximize2,
  MessageSquareQuote,
  Minus,
  PenTool,
  Pencil,
  Play,
  Redo2,
  Shapes,
  Smile,
  Square,
  Star,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import {
  BookAnnotationStore,
  BookContentPage,
  BookHighlight,
  BookItem,
  PageAnnotationData,
  PageBookmarkMeta,
  PdfTextLineBox,
  ReaderTool,
  RibbonColorId,
  ShapeKind,
  StickerKind,
} from '../types';
import { getBuiltinBookPage } from '../data/builtinBookPages';
import {
  extractPdfPageTextLines,
  loadBookAnnotations,
  loadUploadedBookData,
  openPdfDocumentFromBuffer,
  renderPdfPageToDataUrl,
  saveBookAnnotations,
  StoredUploadedBook,
} from '../utils/bookStorage';
import {
  computeDualSpreadCurl,
  CurlCorner,
  CurlDirection,
  getOriginCorner,
  getTargetCorner,
  SPINE_X,
  SPREAD_H,
  SPREAD_W,
  Vec2,
} from '../utils/pageCurlMath';
import { ReaderAnnotationLayer, STICKER_CATALOG, StickerGraphic } from './ReaderAnnotationLayer';
import { BookCoverArt } from './BookCoverArt';
import { FocusXMark } from './MotionPrimitives';
import { gsap, GsapSplitHeading, prefersReducedMotion } from '../utils/gsapMotion';

type PaperThemeId = 'cream' | 'crisp' | 'sepia' | 'midnight';

interface BookReaderModalProps {
  book: BookItem;
  openMode?: 'cover' | 'bookmark';
  originRect?: { left: number; top: number; width: number; height: number };
  onClose: () => void;
  onSyncBookState: (
    bookId: string,
    patch: { currentPage: number; bookmarkedPages: number[]; ribbonColor?: RibbonColorId }
  ) => void;
  onAddHighlight: (hl: Omit<BookHighlight, 'id'>) => void;
  onStartReadingSession: (bookTitle: string) => void;
}

const EMPTY_PAGE_ANNOTATIONS: PageAnnotationData = {
  strokes: [],
  highlights: [],
  shapes: [],
  stickers: [],
};

const HIGHLIGHTER_COLORS = ['#FDE047', '#86EFAC', '#F9A8D4', '#7DD3FC', '#FDBA74'];
const INK_COLORS = ['#1E293B', '#1D4ED8', '#047857', '#BE123C', '#7E22CE'];
const PENCIL_COLORS = ['#475569', '#64748B', '#78350F', '#1E3A8A', '#065F46'];

const RIBBON_COLOR_STYLES: Record<RibbonColorId, { bg: string; label: string; dot: string }> = {
  crimson: {
    bg: 'linear-gradient(180deg, #9F1239 0%, #BE123C 55%, #881337 100%)',
    label: 'Crimson Silk',
    dot: '#BE123C',
  },
  emerald: {
    bg: 'linear-gradient(180deg, #065F46 0%, #047857 55%, #064E3B 100%)',
    label: 'Emerald Silk',
    dot: '#047857',
  },
  gold: {
    bg: 'linear-gradient(180deg, #B45309 0%, #D97706 55%, #92400E 100%)',
    label: 'Amber Gold',
    dot: '#D97706',
  },
  royal: {
    bg: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 55%, #1E40AF 100%)',
    label: 'Royal Cobalt',
    dot: '#2563EB',
  },
  plum: {
    bg: 'linear-gradient(180deg, #6B21A8 0%, #9333EA 55%, #581C87 100%)',
    label: 'Velvet Plum',
    dot: '#9333EA',
  },
};

const SHAPE_OPTIONS: Array<{ id: ShapeKind; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'rect', label: 'Box', icon: Square },
  { id: 'ellipse', label: 'Circle', icon: Circle },
  { id: 'arrow', label: 'Arrow', icon: ArrowRight },
  { id: 'line', label: 'Line', icon: Minus },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'callout', label: 'Callout', icon: MessageSquareQuote },
];

/** Align any page number to an odd left-page start so spreads are crisp (1-2, 3-4, ..., 323-324) */
function toSpreadLeft(page: number, totalPages: number): number {
  const clamped = Math.max(1, Math.min(totalPages, page || 1));
  if (totalPages <= 1) return 1;
  const odd = clamped % 2 === 1 ? clamped : clamped - 1;
  return Math.max(1, odd);
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  book,
  openMode = 'cover',
  originRect,
  onClose,
  onSyncBookState,
  onAddHighlight,
  onStartReadingSession,
}) => {
  const modalRootRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const dockRef = useRef<HTMLElement | null>(null);
  const stageBoxRef = useRef<HTMLDivElement | null>(null);
  const book3dWrapperRef = useRef<HTMLDivElement | null>(null);
  const frontCoverDoorRef = useRef<HTMLDivElement | null>(null);
  const openingPageLeafRef = useRef<HTMLDivElement | null>(null);
  const leftCasingBgRef = useRef<HTMLDivElement | null>(null);
  const leftLeafStaticRef = useRef<HTMLDivElement | null>(null);
  const spreadViewportRef = useRef<HTMLDivElement | null>(null);
  const ribbonDropRef = useRef<HTMLDivElement | null>(null);

  // Lifecycle phase: opening -> open -> closing
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  const closingStartedRef = useRef(false);
  const userHasNavigatedRef = useRef(false);

  // Full-Size Pure Reading Mode + Auto-Disappearing Top-Right Corner Cross
  const [fullReadingView, setFullReadingView] = useState(false);
  const [fullViewCrossVisible, setFullViewCrossVisible] = useState(true);
  const crossHideTimerRef = useRef<number | null>(null);

  const revealFullViewCross = useCallback(() => {
    setFullViewCrossVisible(true);
    if (crossHideTimerRef.current) {
      window.clearTimeout(crossHideTimerRef.current);
    }
    crossHideTimerRef.current = window.setTimeout(() => {
      setFullViewCrossVisible(false);
    }, 1850);
  }, []);

  useEffect(() => {
    if (!fullReadingView) {
      setFullViewCrossVisible(true);
      if (crossHideTimerRef.current) window.clearTimeout(crossHideTimerRef.current);
      return;
    }
    revealFullViewCross();
    const onActivity = () => revealFullViewCross();
    window.addEventListener('pointermove', onActivity, { passive: true });
    window.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onActivity);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      if (crossHideTimerRef.current) window.clearTimeout(crossHideTimerRef.current);
    };
  }, [fullReadingView, revealFullViewCross]);

  // Exact largest 420:297 dual-A4 box that fits cleanly centered inside the live stage on EVERY screen size
  const [bookBoxPx, setBookBoxPx] = useState<{ w: number; h: number }>(() => {
    const ratio = SPREAD_W / SPREAD_H;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const maxW = Math.min(1060, Math.max(320, vw - 120));
    const maxH = Math.min(720, Math.max(300, vh - 190));
    let h = maxH;
    let w = h * ratio;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    return { w: Math.round(w), h: Math.round(h) };
  });

  useLayoutEffect(() => {
    const stage = stageBoxRef.current;
    if (!stage) return;
    const ratio = SPREAD_W / SPREAD_H;
    const fitBookToStage = () => {
      const availW = stage.clientWidth;
      const availH = stage.clientHeight;
      if (availW < 40 || availH < 40) return;
      let h = availH;
      let w = h * ratio;
      if (w > availW) {
        w = availW;
        h = w / ratio;
      }
      setBookBoxPx((prev) => {
        const nw = Math.round(w);
        const nh = Math.round(h);
        return prev.w === nw && prev.h === nh ? prev : { w: nw, h: nh };
      });
    };
    fitBookToStage();
    const ro = new ResizeObserver(fitBookToStage);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [fullReadingView]);

  // Measure UNTRANSFORMED layout CSS single-page A4 dimensions (immune to GSAP 3D scale/rotateY transforms!)
  const [singlePagePx, setSinglePagePx] = useState<{ w: number; h: number }>({ w: 420, h: 594 });

  useEffect(() => {
    const el = spreadViewportRef.current;
    if (!el) return;
    const updateSize = () => {
      const w = el.clientWidth / 2;
      const h = el.clientHeight;
      if (w > 20 && h > 20) {
        setSinglePagePx({ w, h });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullReadingView, phase, bookBoxPx]);

  // Target page vs active spread start (bookmark mode starts at Page 1 and smoothly turns through pages!)
  const initialTargetPageRef = useRef<number>(Math.max(1, Math.min(book.totalPages, book.currentPage || 1)));
  const initialTargetSpreadLeft = toSpreadLeft(initialTargetPageRef.current, book.totalPages);
  const initialShouldCascadeRef = useRef<boolean>(
    openMode === 'bookmark' && initialTargetSpreadLeft > 1 && !prefersReducedMotion()
  );
  const initialOpenModeRef = useRef(openMode);
  const initialOriginRectRef = useRef(originRect);

  const [spreadLeft, setSpreadLeft] = useState<number>(
    initialShouldCascadeRef.current ? 1 : initialTargetSpreadLeft
  );
  const spreadRight = spreadLeft + 1 <= book.totalPages ? spreadLeft + 1 : null;

  // Cascade status indicator when flipping through pages toward a bookmarked page
  const [cascadeStatus, setCascadeStatus] = useState<{ active: boolean; targetPage: number } | null>(null);
  const cascadeCancelledRef = useRef(false);

  // Uploaded book content (PDF or paginated text from IndexedDB)
  const [uploadedRecord, setUploadedRecord] = useState<StoredUploadedBook | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfImages, setPdfImages] = useState<Record<number, string>>({});
  const [pdfTextLines, setPdfTextLines] = useState<Record<number, PdfTextLineBox[]>>({});
  const pdfLoadingPagesRef = useRef<Set<number>>(new Set());

  // Paper theme & drawers
  const [paperTheme, setPaperTheme] = useState<PaperThemeId>('cream');
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [ribbonColor, setRibbonColor] = useState<RibbonColorId>(book.ribbonColor || 'crimson');

  // Annotation studio state
  const [activeTool, setActiveTool] = useState<ReaderTool>('flip');
  const [highlighterColor, setHighlighterColor] = useState(HIGHLIGHTER_COLORS[0]);
  const [penColor, setPenColor] = useState(INK_COLORS[1]);
  const [pencilColor, setPencilColor] = useState(PENCIL_COLORS[0]);
  const [shapeColor, setShapeColor] = useState(INK_COLORS[3]);
  const [strokeSize, setStrokeSize] = useState<number>(3);
  const [activeShapeKind, setActiveShapeKind] = useState<ShapeKind>('arrow');
  const [shapeFilled, setShapeFilled] = useState<boolean>(true);
  const [activeStickerKind, setActiveStickerKind] = useState<StickerKind>('star');

  // Annotations & Bookmarks store with Undo / Redo history
  const [store, setStore] = useState<BookAnnotationStore>({ pages: {}, bookmarks: {} });
  const [undoStack, setUndoStack] = useState<BookAnnotationStore[]>([]);
  const [redoStack, setRedoStack] = useState<BookAnnotationStore[]>([]);
  const [storeLoaded, setStoreLoaded] = useState(false);

  // Realistic Dual-Spread Diagonal Paper Curl State
  const [curlState, setCurlState] = useState<{
    active: boolean;
    corner: CurlCorner;
    point: Vec2;
    isHoverPeek?: boolean;
    /** Optional custom destination left page for multi-page bookmark cascade turns */
    overrideTargetLeft?: number;
  }>({
    active: false,
    corner: 'bottom-right',
    point: { x: SPREAD_W, y: SPREAD_H },
  });

  const dragCurlRef = useRef<{
    dragging: boolean;
    corner: CurlCorner;
    direction: CurlDirection;
    startClientX: number;
    lastClientX: number;
    lastTime: number;
    velocityX: number;
    currentPt: Vec2;
    pointerId: number;
  }>({
    dragging: false,
    corner: 'bottom-right',
    direction: 'next',
    startClientX: 0,
    lastClientX: 0,
    lastTime: 0,
    velocityX: 0,
    currentPt: { x: SPREAD_W, y: SPREAD_H },
    pointerId: -1,
  });
  const curlTweenRef = useRef<gsap.core.Tween | null>(null);

  const canTurnNext = spreadLeft + 2 <= book.totalPages;
  const canTurnPrev = spreadLeft > 1;

  // Smooth multi-page turning cascade (e.g., Page 1 -> ... -> Bookmarked Page 324!)
  const runPageTurnCascade = useCallback(
    (fromLeft: number, toPage: number) => {
      const destLeft = toSpreadLeft(toPage, book.totalPages);
      if (destLeft === fromLeft) return;
      if (prefersReducedMotion()) {
        setSpreadLeft(destLeft);
        return;
      }

      cascadeCancelledRef.current = false;
      curlTweenRef.current?.kill();

      const direction: CurlDirection = destLeft > fromLeft ? 'next' : 'prev';
      const corner: CurlCorner = direction === 'next' ? 'bottom-right' : 'bottom-left';
      const spreadDiff = Math.abs(destLeft - fromLeft) / 2;
      // 3 to 6 crisp overlapping physical paper turns stepping smoothly to exact destination!
      const steps = Math.max(1, Math.min(6, Math.ceil(spreadDiff)));

      const waypoints: number[] = [];
      for (let i = 1; i <= steps; i++) {
        if (i === steps) {
          waypoints.push(destLeft);
        } else {
          const frac = i / steps;
          const interp = Math.round(fromLeft + (destLeft - fromLeft) * frac);
          const aligned = toSpreadLeft(interp, book.totalPages);
          waypoints.push(aligned);
        }
      }

      setCascadeStatus({ active: true, targetPage: toPage });

      let stepIdx = 0;
      const playNextTurn = () => {
        if (cascadeCancelledRef.current || closingStartedRef.current) {
          setCascadeStatus(null);
          setCurlState({ active: false, corner: 'bottom-right', point: { x: SPREAD_W, y: SPREAD_H } });
          return;
        }
        if (stepIdx >= waypoints.length) {
          setCascadeStatus(null);
          // Drop bookmark silk ribbon softly on arrival!
          requestAnimationFrame(() => {
            if (ribbonDropRef.current && !prefersReducedMotion()) {
              gsap.fromTo(
                ribbonDropRef.current,
                { y: -64, scaleY: 0.65, rotation: -4 },
                { y: 0, scaleY: 1, rotation: 0, duration: 0.68, ease: 'elastic.out(1.05, 0.45)' }
              );
            }
          });
          return;
        }

        const nextLeft = waypoints[stepIdx];
        const isFirst = stepIdx === 0;
        const isLast = stepIdx === waypoints.length - 1;
        // Rhythmic speed: smooth start -> brisk middle pages -> graceful settling final turn!
        const duration = isLast ? 0.48 : isFirst ? 0.34 : 0.24;
        const originPt = getOriginCorner(corner);
        const targetPt = getTargetCorner(corner);
        const startPt: Vec2 =
          direction === 'next'
            ? { x: originPt.x - 16, y: originPt.y - 12 }
            : { x: originPt.x + 16, y: originPt.y - 12 };

        const anim = { t: 0 };
        setCurlState({
          active: true,
          corner,
          point: startPt,
          overrideTargetLeft: nextLeft,
        });

        curlTweenRef.current = gsap.to(anim, {
          t: 1,
          duration,
          ease: isLast ? 'power3.out' : 'power2.inOut',
          onUpdate: () => {
            const t = anim.t;
            const x = startPt.x + (targetPt.x - startPt.x) * t;
            const y = startPt.y + (targetPt.y - startPt.y) * t - Math.sin(t * Math.PI) * 56;
            setCurlState({
              active: true,
              corner,
              point: { x, y },
              overrideTargetLeft: nextLeft,
            });
          },
          onComplete: () => {
            setSpreadLeft(nextLeft);
            setCurlState({ active: false, corner: 'bottom-right', point: { x: SPREAD_W, y: SPREAD_H } });
            stepIdx += 1;
            playNextTurn();
          },
        });
      };

      playNextTurn();
    },
    [book.totalPages]
  );

  const runPageTurnCascadeRef = useRef(runPageTurnCascade);
  runPageTurnCascadeRef.current = runPageTurnCascade;

  // Helper: locate the book's exact live shelf cover DOMRect for flying from / returning back to its shelf slot
  const getShelfAnchorRect = useCallback(() => {
    const liveCoverEl = document.querySelector<HTMLElement>(`[data-book-cover-id="${book.id}"]`);
    if (liveCoverEl) {
      const r = liveCoverEl.getBoundingClientRect();
      if (r.width > 10 && r.height > 10) {
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      }
    }
    return initialOriginRectRef.current;
  }, [book.id]);

  // Exact 0.00px closed-book-to-shelf transform solver:
  // Because the closed front cover occupies the RIGHT HALF [W/2..W] of `wrapper` and `xPercent: -25`
  // shifts by -W/4 in unscaled pixels while `scaleX` scales local center (+W/4, 0) around (0, 0),
  // solving `stageCx + tx - W/4 + sx * (W/4) = shelfCx` aligns the closed hardcover DEAD-ON its shelf cover!
  const computeShelfClosedTransform = useCallback(
    (wrapper: HTMLDivElement, shelfRect?: { left: number; top: number; width: number; height: number }) => {
      const stageRect = stageBoxRef.current?.getBoundingClientRect();
      const stageCx = stageRect ? stageRect.left + stageRect.width / 2 : window.innerWidth / 2;
      const stageCy = stageRect ? stageRect.top + stageRect.height / 2 : window.innerHeight / 2;
      const W = wrapper.offsetWidth || bookBoxPx.w;
      const H = wrapper.offsetHeight || bookBoxPx.h;

      if (!shelfRect) {
        return { x: 0, y: 40, scaleX: 0.34, scaleY: 0.34 };
      }

      const shelfCx = shelfRect.left + shelfRect.width / 2;
      const shelfCy = shelfRect.top + shelfRect.height / 2;
      const sx = Math.max(0.12, Math.min(0.95, shelfRect.width / Math.max(80, W / 2)));
      const sy = Math.max(0.12, Math.min(0.95, shelfRect.height / Math.max(100, H)));

      const tx = shelfCx - stageCx + (1 - sx) * (W / 4);
      const ty = shelfCy - stageCy;

      return { x: tx, y: ty, scaleX: sx, scaleY: sy };
    },
    [bookBoxPx.h, bookBoxPx.w]
  );

  // 1. PROPER BOOK OPENING ANIMATION ONLY:
  //    Step 1: Single closed book glides from its exact shelf cover spot to screen center (or from side on bookmark click)
  //    Step 2: First, ONLY the single front cover flips open (0° -> -180°) as the open book centers
  //    Step 3: Then the opening page flips smoothly over onto the left side (and cascades in bookmark mode)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase('open');
      return;
    }

    const backdrop = backdropRef.current;
    const header = headerRef.current;
    const dock = dockRef.current;
    const wrapper = book3dWrapperRef.current;
    const coverDoor = frontCoverDoorRef.current;
    const openingLeaf = openingPageLeafRef.current;
    const leftCasing = leftCasingBgRef.current;
    const leftLeaf = leftLeafStaticRef.current;
    const mode = initialOpenModeRef.current;
    const shelfRect = getShelfAnchorRect();

    if (!wrapper || !coverDoor) {
      setPhase('open');
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setPhase('open');
          if (initialShouldCascadeRef.current) {
            runPageTurnCascadeRef.current(1, initialTargetPageRef.current);
          }
        },
      });

      // Compute exact starting coordinates matching the book's live shelf cover (0.00px offset!)
      const W = wrapper.offsetWidth || bookBoxPx.w;
      let startPose = computeShelfClosedTransform(wrapper, shelfRect);
      if (mode === 'bookmark') {
        const s = 0.68;
        startPose = {
          x: -Math.min(440, window.innerWidth * 0.34) + (1 - s) * (W / 4),
          y: 6,
          scaleX: s,
          scaleY: s,
        };
      }

      // Initial state: ONLY the single closed book is visible (left casing + left leaf hidden!)
      if (backdrop) gsap.set(backdrop, { opacity: 0 });
      if (header) gsap.set(header, { opacity: 0, y: -12 });
      if (dock) gsap.set(dock, { opacity: 0, y: 18 });
      if (leftCasing) gsap.set(leftCasing, { opacity: 0 });
      if (leftLeaf) gsap.set(leftLeaf, { opacity: 0 });

      // Shift wrapper by xPercent: -25 so the right-half closed book aligns dead-center at x=0, scale=1!
      gsap.set(wrapper, {
        x: startPose.x,
        y: startPose.y,
        xPercent: -25,
        scaleX: startPose.scaleX,
        scaleY: startPose.scaleY,
        rotateY: 0,
        rotateX: 0,
        opacity: 0.96,
        transformOrigin: '50% 50%',
        transformPerspective: 2200,
      });
      gsap.set(coverDoor, {
        rotateY: 0,
        opacity: 1,
        transformOrigin: 'left center',
      });
      if (openingLeaf) {
        gsap.set(openingLeaf, {
          rotateY: 0,
          opacity: 1,
          transformOrigin: 'left center',
        });
      }

      // STEP 1: Backdrop fades in & single closed book glides cleanly from its exact shelf spot to screen center
      if (backdrop) {
        tl.to(backdrop, { opacity: 1, duration: 0.42, ease: 'power2.out' }, 0);
      }
      tl.to(
        wrapper,
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          duration: mode === 'bookmark' ? 0.52 : 0.48,
          ease: 'power3.out',
        },
        0.02
      );

      // STEP 2: First, ONLY the single front cover flips smoothly open (0° -> -180°) as the open book centers
      tl.to(
        wrapper,
        {
          xPercent: 0,
          duration: 0.62,
          ease: 'power3.inOut',
        },
        '+=0.04'
      ).to(
        coverDoor,
        {
          rotateY: -180,
          duration: 0.62,
          ease: 'power3.inOut',
        },
        '<'
      );

      // Reveal the left hardcover board cleanly once the single cover crosses 90° and lands flat on the left
      if (leftCasing) {
        tl.to(leftCasing, { opacity: 1, duration: 0.2, ease: 'power1.out' }, '-=0.22');
      }

      // Drop the opened front cover behind the page stack so Step 3's opening page flips cleanly ON TOP of it!
      tl.set(coverDoor, { zIndex: 5 });

      // STEP 3: Then the opening page flips smoothly over from right to left to open the reading spread!
      if (openingLeaf) {
        tl.to(
          openingLeaf,
          {
            rotateY: -180,
            duration: 0.56,
            ease: 'power2.inOut',
          },
          '+=0.03'
        );
      }

      if (leftLeaf) {
        tl.to(
          leftLeaf,
          {
            opacity: 1,
            duration: 0.12,
            ease: 'power1.out',
          },
          '-=0.1'
        );
      }

      // Fade in studio header & bottom dock smoothly as the spread settles
      if (header) {
        tl.to(header, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }, '-=0.22');
      }
      if (dock) {
        tl.to(dock, { opacity: 1, y: 0, duration: 0.34, ease: 'power2.out' }, '-=0.24');
      }
    }, modalRootRef);

    return () => {
      cascadeCancelledRef.current = true;
      ctx.revert();
    };
    // Run strictly once on initial modal mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. PROPER BOOK CLOSING ANIMATION:
  //    Step 1: Book closes smoothly from the left side (left cover & left pages fold smoothly onto right)
  //    Step 2: Closed single book glides with 0.00px accuracy directly back to its exact place on the bookshelf!
  const handleAnimatedClose = useCallback(() => {
    if (closingStartedRef.current) return;
    closingStartedRef.current = true;
    cascadeCancelledRef.current = true;
    curlTweenRef.current?.kill();

    if (prefersReducedMotion()) {
      onClose();
      return;
    }

    setPhase('closing');
    setFullReadingView(false);
    setShowBookmarksDrawer(false);
    setShowQuoteModal(false);
    setCascadeStatus(null);

    requestAnimationFrame(() => {
      const wrapper = book3dWrapperRef.current;
      const coverDoor = frontCoverDoorRef.current;
      const leftCasing = leftCasingBgRef.current;
      const leftLeaf = leftLeafStaticRef.current;
      const header = headerRef.current;
      const dock = dockRef.current;
      const backdrop = backdropRef.current;

      if (!wrapper || !coverDoor) {
        onClose();
        return;
      }

      gsap.killTweensOf([wrapper, coverDoor, leftCasing, leftLeaf, header, dock, backdrop]);

      // Start the front cover lying open on the LEFT side (-180°) ready to swing closed smoothly!
      gsap.set(coverDoor, {
        opacity: 1,
        zIndex: 50,
        rotateY: -180,
        transformOrigin: 'left center',
      });
      if (leftLeaf) gsap.set(leftLeaf, { transformOrigin: 'right center' });
      if (leftCasing) gsap.set(leftCasing, { transformOrigin: 'right center' });

      // Exact pixel-accurate destination pose right on top of the live shelf book cover!
      const shelfRect = getShelfAnchorRect();
      const destPose = computeShelfClosedTransform(wrapper, shelfRect);

      const tl = gsap.timeline({
        onComplete: () => {
          onClose();
        },
      });

      // Fade out header & bottom dock first
      if (header) tl.to(header, { opacity: 0, y: -12, duration: 0.2, ease: 'power2.in' }, 0);
      if (dock) tl.to(dock, { opacity: 0, y: 16, duration: 0.2, ease: 'power2.in' }, 0);

      // STEP 1: Close smoothly from the LEFT side (left pages + left cover swing gracefully shut over right)
      if (leftLeaf) {
        tl.to(
          leftLeaf,
          {
            rotateY: 92,
            opacity: 0,
            duration: 0.32,
            ease: 'power2.in',
          },
          0.06
        );
      }
      if (leftCasing) {
        tl.to(
          leftCasing,
          {
            rotateY: 92,
            opacity: 0,
            duration: 0.32,
            ease: 'power2.in',
          },
          0.06
        );
      }

      tl.to(
        coverDoor,
        {
          rotateY: 0,
          duration: 0.58,
          ease: 'power3.inOut',
        },
        0.06
      ).to(
        wrapper,
        {
          xPercent: -25,
          duration: 0.58,
          ease: 'power3.inOut',
        },
        0.06
      );

      // STEP 2: Closed single book glides with exact pixel alignment directly back onto its shelf slot!
      tl.to(
        wrapper,
        {
          x: destPose.x,
          y: destPose.y,
          scaleX: destPose.scaleX,
          scaleY: destPose.scaleY,
          duration: 0.5,
          ease: 'power3.inOut',
        },
        '+=0.02'
      ).to(
        wrapper,
        {
          opacity: 0,
          duration: 0.14,
          ease: 'power1.in',
        },
        '-=0.1'
      );

      if (backdrop) {
        tl.to(backdrop, { opacity: 0, duration: 0.44, ease: 'power2.inOut' }, '-=0.46');
      }
    });
  }, [computeShelfClosedTransform, getShelfAnchorRect, onClose]);

  // Load uploaded book data (PDF or Text) & annotations from IndexedDB
  useEffect(() => {
    let cancelled = false;
    let openedPdf: PDFDocumentProxy | null = null;

    const loadAll = async () => {
      const [annot, uploaded] = await Promise.all([
        loadBookAnnotations(book.id),
        book.sourceType && book.sourceType !== 'builtin' ? loadUploadedBookData(book.id) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      const mergedBookmarks = { ...annot.bookmarks };
      if (book.bookmarkedPages) {
        for (const p of book.bookmarkedPages) {
          if (!mergedBookmarks[p]) {
            mergedBookmarks[p] = {
              page: p,
              label: `Saved Page ${p}`,
              color: book.ribbonColor || 'crimson',
              createdAt: 'Saved',
            };
          }
        }
      }
      setStore({ pages: annot.pages || {}, bookmarks: mergedBookmarks });
      setStoreLoaded(true);

      if (uploaded) {
        setUploadedRecord(uploaded);
        if (uploaded.sourceType === 'pdf' && uploaded.pdfBuffer) {
          try {
            openedPdf = await openPdfDocumentFromBuffer(uploaded.pdfBuffer);
            if (!cancelled) {
              setPdfDoc(openedPdf);
            }
          } catch {
            // graceful fallback
          }
        }
      }
    };

    loadAll();
    return () => {
      cancelled = true;
      openedPdf?.cleanup();
    };
  }, [book.id, book.sourceType, book.bookmarkedPages, book.ribbonColor]);

  // Render visible & neighboring PDF pages + extract real PDF text line boxes for straight highlighting
  useEffect(() => {
    if (!pdfDoc) return;
    const pagesToEnsure = [
      spreadLeft - 2,
      spreadLeft - 1,
      spreadLeft,
      spreadLeft + 1,
      spreadLeft + 2,
      spreadLeft + 3,
    ].filter((p) => p >= 1 && p <= pdfDoc.numPages);

    pagesToEnsure.forEach(async (p) => {
      if (pdfImages[p] || pdfLoadingPagesRef.current.has(p)) return;
      pdfLoadingPagesRef.current.add(p);
      try {
        const [url, lines] = await Promise.all([
          renderPdfPageToDataUrl(pdfDoc, p, 1.5),
          extractPdfPageTextLines(pdfDoc, p),
        ]);
        if (url) {
          setPdfImages((prev) => ({ ...prev, [p]: url }));
        }
        if (lines.length > 0) {
          setPdfTextLines((prev) => ({ ...prev, [p]: lines }));
        }
      } finally {
        pdfLoadingPagesRef.current.delete(p);
      }
    });
  }, [pdfDoc, spreadLeft, pdfImages]);

  // Persist annotations & sync reading progress back to bookshelf (only once cascade isn't mid-flight)
  useEffect(() => {
    if (!storeLoaded) return;
    saveBookAnnotations(book.id, store);
  }, [book.id, store, storeLoaded]);

  useEffect(() => {
    if (phase !== 'open' || cascadeStatus?.active) return;
    const bookmarkList = Object.keys(store.bookmarks)
      .map(Number)
      .sort((a, b) => a - b);
    const accuratePageRead = userHasNavigatedRef.current
      ? spreadRight || spreadLeft
      : initialTargetPageRef.current;
    onSyncBookState(book.id, {
      currentPage: accuratePageRead,
      bookmarkedPages: bookmarkList,
      ribbonColor,
    });
  }, [book.id, spreadLeft, spreadRight, store.bookmarks, ribbonColor, onSyncBookState, phase, cascadeStatus]);

  const currentToolColor =
    activeTool === 'highlighter'
      ? highlighterColor
      : activeTool === 'pen'
        ? penColor
        : activeTool === 'pencil'
          ? pencilColor
          : shapeColor;

  const setCurrentToolColor = (c: string) => {
    if (activeTool === 'highlighter') setHighlighterColor(c);
    else if (activeTool === 'pen') setPenColor(c);
    else if (activeTool === 'pencil') setPencilColor(c);
    else setShapeColor(c);
  };

  const activeColorSwatches =
    activeTool === 'highlighter'
      ? HIGHLIGHTER_COLORS
      : activeTool === 'pencil'
        ? PENCIL_COLORS
        : INK_COLORS;

  const updatePageAnnotations = useCallback((pageNumber: number, next: PageAnnotationData) => {
    setStore((prev) => {
      setUndoStack((u) => [...u.slice(-24), prev]);
      setRedoStack([]);
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageNumber]: next,
        },
      };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedoStack((r) => [...r, store]);
      setStore(last);
      return prev.slice(0, -1);
    });
  }, [store]);

  const handleRedo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[prev.length - 1];
      setUndoStack((u) => [...u, store]);
      setStore(next);
      return prev.slice(0, -1);
    });
  }, [store]);

  const handleClearCurrentSpread = () => {
    const targets = spreadRight ? [spreadLeft, spreadRight] : [spreadLeft];
    setStore((prev) => {
      setUndoStack((u) => [...u.slice(-24), prev]);
      setRedoStack([]);
      const nextPages = { ...prev.pages };
      targets.forEach((p) => {
        nextPages[p] = { strokes: [], highlights: [], shapes: [], stickers: [] };
      });
      return { ...prev, pages: nextPages };
    });
  };

  const activeBookmarkTargetPage = spreadRight || spreadLeft;
  const isCurrentBookmarked = Boolean(store.bookmarks[spreadLeft] || (spreadRight && store.bookmarks[spreadRight]));

  const toggleBookmarkOnPage = useCallback(
    (targetPage: number) => {
      setStore((prev) => {
        const nextBookmarks = { ...prev.bookmarks };
        if (nextBookmarks[targetPage]) {
          delete nextBookmarks[targetPage];
        } else {
          nextBookmarks[targetPage] = {
            page: targetPage,
            label: `Page ${targetPage} Bookmark`,
            color: ribbonColor,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          requestAnimationFrame(() => {
            if (ribbonDropRef.current && !prefersReducedMotion()) {
              gsap.fromTo(
                ribbonDropRef.current,
                { y: -74, scaleY: 0.6, rotation: -5 },
                { y: 0, scaleY: 1, rotation: 0, duration: 0.72, ease: 'elastic.out(1.05, 0.45)' }
              );
            }
          });
        }
        return { ...prev, bookmarks: nextBookmarks };
      });
    },
    [ribbonColor]
  );

  const updateBookmarkLabel = (page: number, label: string) => {
    setStore((prev) => {
      const existing = prev.bookmarks[page];
      if (!existing) return prev;
      return {
        ...prev,
        bookmarks: {
          ...prev.bookmarks,
          [page]: { ...existing, label },
        },
      };
    });
  };

  // GSAP Realistic Parabolic Dual-Spread Curl Turn (single spread forward or backward)
  const animateSingleSpreadCurl = useCallback(
    (corner: CurlCorner, fromPt: Vec2, complete: boolean) => {
      const direction: CurlDirection = corner === 'bottom-right' || corner === 'top-right' ? 'next' : 'prev';
      if (direction === 'next' && !canTurnNext && complete) return;
      if (direction === 'prev' && !canTurnPrev && complete) return;

      curlTweenRef.current?.kill();

      if (prefersReducedMotion()) {
        setCurlState({ active: false, corner: 'bottom-right', point: { x: SPREAD_W, y: SPREAD_H } });
        if (complete) {
          userHasNavigatedRef.current = true;
          setSpreadLeft((p) => (direction === 'next' ? Math.min(book.totalPages, p + 2) : Math.max(1, p - 2)));
        }
        return;
      }

      const originPt = getOriginCorner(corner);
      const targetPt = complete ? getTargetCorner(corner) : originPt;
      const distRatio = Math.max(0.24, Math.min(1, Math.abs(targetPt.x - fromPt.x) / SPREAD_W));
      const isBottom = corner === 'bottom-right' || corner === 'bottom-left';
      const liftArc = isBottom ? -54 : 54;

      const anim = { t: 0 };
      setCurlState({ active: true, corner, point: fromPt });

      curlTweenRef.current = gsap.to(anim, {
        t: 1,
        duration: complete ? Math.max(0.32, distRatio * 0.62) : Math.max(0.24, distRatio * 0.42),
        ease: complete ? 'power3.out' : 'power2.out',
        onUpdate: () => {
          const t = anim.t;
          const x = fromPt.x + (targetPt.x - fromPt.x) * t;
          const y = fromPt.y + (targetPt.y - fromPt.y) * t + Math.sin(t * Math.PI) * liftArc * distRatio;
          setCurlState({ active: true, corner, point: { x, y } });
        },
        onComplete: () => {
          setCurlState({ active: false, corner: 'bottom-right', point: { x: SPREAD_W, y: SPREAD_H } });
          if (complete) {
            userHasNavigatedRef.current = true;
            setSpreadLeft((p) => (direction === 'next' ? Math.min(book.totalPages, p + 2) : Math.max(1, p - 2)));
          }
        },
      });
    },
    [book.totalPages, canTurnNext, canTurnPrev]
  );

  // Tactile GSAP Hover Corner Peel on Both Left & Right Corners
  const triggerCornerHoverPeek = (corner: CurlCorner | 'none') => {
    if (dragCurlRef.current.dragging || phase !== 'open' || cascadeStatus?.active) return;

    if (corner === 'none') {
      if (curlState.isHoverPeek) {
        curlTweenRef.current?.kill();
        const origin = getOriginCorner(curlState.corner);
        const anim = { x: curlState.point.x, y: curlState.point.y };
        curlTweenRef.current = gsap.to(anim, {
          x: origin.x,
          y: origin.y,
          duration: 0.26,
          ease: 'power2.out',
          onUpdate: () =>
            setCurlState({
              active: true,
              corner: curlState.corner,
              point: { x: anim.x, y: anim.y },
              isHoverPeek: true,
            }),
          onComplete: () =>
            setCurlState({ active: false, corner: 'bottom-right', point: { x: SPREAD_W, y: SPREAD_H } }),
        });
      }
      return;
    }

    const dir: CurlDirection = corner === 'bottom-right' || corner === 'top-right' ? 'next' : 'prev';
    if ((dir === 'next' && !canTurnNext) || (dir === 'prev' && !canTurnPrev)) return;
    if (curlState.active && !curlState.isHoverPeek) return;

    curlTweenRef.current?.kill();
    const origin = getOriginCorner(corner);
    const peekX = dir === 'next' ? origin.x - 44 : origin.x + 44;
    const peekY = corner.startsWith('bottom') ? origin.y - 32 : origin.y + 32;
    const anim = { x: origin.x, y: origin.y };

    curlTweenRef.current = gsap.to(anim, {
      x: peekX,
      y: peekY,
      duration: 0.34,
      ease: 'power3.out',
      onUpdate: () =>
        setCurlState({
          active: true,
          corner,
          point: { x: anim.x, y: anim.y },
          isHoverPeek: true,
        }),
    });
  };

  const clientToSpread = (clientX: number, clientY: number): Vec2 => {
    const rect = spreadViewportRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: SPREAD_W, y: SPREAD_H };
    return {
      x: ((clientX - rect.left) / rect.width) * SPREAD_W,
      y: ((clientY - rect.top) / rect.height) * SPREAD_H,
    };
  };

  // Real-Time 2D Hold & Move Dual-Spread Curl Drag Handlers
  const beginCurlDrag = (e: React.PointerEvent<HTMLElement>, corner: CurlCorner) => {
    if (phase !== 'open' || cascadeStatus?.active) return;
    const direction: CurlDirection = corner === 'bottom-right' || corner === 'top-right' ? 'next' : 'prev';
    if (direction === 'next' && !canTurnNext) return;
    if (direction === 'prev' && !canTurnPrev) return;

    e.stopPropagation();
    curlTweenRef.current?.kill();
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = clientToSpread(e.clientX, e.clientY);
    const startPt: Vec2 = {
      x: direction === 'next' ? Math.min(SPREAD_W - 14, pt.x) : Math.max(14, pt.x),
      y: corner.startsWith('bottom') ? Math.min(SPREAD_H - 10, pt.y) : Math.max(10, pt.y),
    };

    dragCurlRef.current = {
      dragging: true,
      corner,
      direction,
      startClientX: e.clientX,
      lastClientX: e.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      currentPt: startPt,
      pointerId: e.pointerId,
    };

    setCurlState({ active: true, corner, point: startPt, isHoverPeek: false });
  };

  const moveCurlDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragCurlRef.current.dragging) return;
    e.stopPropagation();

    const pt = clientToSpread(e.clientX, e.clientY);
    const now = performance.now();
    const dt = Math.max(8, now - dragCurlRef.current.lastTime);
    const vx = (e.clientX - dragCurlRef.current.lastClientX) / dt;

    const clampedPt: Vec2 = {
      x: Math.max(2, Math.min(SPREAD_W - 2, pt.x)),
      y: Math.max(-30, Math.min(SPREAD_H + 30, pt.y)),
    };

    dragCurlRef.current.lastClientX = e.clientX;
    dragCurlRef.current.lastTime = now;
    dragCurlRef.current.velocityX = vx;
    dragCurlRef.current.currentPt = clampedPt;

    setCurlState({
      active: true,
      corner: dragCurlRef.current.corner,
      point: clampedPt,
      isHoverPeek: false,
    });
  };

  const endCurlDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragCurlRef.current.dragging) return;
    e.stopPropagation();

    const { corner, direction, currentPt, velocityX, startClientX } = dragCurlRef.current;
    dragCurlRef.current.dragging = false;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const totalMoved = Math.abs(e.clientX - startClientX);
    const shouldComplete =
      direction === 'next'
        ? totalMoved < 8 || currentPt.x < SPINE_X + 36 || velocityX < -0.35
        : totalMoved < 8 || currentPt.x > SPINE_X - 36 || velocityX > 0.35;

    animateSingleSpreadCurl(corner, currentPt, shouldComplete);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'Escape') {
        if (fullReadingView) {
          setFullReadingView(false);
        } else {
          handleAnimatedClose();
        }
      } else if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setFullReadingView((v) => !v);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (canTurnNext && !curlState.active && phase === 'open') {
          animateSingleSpreadCurl('bottom-right', { x: SPREAD_W - 24, y: SPREAD_H - 18 }, true);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (canTurnPrev && !curlState.active && phase === 'open') {
          animateSingleSpreadCurl('bottom-left', { x: 24, y: SPREAD_H - 18 }, true);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (e.key.toLowerCase() === 'b' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleBookmarkOnPage(activeBookmarkTargetPage);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeBookmarkTargetPage,
    animateSingleSpreadCurl,
    canTurnNext,
    canTurnPrev,
    curlState.active,
    fullReadingView,
    handleAnimatedClose,
    handleRedo,
    handleUndo,
    phase,
    toggleBookmarkOnPage,
  ]);

  // Resolve content for any page number
  const resolvePageContent = useCallback(
    (pageNum: number): { kind: 'pdf'; imageUrl?: string } | { kind: 'text'; page: BookContentPage } => {
      if (uploadedRecord?.sourceType === 'pdf') {
        return { kind: 'pdf', imageUrl: pdfImages[pageNum] };
      }
      if (uploadedRecord?.pages && uploadedRecord.pages.length > 0) {
        const idx = Math.max(0, Math.min(uploadedRecord.pages.length - 1, pageNum - 1));
        return { kind: 'text', page: uploadedRecord.pages[idx] };
      }
      return { kind: 'text', page: getBuiltinBookPage(book, pageNum) };
    },
    [book, pdfImages, uploadedRecord]
  );

  const paperClass =
    paperTheme === 'cream'
      ? 'reader-paper-cream'
      : paperTheme === 'crisp'
        ? 'reader-paper-crisp'
        : paperTheme === 'sepia'
          ? 'reader-paper-sepia'
          : 'reader-paper-midnight';
  const isDarkPaper = paperTheme === 'midnight';

  // Compute live perpendicular-bisector dual-spread curl geometry
  const curlGeom = useMemo(() => {
    if (!curlState.active) return null;
    return computeDualSpreadCurl(curlState.point, curlState.corner);
  }, [curlState]);

  // Determine revealed underlying page & folded reverse page during a turn
  const curlDestinationLeft = useMemo(() => {
    if (!curlGeom) return spreadLeft;
    if (curlState.overrideTargetLeft) return curlState.overrideTargetLeft;
    return curlGeom.direction === 'next'
      ? Math.min(book.totalPages, spreadLeft + 2)
      : Math.max(1, spreadLeft - 2);
  }, [book.totalPages, curlGeom, curlState.overrideTargetLeft, spreadLeft]);

  const underNextRightPage =
    curlGeom?.direction === 'next'
      ? curlDestinationLeft + 1 <= book.totalPages
        ? curlDestinationLeft + 1
        : null
      : null;
  const underPrevLeftPage = curlGeom?.direction === 'prev' ? curlDestinationLeft : null;
  const flapBackPageNum =
    curlGeom?.direction === 'next'
      ? curlDestinationLeft
      : curlGeom?.direction === 'prev'
        ? curlDestinationLeft + 1 <= book.totalPages
          ? curlDestinationLeft + 1
          : null
        : null;

  // Render an individual vertical A4 page surface (left or right side of the open spread)
  const renderA4PageSurface = (pageNum: number | null, side: 'left' | 'right', interactive = true) => {
    if (!pageNum || pageNum < 1 || pageNum > book.totalPages) {
      return (
        <div
          className={`relative w-full h-full ${paperClass} flex flex-col items-center justify-center p-8 text-center select-none ${
            side === 'left'
              ? 'shadow-[inset_-18px_0_26px_-18px_rgba(0,0,0,0.22)]'
              : 'shadow-[inset_18px_0_26px_-18px_rgba(0,0,0,0.22)]'
          }`}
        >
          <span className="text-xs uppercase tracking-widest opacity-40">
            {pageNum && pageNum > book.totalPages ? 'End of Volume' : book.title}
          </span>
        </div>
      );
    }

    const content = resolvePageContent(pageNum);
    const pageAnnots = store.pages[pageNum] || EMPTY_PAGE_ANNOTATIONS;
    const bookmarkMeta = store.bookmarks[pageNum];

    return (
      <div
        className={`relative w-full h-full overflow-hidden select-none ${paperClass} ${
          side === 'left'
            ? 'shadow-[inset_-18px_0_28px_-18px_rgba(0,0,0,0.24)]'
            : 'shadow-[inset_18px_0_28px_-18px_rgba(0,0,0,0.24)]'
        }`}
      >
        {/* In-Book Hanging Silk Bookmark Ribbon if bookmarked */}
        {bookmarkMeta && (
          <div
            ref={interactive ? ribbonDropRef : undefined}
            style={{
              background: RIBBON_COLOR_STYLES[bookmarkMeta.color || ribbonColor].bg,
            }}
            className={`ribbon-swallowtail ribbon-silk-weave absolute top-0 ${
              side === 'left' ? 'left-6' : 'right-6'
            } z-30 w-7 h-20 pt-2 pb-4 flex flex-col items-center justify-start shadow-md pointer-events-none`}
          >
            <span className="w-3.5 border-t border-dashed border-amber-200/75 mb-1.5" />
            <span className="text-[8.5px] font-bold text-white/95 tracking-tight tabular-nums">
              p.{pageNum}
            </span>
          </div>
        )}

        {/* Page Content (PDF or Vertical A4 Lexend Editorial Layout) */}
        {content.kind === 'pdf' ? (
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-3">
            {content.imageUrl ? (
              <img
                src={content.imageUrl}
                alt={`${book.title} page ${pageNum}`}
                referrerPolicy="no-referrer"
                draggable={false}
                className={`w-full h-full object-contain rounded-xs ${
                  isDarkPaper ? 'invert-[0.88] hue-rotate-180 contrast-95' : ''
                }`}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-xs opacity-60">
                <div className="w-7 h-7 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <span>Rendering page {pageNum}…</span>
              </div>
            )}
          </div>
        ) : (
          (() => {
            // Height-proportional A4 typography so EVERY paragraph & footer folio fits comfortably with zero bottom clipping!
            const pageH = Math.max(320, singlePagePx.h || bookBoxPx.h);
            const tScale = Math.max(0.7, Math.min(1.06, pageH / 640));
            const padX = Math.round(28 * tScale);
            const padY = Math.round(20 * tScale);
            const headingPx = Number((15 * tScale).toFixed(2));
            const bodyPx = Number((11.6 * tScale).toFixed(2));
            const quotePx = Number((10.6 * tScale).toFixed(2));
            const metaPx = Number((9.5 * tScale).toFixed(2));
            const paraGap = Math.round(8.5 * tScale);

            return (
              <div
                data-book-text-scope
                style={{ padding: `${padY}px ${padX}px` }}
                className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden"
              >
                {/* Pinned Running A4 Header */}
                <div
                  style={{ fontSize: `${metaPx}px`, paddingBottom: `${Math.round(7 * tScale)}px`, marginBottom: `${Math.round(10 * tScale)}px` }}
                  className="shrink-0 flex items-center justify-between font-medium tracking-wide opacity-55 border-b border-current/12"
                >
                  <span className="truncate max-w-[74%]">{content.page.chapter || book.title}</span>
                  <span className="tabular-nums font-semibold">p. {pageNum}</span>
                </div>

                {/* Flexible Body Region (fits comfortably on every screen; gracefully scrollable for extra-dense uploaded files) */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {content.page.heading && (
                    <h2
                      style={{ fontSize: `${headingPx}px`, marginBottom: `${Math.round(9 * tScale)}px` }}
                      className="font-semibold leading-snug tracking-tight"
                    >
                      {content.page.heading}
                    </h2>
                  )}

                  <div
                    style={{ fontSize: `${bodyPx}px`, gap: `${paraGap}px` }}
                    className="flex flex-col leading-[1.54] font-normal"
                  >
                    {content.page.paragraphs.map((para, i) => (
                      <p key={i} className={i === 0 && pageNum === 1 ? 'font-medium opacity-90' : 'opacity-90'}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {content.page.calloutQuote && (
                    <blockquote
                      style={{
                        fontSize: `${quotePx}px`,
                        marginTop: `${Math.round(11 * tScale)}px`,
                        padding: `${Math.round(8 * tScale)}px ${Math.round(11 * tScale)}px`,
                      }}
                      className="rounded-xl bg-current/[0.04] border border-current/12 italic leading-relaxed opacity-85"
                    >
                      “{content.page.calloutQuote}”
                    </blockquote>
                  )}
                </div>

                {/* Pinned A4 Footer Folio (ALWAYS cleanly visible at bottom of every page!) */}
                <div
                  style={{ fontSize: `${metaPx}px`, paddingTop: `${Math.round(7 * tScale)}px`, marginTop: `${Math.round(8 * tScale)}px` }}
                  className="shrink-0 flex items-center justify-between opacity-55 border-t border-current/12 tabular-nums"
                >
                  <span className="truncate max-w-[65%]">{side === 'left' ? pageNum : book.author}</span>
                  <span className="font-medium">
                    {side === 'right' ? pageNum : `${Math.round((pageNum / book.totalPages) * 100)}%`}
                  </span>
                </div>
              </div>
            );
          })()
        )}

        {/* Per-Page Interactive Annotation Layer (Straight Text-Only Highlighter + Pen + Pencil + Shapes + Stickers) */}
        <ReaderAnnotationLayer
          pageNumber={pageNum}
          annotations={pageAnnots}
          pdfTextLines={pdfTextLines[pageNum]}
          activeTool={fullReadingView ? 'flip' : activeTool}
          activeColor={currentToolColor}
          strokeSize={strokeSize}
          activeShapeKind={activeShapeKind}
          shapeFilled={shapeFilled}
          activeStickerKind={activeStickerKind}
          isDarkPaper={isDarkPaper}
          interactive={interactive && !curlState.active && phase === 'open' && !fullReadingView}
          onUpdatePageAnnotations={updatePageAnnotations}
        />
      </div>
    );
  };

  const sortedBookmarks: PageBookmarkMeta[] = useMemo(
    () => Object.values(store.bookmarks).sort((a, b) => a.page - b.page),
    [store.bookmarks]
  );

  const handleSaveHighlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;
    onAddHighlight({
      bookTitle: book.title,
      page: activeBookmarkTargetPage,
      quote: quoteText.trim(),
      note: quoteNote.trim() || undefined,
      createdAt: 'Just now',
    });
    setQuoteText('');
    setQuoteNote('');
    setShowQuoteModal(false);
  };

  // Untransformed layout CSS pixel dimensions for 0.00px-exact diagonal curl reflection
  const liveSinglePageW = spreadViewportRef.current?.clientWidth
    ? spreadViewportRef.current.clientWidth / 2
    : singlePagePx.w;
  const liveSinglePageH = spreadViewportRef.current?.clientHeight || singlePagePx.h;

  return (
    <div
      ref={modalRootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Reading ${book.title}`}
      className="fixed inset-0 z-50 flex flex-col text-[#F5EFF3] overflow-hidden"
    >
      {/* Complete Fade-In / Fade-Out Ambient Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[#120E19]/94 backdrop-blur-xl pointer-events-none"
      />

      {/* Full-Size Pure Reading Mode: Auto-Disappearing Cross (`×`) at Top-Right Corner */}
      {fullReadingView && (
        <button
          type="button"
          onClick={() => setFullReadingView(false)}
          onMouseEnter={() => setFullViewCrossVisible(true)}
          aria-label="Exit full-size reading view"
          title="Exit Full View (Esc)"
          className={`fixed top-5 right-5 z-50 w-10 h-10 rounded-full bg-white/12 hover:bg-white/24 border border-white/20 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
            fullViewCrossVisible
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-90 pointer-events-none'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Top Studio Header Bar (smoothly hidden during Full-Size Pure Reading View) */}
      {!fullReadingView && (
        <header
          ref={headerRef}
          className="relative z-20 shrink-0 h-14 px-3 sm:px-5 border-b border-white/10 bg-[#1B1622]/90 flex items-center justify-between gap-3 transition-opacity duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleAnimatedClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-xs font-semibold text-[#F5EFF3] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              Close Book
            </button>
            <div className="min-w-0 hidden sm:block">
              <GsapSplitHeading
                as="h2"
                text={book.title}
                className="text-sm font-semibold text-white truncate leading-tight"
              />
              <p className="text-[11px] text-[#B5A8B2] truncate tabular-nums">
                {book.author} · Dual A4 Spread · {spreadRight ? `Pages ${spreadLeft}–${spreadRight}` : `Page ${spreadLeft}`} of {book.totalPages}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Paper Theme Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-white/6 rounded-xl p-1 border border-white/8">
              {(
                [
                  { id: 'cream', dot: '#FBF6EB', label: 'Warm Cream' },
                  { id: 'crisp', dot: '#FFFFFF', label: 'Crisp White' },
                  { id: 'sepia', dot: '#F3E6CF', label: 'Sepia' },
                  { id: 'midnight', dot: '#181622', label: 'Midnight Ink' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPaperTheme(t.id)}
                  title={t.label}
                  aria-label={`Paper theme: ${t.label}`}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform cursor-pointer ${
                    paperTheme === t.id ? 'ring-2 ring-[#6EE7B7] scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: t.dot }}
                  />
                </button>
              ))}
            </div>

            {/* Full-Size Pure Reading View Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowBookmarksDrawer(false);
                setFullReadingView(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/18 text-xs font-semibold text-[#F5EFF3] transition-colors cursor-pointer whitespace-nowrap"
              title="Pure Full-Size Reading View (F)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#6EE7B7]" />
              <span className="hidden sm:inline">Full View</span>
            </button>

            <button
              type="button"
              onClick={() => toggleBookmarkOnPage(activeBookmarkTargetPage)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isCurrentBookmarked
                  ? 'bg-[#BE123C] text-white shadow-sm'
                  : 'bg-white/8 hover:bg-white/15 text-[#F5EFF3]'
              }`}
              title="Pin silk ribbon bookmark on this spread (B)"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isCurrentBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBookmarksDrawer((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-xs font-semibold text-[#F5EFF3] cursor-pointer whitespace-nowrap tabular-nums"
              title="View all bookmarks & silk ribbon color"
            >
              <Layers className="w-3.5 h-3.5 text-[#6EE7B7]" />
              <span>{sortedBookmarks.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/8 hover:bg-white/15 text-xs font-semibold text-[#F5EFF3] cursor-pointer whitespace-nowrap"
              title="Save a quote to Reading Highlights"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#FFB9F9]" />
              <span className="hidden lg:inline">Save Quote</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onStartReadingSession(book.title);
              }}
              className="hidden xl:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#006948] hover:bg-[#05825A] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Focus Timer
            </button>

            <button
              type="button"
              onClick={handleAnimatedClose}
              aria-label="Close book reader"
              className="p-1.5 rounded-xl bg-white/8 hover:bg-white/16 text-[#F5EFF3] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* Main 3D Open Dual-Spread Vertical A4 Book Stage */}
      <div
        className={`relative z-10 flex-1 min-h-0 flex items-center justify-center overflow-hidden transition-all duration-300 ${
          fullReadingView ? 'px-3 sm:px-6 py-4' : 'px-3 sm:px-6 py-3'
        }`}
      >
        {/* Ambient Desk Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 62% 62% at 50% 48%, rgba(255, 185, 249, 0.11), transparent 68%), radial-gradient(ellipse 42% 45% at 30% 65%, rgba(110, 231, 183, 0.08), transparent 65%)',
          }}
        />

        {/* Subtle Cascade Caption when auto-flipping pages to a bookmarked page */}
        {cascadeStatus?.active && (
          <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-[#1B1622]/90 border border-white/15 text-xs font-medium text-[#6EE7B7] shadow-lg backdrop-blur-md tabular-nums">
            Turning pages to bookmark · Page {cascadeStatus.targetPage}
          </div>
        )}

        {/* Quick Left Turn Chevron (hidden in pure full view when idle so reading is ultra clean) */}
        <button
          type="button"
          disabled={!canTurnPrev || curlState.active || phase !== 'open'}
          onClick={() => animateSingleSpreadCurl('bottom-left', { x: 24, y: SPREAD_H - 18 }, true)}
          aria-label="Previous spread"
          className={`hidden md:flex z-30 mr-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/22 disabled:opacity-20 items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
            fullReadingView && !fullViewCrossVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* 3D Dual-Spread Vertical A4 Hardcover Container (420 : 297 = Two Side-by-Side Vertical A4 Sheets!) */}
        <div
          ref={stageBoxRef}
          className={`book-stage-3d relative w-full h-full flex items-center justify-center ${
            fullReadingView ? 'max-h-[92vh] max-w-[94vw]' : 'max-h-[720px] max-w-[1060px]'
          }`}
        >
          <div
            ref={book3dWrapperRef}
            style={{
              width: `${bookBoxPx.w}px`,
              height: `${bookBoxPx.h}px`,
              transformStyle: 'preserve-3d',
            }}
            className="relative shrink-0 flex items-center justify-center"
          >
            {/* === SPLIT TWO-HALF HARDCOVER BOARD CASING (Left Half hidden while book is closed!) === */}
            {/* Left Half Hardcover Casing Board (only visible once front cover opens past 90°) */}
            <div
              ref={leftCasingBgRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-0 right-1/2 rounded-l-2xl bg-gradient-to-br from-[#3A2B3C] via-[#261D29] to-[#1A141E] shadow-[0_34px_84px_-16px_rgba(0,0,0,0.78)] ring-1 ring-white/14"
            />
            {/* Right Half Hardcover Casing Board (always anchors the closed & open book cleanly!) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-1/2 right-0 rounded-r-2xl bg-gradient-to-br from-[#342636] via-[#231B26] to-[#17111B] shadow-[0_34px_84px_-16px_rgba(0,0,0,0.82)] ring-1 ring-white/14"
            />

            {/* === OPEN DUAL-PAGE INTERIOR ASSEMBLY (Left A4 + Spine + Right A4) === */}
            <div
              className="relative z-10 w-full h-full p-1.5 sm:p-2 flex"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Stacked A4 Paper Thickness on Left Edge (hidden while closed) */}
              <div
                aria-hidden="true"
                className={`hidden sm:block w-2 my-1 rounded-l-md shrink-0 transition-opacity duration-200 ${
                  phase === 'open' ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #EFE8DA 0px, #EFE8DA 1.5px, #CEC3AE 1.5px, #CEC3AE 2.5px)',
                }}
              />

              {/* OPEN TWO-PAGE VERTICAL A4 SPREAD VIEWPORT */}
              <div
                ref={spreadViewportRef}
                onPointerDown={(e) => {
                  const canDragAnywhere = activeTool === 'flip' || fullReadingView;
                  if (!canDragAnywhere || phase !== 'open' || cascadeStatus?.active) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = (e.clientX - rect.left) / rect.width;
                  const relY = (e.clientY - rect.top) / rect.height;
                  if (relX >= 0.5 && canTurnNext) {
                    beginCurlDrag(e, relY < 0.32 ? 'top-right' : 'bottom-right');
                  } else if (relX < 0.5 && canTurnPrev) {
                    beginCurlDrag(e, relY < 0.32 ? 'top-left' : 'bottom-left');
                  }
                }}
                onPointerMove={moveCurlDrag}
                onPointerUp={endCurlDrag}
                onPointerCancel={endCurlDrag}
                style={{ touchAction: activeTool === 'flip' || fullReadingView ? 'none' : 'auto' }}
                className={`relative flex-1 h-full rounded-lg overflow-hidden flex ${
                  activeTool === 'flip' || fullReadingView ? 'cursor-grab active:cursor-grabbing' : ''
                }`}
              >
                {/* === LEFT SIDE OF THE BOOK (A4 Left Page) === */}
                <div
                  ref={leftLeafStaticRef}
                  className="relative w-1/2 h-full border-r border-black/15"
                >
                  {/* Underlying revealed Previous Left Page when turning backward */}
                  {curlGeom?.active && curlGeom.direction === 'prev' && (
                    <div className="absolute inset-0 z-0">
                      {renderA4PageSurface(underPrevLeftPage, 'left', false)}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{
                          background: `linear-gradient(${curlGeom.normalAngleDeg + 180}deg, rgba(0,0,0,${Math.min(
                            0.42,
                            0.14 + curlGeom.curlDepth * 0.25
                          )}) 0%, rgba(0,0,0,${Math.min(0.16, curlGeom.curlDepth * 0.1)}) 22%, transparent 56%)`,
                        }}
                      />
                    </div>
                  )}

                  {/* Active Left Page (clipped along perpendicular bisector when curling backward) */}
                  <div
                    className="absolute inset-0 z-10"
                    style={
                      curlGeom?.active && curlGeom.direction === 'prev'
                        ? {
                            clipPath: curlGeom.frontLeafClipPath,
                            WebkitClipPath: curlGeom.frontLeafClipPath,
                          }
                        : undefined
                    }
                  >
                    {renderA4PageSurface(spreadLeft, 'left', true)}
                  </div>
                </div>

                {/* === RIGHT SIDE OF THE BOOK (A4 Right Page) === */}
                <div className="relative w-1/2 h-full">
                  {/* Underlying revealed Next Right Page when turning forward */}
                  {curlGeom?.active && curlGeom.direction === 'next' && (
                    <div className="absolute inset-0 z-0">
                      {renderA4PageSurface(underNextRightPage, 'right', false)}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-20"
                        style={{
                          background: `linear-gradient(${curlGeom.normalAngleDeg + 180}deg, rgba(0,0,0,${Math.min(
                            0.42,
                            0.14 + curlGeom.curlDepth * 0.25
                          )}) 0%, rgba(0,0,0,${Math.min(0.16, curlGeom.curlDepth * 0.1)}) 22%, transparent 56%)`,
                        }}
                      />
                    </div>
                  )}

                  {/* Active Right Page (clipped along perpendicular bisector when curling forward) */}
                  <div
                    className="absolute inset-0 z-10"
                    style={
                      curlGeom?.active && curlGeom.direction === 'next'
                        ? {
                            clipPath: curlGeom.frontLeafClipPath,
                            WebkitClipPath: curlGeom.frontLeafClipPath,
                          }
                        : undefined
                    }
                  >
                    {renderA4PageSurface(spreadRight, 'right', true)}
                  </div>
                </div>

                {/* Realistic Central Book Spine Gutter Shadow (visible once open) */}
                {phase === 'open' && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-9 z-20"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.11) 62%, transparent 100%)',
                    }}
                  />
                )}

                {/* === REALISTIC FLOATING CURLED BACKSIDE FLAP (100% Opaque + Exact Untransformed Scale!) === */}
                {curlGeom?.active && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-30"
                    style={{
                      filter: `drop-shadow(${curlGeom.direction === 'next' ? '-7px' : '7px'} 10px 16px rgba(0,0,0,${
                        0.26 + Math.sin(curlGeom.progress * Math.PI) * 0.22
                      }))`,
                    }}
                  >
                    <div
                      className={`absolute inset-0 overflow-hidden ${paperClass}`}
                      style={{
                        clipPath: curlGeom.backFlapSpreadClipPath,
                        WebkitClipPath: curlGeom.backFlapSpreadClipPath,
                      }}
                    >
                      {/* Rigidly Transformed Incoming Un-Mirrored Reverse Page (0.00px alignment error!) */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: `${liveSinglePageW}px`,
                          height: `${liveSinglePageH}px`,
                          transformOrigin: '0 0',
                          transform: curlGeom.getBackPageRigidTransform(liveSinglePageW, liveSinglePageH),
                        }}
                      >
                        {renderA4PageSurface(
                          flapBackPageNum,
                          curlGeom.direction === 'next' ? 'left' : 'right',
                          false
                        )}
                      </div>

                      {/* Cylindrical Paper Roll Highlight & Crease Lighting */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(${curlGeom.normalAngleDeg}deg,
                            rgba(0,0,0,0.2) 0%,
                            rgba(255,255,255,${isDarkPaper ? 0.14 : 0.42}) 14%,
                            rgba(255,255,255,0) 34%,
                            rgba(0,0,0,0.05) 76%,
                            rgba(0,0,0,0.16) 100%)`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Tactile Corner Grab & Hover-Peek Handles on ALL 4 Outer Corners (Active in ALL modes!) */}
                {phase === 'open' && !dragCurlRef.current.dragging && !cascadeStatus?.active && (
                  <>
                    {canTurnNext && (
                      <>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Hold and drag bottom-right corner to turn forward"
                          title="Hold & move corner to turn page"
                          onMouseEnter={() => triggerCornerHoverPeek('bottom-right')}
                          onMouseLeave={() => triggerCornerHoverPeek('none')}
                          onPointerDown={(e) => beginCurlDrag(e, 'bottom-right')}
                          onPointerMove={moveCurlDrag}
                          onPointerUp={endCurlDrag}
                          onPointerCancel={endCurlDrag}
                          style={{ touchAction: 'none' }}
                          className="absolute bottom-0 right-0 z-40 w-16 h-16 cursor-grab active:cursor-grabbing"
                        />
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Hold and drag top-right corner to turn forward"
                          title="Hold & move top corner to turn page"
                          onMouseEnter={() => triggerCornerHoverPeek('top-right')}
                          onMouseLeave={() => triggerCornerHoverPeek('none')}
                          onPointerDown={(e) => beginCurlDrag(e, 'top-right')}
                          onPointerMove={moveCurlDrag}
                          onPointerUp={endCurlDrag}
                          onPointerCancel={endCurlDrag}
                          style={{ touchAction: 'none' }}
                          className="absolute top-0 right-0 z-40 w-14 h-14 cursor-grab active:cursor-grabbing"
                        />
                      </>
                    )}
                    {canTurnPrev && (
                      <>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Hold and drag bottom-left corner to turn back"
                          title="Hold & move corner to turn back"
                          onMouseEnter={() => triggerCornerHoverPeek('bottom-left')}
                          onMouseLeave={() => triggerCornerHoverPeek('none')}
                          onPointerDown={(e) => beginCurlDrag(e, 'bottom-left')}
                          onPointerMove={moveCurlDrag}
                          onPointerUp={endCurlDrag}
                          onPointerCancel={endCurlDrag}
                          style={{ touchAction: 'none' }}
                          className="absolute bottom-0 left-0 z-40 w-16 h-16 cursor-grab active:cursor-grabbing"
                        />
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Hold and drag top-left corner to turn back"
                          title="Hold & move top corner to turn back"
                          onMouseEnter={() => triggerCornerHoverPeek('top-left')}
                          onMouseLeave={() => triggerCornerHoverPeek('none')}
                          onPointerDown={(e) => beginCurlDrag(e, 'top-left')}
                          onPointerMove={moveCurlDrag}
                          onPointerUp={endCurlDrag}
                          onPointerCancel={endCurlDrag}
                          style={{ touchAction: 'none' }}
                          className="absolute top-0 left-0 z-40 w-14 h-14 cursor-grab active:cursor-grabbing"
                        />
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Stacked A4 Paper Thickness on Right Edge */}
              <div
                aria-hidden="true"
                className="hidden sm:block w-2 my-1 rounded-r-md shrink-0"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #EFE8DA 0px, #EFE8DA 1.5px, #CEC3AE 1.5px, #CEC3AE 2.5px)',
                }}
              />
            </div>

            {/* === STEP 3 OF OPENING: OPENING PAGE LEAF (Flips smoothly right AFTER the single cover opens!) === */}
            {phase === 'opening' && (
              <div
                ref={openingPageLeafRef}
                style={{ transformStyle: 'preserve-3d' }}
                className="pointer-events-none absolute top-2 bottom-2 left-1/2 right-3 z-40 rounded-r-lg"
              >
                {/* Front of Opening Flyleaf Sheet */}
                <div
                  className={`book-leaf-face absolute inset-0 rounded-r-lg overflow-hidden shadow-lg flex flex-col items-center justify-center p-8 text-center ${paperClass}`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/15 to-transparent" />
                  <p className="text-[10px] uppercase tracking-[0.24em] opacity-45 mb-3">
                    {book.category}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug max-w-[85%] opacity-85">
                    {book.title}
                  </h3>
                  <div className="w-10 h-[1.5px] bg-current opacity-20 my-3.5" />
                  <p className="text-xs opacity-60">{book.author}</p>
                </div>

                {/* Back of Opening Flyleaf Sheet (renders real incoming Left Page seamlessly onto the left spread!) */}
                <div className={`book-leaf-back absolute inset-0 rounded-l-lg overflow-hidden shadow-md ${paperClass}`}>
                  {renderA4PageSurface(spreadLeft, 'left', false)}
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-black/15 to-transparent" />
                </div>
              </div>
            )}

            {/* === STEP 2 OF OPENING & STEP 1 OF CLOSING: SINGLE 3D FRONT HARDCOVER === */}
            {phase !== 'open' && (
              <div
                ref={frontCoverDoorRef}
                style={{ transformStyle: 'preserve-3d' }}
                className="pointer-events-none absolute top-0 bottom-0 left-1/2 right-0 z-50 rounded-r-2xl rounded-l-sm"
              >
                {/* Exterior Single Front Hardcover */}
                <div className="book-leaf-face absolute inset-0 rounded-r-2xl rounded-l-sm overflow-hidden shadow-2xl ring-1 ring-white/20">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookCoverArt
                      variant={book.coverVariant}
                      title={book.title}
                      author={book.author}
                      className="w-full h-full !rounded-none !p-8"
                    />
                  )}
                  <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/45 via-white/15 to-transparent" />
                </div>

                {/* Interior Marbled Endpaper Back of Front Hardcover */}
                <div
                  className="book-leaf-back absolute inset-0 rounded-l-2xl rounded-r-sm overflow-hidden flex items-center justify-center p-8"
                  style={{
                    backgroundColor: '#2B2232',
                    backgroundImage:
                      'radial-gradient(circle at 25% 25%, rgba(255,185,249,0.14), transparent 55%), repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 10px)',
                  }}
                >
                  <div className="text-center opacity-45">
                    <FocusXMark className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[11px] tracking-widest uppercase text-white/80">FocusX Library Edition</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Right Turn Chevron */}
        <button
          type="button"
          disabled={!canTurnNext || curlState.active || phase !== 'open'}
          onClick={() => animateSingleSpreadCurl('bottom-right', { x: SPREAD_W - 24, y: SPREAD_H - 18 }, true)}
          aria-label="Next spread"
          className={`hidden md:flex z-30 ml-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/22 disabled:opacity-20 items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
            fullReadingView && !fullViewCrossVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide-Out Bookmarks & Silk Ribbon Drawer */}
        {!fullReadingView && showBookmarksDrawer && (
          <aside className="absolute top-3 right-3 bottom-3 w-72 z-50 rounded-2xl bg-[#1F1A27]/96 border border-white/12 shadow-2xl p-4 flex flex-col gap-3.5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Bookmarks & Ribbon</h3>
              <button
                type="button"
                onClick={() => setShowBookmarksDrawer(false)}
                className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pb-3 border-b border-white/10">
              <span className="text-[11px] font-medium text-[#B5A8B2]">Book Cover Ribbon Silk</span>
              <div className="flex items-center gap-2">
                {(Object.keys(RIBBON_COLOR_STYLES) as RibbonColorId[]).map((cid) => (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => setRibbonColor(cid)}
                    title={RIBBON_COLOR_STYLES[cid].label}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      ribbonColor === cid ? 'ring-2 ring-white scale-110' : 'opacity-75 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: RIBBON_COLOR_STYLES[cid].dot }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {sortedBookmarks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#9D8F99]">
                  No pinned bookmarks yet. Click <strong>Bookmark</strong> above to drop a silk ribbon on this spread.
                </div>
              ) : (
                sortedBookmarks.map((bm) => (
                  <div
                    key={bm.page}
                    className="p-2.5 rounded-xl bg-white/6 border border-white/8 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          userHasNavigatedRef.current = true;
                          setShowBookmarksDrawer(false);
                          runPageTurnCascade(spreadLeft, bm.page);
                        }}
                        className="text-left text-xs font-semibold text-[#6EE7B7] hover:underline cursor-pointer tabular-nums"
                      >
                        Flip to Page {bm.page}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBookmarkOnPage(bm.page)}
                        className="text-[10px] text-[#9D8F99] hover:text-rose-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={bm.label}
                      onChange={(e) => updateBookmarkLabel(bm.page, e.target.value)}
                      className="w-full bg-black/25 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none focus:border-[#6EE7B7]"
                      placeholder="Bookmark label…"
                    />
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Quick Save Quote Modal Overlay */}
        {!fullReadingView && showQuoteModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveHighlight}
              className="w-full max-w-md rounded-2xl bg-[#1F1A27] border border-white/14 p-5 shadow-2xl flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tabular-nums">
                  Save Highlight · Page {activeBookmarkTargetPage}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Type or paste a memorable passage from this spread…"
                className="bg-black/30 border border-white/12 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#6EE7B7] resize-none"
              />
              <input
                type="text"
                value={quoteNote}
                onChange={(e) => setQuoteNote(e.target.value)}
                placeholder="Optional study note or seminar link…"
                className="bg-black/30 border border-white/12 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#6EE7B7]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#6EE7B7] text-[#072116] text-xs font-semibold cursor-pointer"
                >
                  Save Highlight
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Floating Annotation Studio Dock + Page Scrubber (hidden in Pure Full-Size Reading View) */}
      {!fullReadingView && (
        <footer
          ref={dockRef}
          className="relative z-20 shrink-0 px-3 sm:px-6 pb-3 pt-2 border-t border-white/10 bg-[#1B1622]/95 flex flex-col gap-2 transition-opacity duration-200"
        >
          {activeTool !== 'flip' && activeTool !== 'eraser' && (
            <div className="flex flex-wrap items-center justify-center gap-3 py-1 px-3 rounded-xl bg-white/6 border border-white/8 mx-auto max-w-full">
              {(activeTool === 'highlighter' ||
                activeTool === 'pen' ||
                activeTool === 'pencil' ||
                activeTool === 'shape') && (
                <>
                  <div className="flex items-center gap-1.5">
                    {activeColorSwatches.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setCurrentToolColor(hex)}
                        aria-label={`Select color ${hex}`}
                        className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                          currentToolColor === hex ? 'ring-2 ring-white scale-115' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>

                  {activeTool === 'highlighter' ? (
                    <>
                      <div className="h-4 w-px bg-white/15" />
                      <span className="text-[11px] text-[#6EE7B7] font-medium">
                        Straight text-lock active · drag across text lines on either page
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-4 w-px bg-white/15" />
                      <div className="flex items-center gap-1.5 text-[11px] text-[#B5A8B2]">
                        <span>Size</span>
                        {[2, 3, 5].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setStrokeSize(sz)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ${
                              strokeSize === sz ? 'bg-white/20 text-white' : 'hover:bg-white/10'
                            }`}
                          >
                            <span
                              className="rounded-full bg-current"
                              style={{ width: sz * 2 + 2, height: sz * 2 + 2 }}
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTool === 'shape' && (
                <>
                  <div className="h-4 w-px bg-white/15" />
                  <div className="flex items-center gap-1">
                    {SHAPE_OPTIONS.map((sh) => {
                      const Icon = sh.icon;
                      return (
                        <button
                          key={sh.id}
                          type="button"
                          onClick={() => setActiveShapeKind(sh.id)}
                          title={sh.label}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium cursor-pointer whitespace-nowrap ${
                            activeShapeKind === sh.id
                              ? 'bg-[#6EE7B7] text-[#072116]'
                              : 'text-[#D6CAD3] hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{sh.label}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setShapeFilled((f) => !f)}
                      className={`ml-1 px-2 py-1 rounded-lg text-[11px] font-medium cursor-pointer ${
                        shapeFilled ? 'bg-white/20 text-white' : 'text-[#9D8F99] hover:bg-white/10'
                      }`}
                    >
                      {shapeFilled ? 'Filled' : 'Outline'}
                    </button>
                  </div>
                </>
              )}

              {activeTool === 'sticker' && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
                  {STICKER_CATALOG.map((st) => (
                    <button
                      key={st.kind}
                      type="button"
                      onClick={() => setActiveStickerKind(st.kind)}
                      title={`Stamp ${st.label}`}
                      className={`p-0.5 rounded-xl transition-transform cursor-pointer shrink-0 ${
                        activeStickerKind === st.kind
                          ? 'ring-2 ring-[#FFB9F9] scale-105'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <StickerGraphic kind={st.kind} compact />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1160px] w-full mx-auto">
            <div className="flex items-center gap-1 bg-white/6 border border-white/10 rounded-xl p-1 overflow-x-auto">
              {(
                [
                  { id: 'flip', label: 'Flip', icon: Hand },
                  { id: 'highlighter', label: 'Highlight', icon: Highlighter },
                  { id: 'pen', label: 'Pen', icon: PenTool },
                  { id: 'pencil', label: 'Pencil', icon: Pencil },
                  { id: 'shape', label: 'Shapes', icon: Shapes },
                  { id: 'sticker', label: 'Stickers', icon: Smile },
                  { id: 'eraser', label: 'Eraser', icon: Eraser },
                ] as const
              ).map((tool) => {
                const Icon = tool.icon;
                const selected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveTool(tool.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      selected
                        ? 'bg-[#FFB9F9] text-[#3B1837] shadow-xs'
                        : 'text-[#D6CAD3] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{tool.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 flex-1 min-w-[180px] max-w-xs">
              <span className="text-[11px] text-[#B5A8B2] tabular-nums whitespace-nowrap font-medium">
                {spreadRight ? `${spreadLeft}–${spreadRight}` : spreadLeft} / {book.totalPages}
              </span>
              <input
                type="range"
                min={1}
                max={Math.max(1, book.totalPages)}
                value={spreadLeft}
                onChange={(e) => {
                  userHasNavigatedRef.current = true;
                  setSpreadLeft(toSpreadLeft(Number(e.target.value), book.totalPages));
                }}
                aria-label="Jump to page"
                className="w-full accent-[#6EE7B7] cursor-pointer"
              />
              <span className="hidden lg:inline text-[11px] text-[#9D8F99] whitespace-nowrap">
                {activeTool === 'flip' ? 'Hold & curl either side' : 'Drag any corner to flip'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={undoStack.length === 0}
                onClick={handleUndo}
                title="Undo (Ctrl+Z)"
                className="p-2 rounded-xl bg-white/6 hover:bg-white/14 disabled:opacity-30 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={redoStack.length === 0}
                onClick={handleRedo}
                title="Redo (Ctrl+Shift+Z)"
                className="p-2 rounded-xl bg-white/6 hover:bg-white/14 disabled:opacity-30 cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleClearCurrentSpread}
                title="Clear annotations on this spread"
                className="p-2 rounded-xl bg-white/6 hover:bg-rose-500/25 hover:text-rose-300 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
