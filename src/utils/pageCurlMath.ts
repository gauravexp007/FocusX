/**
 * Dual-Spread Vertical A4 Perpendicular-Bisector Diagonal Paper Curl Engine
 * Inspired by StPageFlip & Apple Books physical page-curl mathematics.
 *
 * Canonical Dual-Spread Coordinate Space:
 *   - Left A4 Page:  x ∈ [0, 210],   y ∈ [0, 297]
 *   - Center Spine:  x = 210
 *   - Right A4 Page: x ∈ [210, 420], y ∈ [0, 297]
 *   - Full Spread:   SPREAD_W = 420, SPREAD_H = 297
 *
 * Turning Forward ('next'):
 *   Right page [210..420] curls across the spine x=210 toward x=0.
 *   The curled backside flap displays the incoming next Left Page (un-mirrored, rigid transform!)
 *   and lands with 0.00px alignment error on [0..210].
 *
 * Turning Backward ('prev'):
 *   Left page [0..210] curls across the spine x=210 toward x=420.
 *   The curled backside flap displays the incoming previous Right Page (un-mirrored, rigid transform!)
 *   and lands with 0.00px alignment error on [210..420].
 */

export interface Vec2 {
  x: number;
  y: number;
}

export type CurlDirection = 'next' | 'prev';
export type CurlCorner = 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';

export const A4_W = 210;
export const A4_H = 297;
export const SPREAD_W = A4_W * 2; // 420
export const SPREAD_H = A4_H; // 297
export const SPINE_X = A4_W; // 210

const RIGHT_PAGE_RECT: Vec2[] = [
  { x: SPINE_X, y: 0 },
  { x: SPREAD_W, y: 0 },
  { x: SPREAD_W, y: SPREAD_H },
  { x: SPINE_X, y: SPREAD_H },
];

const LEFT_PAGE_RECT: Vec2[] = [
  { x: 0, y: 0 },
  { x: SPINE_X, y: 0 },
  { x: SPINE_X, y: SPREAD_H },
  { x: 0, y: SPREAD_H },
];

export interface DualSpreadCurlGeometry {
  active: boolean;
  direction: CurlDirection;
  /** Clip-path polygon in LOCAL (0..100%) coordinates of the turning front leaf */
  frontLeafClipPath: string;
  /** Clip-path polygon in FULL-SPREAD (0..100% of 420x297) coordinates of the floating folded backside flap */
  backFlapSpreadClipPath: string;
  /** Angle (degrees) of unit normal N pointing from dragged point P toward original corner C */
  normalAngleDeg: number;
  /** Normalized turn progress (0 = flat, 1 = fully turned onto opposite side) */
  progress: number;
  /** Normalized curl depth */
  curlDepth: number;
  /**
   * Exact rigid CSS matrix(...) placing the incoming un-mirrored A4 back page (size pageW x pageH px)
   * directly onto the floating curled flap inside the full-spread container (size 2*pageW x pageH px).
   */
  getBackPageRigidTransform: (pageWidthPx: number, pageHeightPx: number) => string;
}

export function getOriginCorner(corner: CurlCorner): Vec2 {
  switch (corner) {
    case 'bottom-right':
      return { x: SPREAD_W, y: SPREAD_H };
    case 'top-right':
      return { x: SPREAD_W, y: 0 };
    case 'bottom-left':
      return { x: 0, y: SPREAD_H };
    case 'top-left':
      return { x: 0, y: 0 };
  }
}

export function getTargetCorner(corner: CurlCorner): Vec2 {
  switch (corner) {
    case 'bottom-right':
      return { x: 0, y: SPREAD_H };
    case 'top-right':
      return { x: 0, y: 0 };
    case 'bottom-left':
      return { x: SPREAD_W, y: SPREAD_H };
    case 'top-left':
      return { x: SPREAD_W, y: 0 };
  }
}

/**
 * Constrain dragged corner P against the physical central book spine (x = SPINE_X).
 * Guarantees paper never stretches away from the binding!
 */
