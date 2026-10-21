export const MAX_ROTATION = 28;
export const MAX_DEPTH = 140;
export const MIN_SCALE = 0.92;
export const SCALE_RANGE = 0.1;
export const GAP = 28;

export function mod(n, m) {
  return ((n % m) + m) % m;
}

export function getResponsiveCardDimensions() {
  if (typeof window === "undefined") return { w: 350, h: 450 };
  const width = window.innerWidth;
  if (width < 768) {
    const w = Math.round(width * 0.7);
    const h = Math.round(w * 1.3);
    return { w, h };
  }
  return { w: 350, h: 450 };
}

export function computeTransformComponents(screenX, vwHalf) {
  const norm = Math.max(-1, Math.min(1, screenX / vwHalf));
  const absNorm = Math.abs(norm);
  const invNorm = 1 - absNorm;

  const ry = -norm * MAX_ROTATION;
  const tz = invNorm * MAX_DEPTH;
  const scale = MIN_SCALE + invNorm * SCALE_RANGE;

  return { norm, absNorm, invNorm, ry, tz, scale };
}

export function transformForScreenX(screenX, vwHalf) {
  const { ry, tz, scale } = computeTransformComponents(screenX, vwHalf);
  return {
    transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
    z: tz,
  };
}