export function constrainSpreadCorner(rawP: Vec2, corner: CurlCorner): Vec2 {
  let x = rawP.x;
  let y = rawP.y;

  const isBottom = corner === 'bottom-right' || corner === 'bottom-left';
  const spineNear: Vec2 = { x: SPINE_X, y: isBottom ? SPREAD_H : 0 };
  const spineFar: Vec2 = { x: SPINE_X, y: isBottom ? 0 : SPREAD_H };

  // Constraint 1: |P - spineNear| <= A4_W
  let dx = x - spineNear.x;
  let dy = y - spineNear.y;
  let dist = Math.hypot(dx, dy);
  if (dist > A4_W) {
    const k = A4_W / dist;
    x = spineNear.x + dx * k;
    y = spineNear.y + dy * k;
  }

  // Constraint 2: |P - spineFar| <= hypot(A4_W, A4_H)
  const diag = Math.hypot(A4_W, A4_H);
  dx = x - spineFar.x;
  dy = y - spineFar.y;
  dist = Math.hypot(dx, dy);
  if (dist > diag) {
    const k = diag / dist;
    x = spineFar.x + dx * k;
    y = spineFar.y + dy * k;
  }

  // Keep cleanly inside horizontal sweep bounds
  x = Math.max(0.4, Math.min(SPREAD_W - 0.4, x));
  return { x, y };
}

/**
 * Sutherland-Hodgman half-plane polygon clip against (Q - M) · N * keepSide >= 0.
 */
function clipPolygonByLine(poly: Vec2[], M: Vec2, N: Vec2, keepSide: -1 | 1): Vec2[] {
  if (poly.length === 0) return [];
  const out: Vec2[] = [];
  const evalSigned = (q: Vec2) => ((q.x - M.x) * N.x + (q.y - M.y) * N.y) * keepSide;

  for (let i = 0; i < poly.length; i++) {
    const curr = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const dCurr = evalSigned(curr);
    const dPrev = evalSigned(prev);
    const currInside = dCurr >= -1e-6;
    const prevInside = dPrev >= -1e-6;

    if (currInside !== prevInside) {
      const denom = dPrev - dCurr;
      const t = Math.abs(denom) > 1e-8 ? dPrev / denom : 0.5;
      out.push({
        x: prev.x + t * (curr.x - prev.x),
        y: prev.y + t * (curr.y - prev.y),
      });
    }
    if (currInside) {
      out.push(curr);
    }
  }
  return out;
}

function reflectPointAcrossLine(q: Vec2, M: Vec2, N: Vec2): Vec2 {
  const d = (q.x - M.x) * N.x + (q.y - M.y) * N.y;
  return {
    x: q.x - 2 * d * N.x,
    y: q.y - 2 * d * N.y,
  };
}

function polyToCssClipPath(poly: Vec2[], originX: number, boxW: number, boxH: number): string {
  if (poly.length < 3) return 'polygon(0% 0%, 0% 0%, 0% 0%)';
  return `polygon(${poly
    .map((pt) => `${(((pt.x - originX) / boxW) * 100).toFixed(2)}% ${((pt.y / boxH) * 100).toFixed(2)}%`)
    .join(', ')})`;
}

/**
 * Compute full dual-spread diagonal paper curl geometry for any grabbed corner & pointer position.
 */
export function computeDualSpreadCurl(rawP: Vec2, corner: CurlCorner): DualSpreadCurlGeometry {
  const direction: CurlDirection = corner === 'bottom-right' || corner === 'top-right' ? 'next' : 'prev';
  const C = getOriginCorner(corner);
  const P = constrainSpreadCorner(rawP, corner);

  const vx = C.x - P.x;
  const vy = C.y - P.y;
  const dist = Math.hypot(vx, vy);

  if (dist < 1.2) {
    return {
      active: false,
      direction,
      frontLeafClipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      backFlapSpreadClipPath: 'polygon(0% 0%, 0% 0%, 0% 0%)',
      normalAngleDeg: 0,
      progress: 0,
      curlDepth: 0,
      getBackPageRigidTransform: () => 'none',
    };
  }

  const N: Vec2 = { x: vx / dist, y: vy / dist };
  const M: Vec2 = { x: (C.x + P.x) / 2, y: (C.y + P.y) / 2 };

  const leafRect = direction === 'next' ? RIGHT_PAGE_RECT : LEFT_PAGE_RECT;
  const leafOriginX = direction === 'next' ? SPINE_X : 0;

  // Remaining unpeeled front portion of the turning leaf
  const frontPoly = clipPolygonByLine(leafRect, M, N, -1);
  // Peeled triangle/quad reflected across crease line L into full spread coordinates
  const peeledPoly = clipPolygonByLine(leafRect, M, N, 1);
  const reflectedFlapPoly = peeledPoly.map((q) => reflectPointAcrossLine(q, M, N));

  const normalAngleDeg = (Math.atan2(N.y, N.x) * 180) / Math.PI;
  const progress =
    direction === 'next'
      ? Math.max(0, Math.min(1, (SPREAD_W - P.x) / SPREAD_W))
      : Math.max(0, Math.min(1, P.x / SPREAD_W));

  // Compute exact un-mirrored rigid body transform for the reverse page (size A4_W x A4_H)
  // For 'next': Right page's (SPREAD_W, 0) maps to Next Left Page's (0, 0),
  //             (SPINE_X, 0) maps to Next Left Page's (A4_W, 0),
  //             (SPREAD_W, SPREAD_H) maps to Next Left Page's (0, A4_H).
  // For 'prev': Left page's (SPINE_X, 0) maps to Prev Right Page's (0, 0),
  //             (0, 0) maps to Prev Right Page's (A4_W, 0),
  //             (SPINE_X, SPREAD_H) maps to Prev Right Page's (0, A4_H).
  const refOrigin =
    direction === 'next'
      ? reflectPointAcrossLine({ x: SPREAD_W, y: 0 }, M, N)
      : reflectPointAcrossLine({ x: SPINE_X, y: 0 }, M, N);
  const refRight =
    direction === 'next'
      ? reflectPointAcrossLine({ x: SPINE_X, y: 0 }, M, N)
      : reflectPointAcrossLine({ x: 0, y: 0 }, M, N);
  const refBottom =
    direction === 'next'
      ? reflectPointAcrossLine({ x: SPREAD_W, y: SPREAD_H }, M, N)
      : reflectPointAcrossLine({ x: SPINE_X, y: SPREAD_H }, M, N);

  const getBackPageRigidTransform = (pageWidthPx: number, pageHeightPx: number): string => {
    const sx = pageWidthPx / A4_W;
    const sy = pageHeightPx / A4_H;

    const ox = refOrigin.x * sx;
    const oy = refOrigin.y * sy;
    const ux = ((refRight.x - refOrigin.x) * sx) / pageWidthPx;
    const uy = ((refRight.y - refOrigin.y) * sy) / pageWidthPx;
    const vxPx = ((refBottom.x - refOrigin.x) * sx) / pageHeightPx;
    const vyPx = ((refBottom.y - refOrigin.y) * sy) / pageHeightPx;

    return `matrix(${ux.toFixed(5)}, ${uy.toFixed(5)}, ${vxPx.toFixed(5)}, ${vyPx.toFixed(5)}, ${ox.toFixed(2)}, ${oy.toFixed(2)})`;
  };

  return {
    active: true,
    direction,
    frontLeafClipPath: polyToCssClipPath(frontPoly, leafOriginX, A4_W, A4_H),
    backFlapSpreadClipPath: polyToCssClipPath(reflectedFlapPoly, 0, SPREAD_W, SPREAD_H),
    normalAngleDeg,
    progress,
    curlDepth: dist / SPREAD_W,
    getBackPageRigidTransform,
  };
}
