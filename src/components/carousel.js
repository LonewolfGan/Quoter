import { useEffect, useRef } from "react";
import authors from "../assets/authors";
import gsap from "gsap";
import "../styles/carousel.css";

export function Carousel3D({ onCardClick }) {
  const stageRef = useRef(null);
  const cardsRef = useRef(null);
  const bgRef = useRef(null);
  const loaderRef = useRef(null);
  const carouselControlsRef = useRef(null); // Ref to expose navigation controls

  useEffect(() => {
    const stage = stageRef.current;
    const cardsRoot = cardsRef.current;
    const bgCanvas = bgRef.current;
    const bgCtx = bgCanvas?.getContext("2d", { alpha: false });
    const loader = loaderRef.current;

    const IMAGES = authors.map((author) => author.image);
    // Keep reference to authors array for accessing names

    /*
  Infinite Gradient 3D Carousel
  A smooth, infinite-scrolling 3D carousel with dynamic gradient backgrounds
  that change based on the active card's colors.
*/

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    // Physics constants
    const FRICTION = 0.92; // Less friction for more fluid movement
    const WHEEL_SENS = 0.8; // Increased sensitivity
    const DRAG_SENS = 18; // Increased drag sensitivity

    // Visual constants
    const MAX_ROTATION = 28; // Maximum card rotation in degrees
    const MAX_DEPTH = 140; // Maximum Z-axis depth in pixels
    const MIN_SCALE = 0.92; // Minimum card scale
    const SCALE_RANGE = 0.1; // Scale variation range
    // Fixed gap that remains constant on resize
    const GAP = 28; // Fixed gap in pixels - never changes

    // ============================================================================
    // DOM REFERENCES
    // ============================================================================

    /* const stage = document.querySelector('.stage');
const cardsRoot = document.getElementById('cards');
const bgCanvas = document.getElementById('bg');
const bgCtx = bgCanvas?.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');
 */
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    // Carousel state
    let items = []; // Array of {el: HTMLElement, x: number}
    let positions = []; // Float32Array for wrapped positions
    let activeIndex = -1; // Currently centered card index
    let isEntering = true; // Prevents interaction during entry animation

    // Layout measurements
    let CARD_W = 350; // Card width (measured dynamically)
    let CARD_H = 450; // Card height (measured dynamically)
    let STEP = CARD_W + GAP; // Distance between card centers
    let TRACK = 0; // Total carousel track length
    let SCROLL_X = 0; // Current scroll position
    let VW_HALF = window.innerWidth * 0.5;

    // Physics state
    let vX = 0; // Velocity in X direction

    // Navigation function that will be exposed via ref
    function navigateCarousel(direction) {
      if (isEntering) return;
      const delta = direction === "next" ? 1 : -1;
      // Calculate velocity needed to move one full card (STEP = CARD_W + GAP)
      // With friction, we need enough velocity to travel STEP pixels
      // Formula: distance ≈ velocity / (1 - friction) at 60fps
      // So: velocity ≈ distance * (1 - friction) * 60
      const targetDistance = STEP || CARD_W + GAP; // Distance to next/previous card
      const requiredVelocity = targetDistance * (1 - FRICTION) * 60; // 60 for smooth movement
      vX += delta * requiredVelocity;
    }

    // Expose navigation controls early for button handlers
    carouselControlsRef.current = {
      navigate: navigateCarousel,
    };

    // Animation frame IDs
    let rafId = null; // Carousel animation frame
    let bgRAF = null; // Background animation frame
    let lastTime = 0; // Last frame timestamp
    let lastBgDraw = 0; // Last background draw time

    // Background gradient state
    let gradPalette = []; // Extracted colors from each image
    let gradCurrent = {
      // Current interpolated gradient colors
      r1: 240,
      g1: 240,
      b1: 240, // First gradient color (RGB)
      r2: 235,
      g2: 235,
      b2: 235, // Second gradient color (RGB)
    };
    let bgFastUntil = 0; // Timestamp until which to render at high FPS

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Safe modulo operation that handles negative numbers correctly
     * @param {number} n - The dividend
     * @param {number} m - The divisor
     * @returns {number} The positive remainder
     */
    function mod(n, m) {
      return ((n % m) + m) % m;
    }

    // ============================================================================
    // IMAGE PRELOADING
    // ============================================================================

    /**
     * Preload images using link tags for browser optimization
     * Only preload visible and nearby images for better performance
     * @param {string[]} srcs - Array of image URLs
     */
    function preloadImageLinks(srcs) {
      if (!document.head) return;

      // Only preload the first 10 images to save bandwidth
      const PRELOAD_COUNT = Math.min(10, srcs.length);

      for (let i = 0; i < PRELOAD_COUNT; i++) {
        const href = srcs[i];
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = href;
        link.fetchPriority = i < PRELOAD_COUNT ? "high" : "auto";
        document.head.appendChild(link);
      }
    }

    /**
     * Wait for visible card images to finish loading
     * Only waits for images in the visible range to avoid blocking
     * @returns {Promise<void>}
     */
    function waitForImages() {
      // Optimize: Only wait for initial visible images (first 7)
      // The rest will load in background
      const CHECK_COUNT = Math.min(7, items.length);

      const promises = items.slice(0, CHECK_COUNT).map((it) => {
        const img = it.el.querySelector("img");
        if (!img || img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          setTimeout(done, 1000); // Timeout de 1s max par image
        });
      });

      return Promise.allSettled(promises);
    }

    /**
     * Decode visible images to prevent jank during first interaction
     * Only decodes images that are likely to be seen immediately
     * @returns {Promise<void>}
     */
    async function decodeAllImages() {
      // Optimize: Only decode initial visible images
      const DECODE_COUNT = Math.min(7, items.length);

      const tasks = items.slice(0, DECODE_COUNT).map((it) => {
        const img = it.el.querySelector("img");
        if (!img || !img.complete) return Promise.resolve();

        if (typeof img.decode === "function") {
          return img.decode().catch(() => {});
        }
        return Promise.resolve();
      });

      await Promise.allSettled(tasks);
    }

    // ============================================================================
    // CAROUSEL SETUP
    // ============================================================================

    /**
     * Create card DOM elements from image array with progressive loading
     */
    function createCards() {
      cardsRoot.innerHTML = "";
      items = [];

      const fragment = document.createDocumentFragment();
      /*  const VISIBLE_RANGE = 3; // Load 3 images on each side of center initially
      const PRIORITY_RANGE = 5; // High priority for 5 images on each side */

      IMAGES.forEach((src, i) => {
        const card = document.createElement("article");
        card.className = "card";
        card.style.width = `${CARD_W}px`;
        card.style.height = `${CARD_H}px`;
        card.style.willChange = "transform";

        const img = new Image();
        img.className = "card__img";
        img.decoding = "async";
        img.draggable = false;

        // Optimize loading strategy
        // Load first 5 images eagerly, others lazily
        if (i < 5) {
          img.loading = "eager";
          img.fetchPriority = "high";
        } else {
          img.loading = "lazy";
          img.fetchPriority = "auto";
        }

        img.src = src;

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.backgroundColor = "#f5f5f5";
        img.style.transition = "opacity 0.3s ease-in-out";
        img.style.opacity = "0";

        img.addEventListener(
          "load",
          () => {
            img.style.opacity = "1";
          },
          { once: true }
        );

        img.addEventListener(
          "error",
          () => {
            img.style.opacity = "0.3";
            img.style.backgroundColor = "#e8e8e8";
          },
          { once: true }
        );

        card.appendChild(img);
        fragment.appendChild(card);
        items.push({ el: card, x: i * STEP, imageLoaded: false });
      });

      cardsRoot.appendChild(fragment);
    }

    /**
     * Preload images progressively based on scroll position
     */
    function preloadNearbyImages(centerIndex) {
      const PRELOAD_RANGE = 4; // Preload 2 images on each side

      for (let offset = -PRELOAD_RANGE; offset <= PRELOAD_RANGE; offset++) {
        const idx = mod(centerIndex + offset, items.length);
        const item = items[idx];
        if (!item) continue;

        const img = item.el.querySelector("img");
        if (!img) continue;

        // If image is already loaded, mark it
        if (img.complete) {
          item.imageLoaded = true;
          continue;
        }

        // Boost priority for nearby images
        img.loading = "eager";
        img.fetchPriority = "high";

        // If image hasn't started loading, start it
        if (!img.src || img.src === "") {
          if (idx >= 0 && idx < IMAGES.length) {
            img.src = IMAGES[idx];
          }
        }

        // Mark as loaded when complete
        if (!item.imageLoaded) {
          img.addEventListener(
            "load",
            () => {
              item.imageLoaded = true;
            },
            { once: true }
          );
        }
      }
    }

    /**
     * Measure card dimensions and calculate layout
     */
    function measure() {
      const sample = items[0]?.el;
      if (!sample) return;

      // Gap is fixed and never changes
      const r = sample.getBoundingClientRect();
      const newCardW = r.width || CARD_W;
      const newCardH = r.height || CARD_H;

      // Update dimensions if changed
      if (
        Math.abs(newCardW - CARD_W) > 0.5 ||
        Math.abs(newCardH - CARD_H) > 0.5
      ) {
        CARD_W = newCardW;
        CARD_H = newCardH;
      }

      // Recalculate STEP with fixed gap
      STEP = CARD_W + GAP;
      TRACK = items.length * STEP;

      // Always update positions to maintain spacing
      items.forEach((it, i) => {
        it.x = i * STEP;
      });

      positions = new Float32Array(items.length);
    }

    // ============================================================================
    // TRANSFORM CALCULATIONS
    // ============================================================================

    function computeTransformComponents(screenX) {
      const norm = Math.max(-1, Math.min(1, screenX / VW_HALF));
      const absNorm = Math.abs(norm);
      const invNorm = 1 - absNorm;

      const ry = -norm * MAX_ROTATION;
      const tz = invNorm * MAX_DEPTH;
      const scale = MIN_SCALE + invNorm * SCALE_RANGE;

      return { norm, absNorm, invNorm, ry, tz, scale };
    }

    /**
     * Calculate 3D transform for a card based on its screen position
     * @param {number} screenX - Card's X position relative to viewport center
     * @returns {{transform: string, z: number}} Transform string and Z-depth
     */
    function transformForScreenX(screenX) {
      const { ry, tz, scale } = computeTransformComponents(screenX);

      return {
        transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
        z: tz,
      };
    }

    /**
     * Update all card transforms based on current scroll position
     */
    function updateCarouselTransforms() {
      const half = TRACK / 2;
      let closestIdx = -1;
      let closestDist = Infinity;

      // Calculate wrapped positions for infinite scroll
      for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;

        // Wrap position to nearest equivalent position
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;

        positions[i] = pos;

        // Track closest card to center
        const dist = Math.abs(pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      // Get adjacent cards for selective blur
      const prevIdx = (closestIdx - 1 + items.length) % items.length;
      const nextIdx = (closestIdx + 1) % items.length;

      // Apply transforms to all cards
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const pos = positions[i];

        // Optimization: Skip rendering if far off-screen to improve performance
        // Only render cards within reasonable view distance
        if (Math.abs(pos) > VW_HALF * 2.5) {
          if (it.el.style.display !== "none") it.el.style.display = "none";
          continue;
        }
        if (it.el.style.display === "none") it.el.style.display = "block";

        const norm = Math.max(-1, Math.min(1, pos / VW_HALF));
        const { transform, z } = transformForScreenX(pos);

        it.el.style.transform = transform;
        it.el.style.zIndex = String(1000 + Math.round(z)); // Higher z-index for cards in front

        // Apply subtle blur to non-core cards
        const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
        const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
        it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
      }

      // Update gradient if active card changed
      if (closestIdx !== activeIndex) {
        setActiveGradient(closestIdx);
        // Preload nearby images when active card changes
        preloadNearbyImages(closestIdx);
      }
    }

    // ============================================================================
    // ANIMATION LOOP
    // ============================================================================

    /**
     * Main animation loop for carousel movement
     * @param {number} t - Current timestamp
     */
    function tick(t) {
      const dt = lastTime ? (t - lastTime) / 1000 : 0;
      lastTime = t;

      // Apply velocity to scroll position
      SCROLL_X = mod(SCROLL_X + vX * dt, TRACK);

      // Apply friction to velocity
      const decay = Math.pow(FRICTION, dt * 60);
      vX *= decay;
      if (Math.abs(vX) < 0.02) vX = 0;

      updateCarouselTransforms();
      rafId = requestAnimationFrame(tick);
    }

    /**
     * Start the carousel animation loop
     */
    function startCarousel() {
      cancelCarousel();
      lastTime = 0;
      rafId = requestAnimationFrame((t) => {
        updateCarouselTransforms();
        tick(t);
      });
    }

    /**
     * Stop the carousel animation loop
     */
    function cancelCarousel() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    // ============================================================================
    // COLOR EXTRACTION & UTILITIES
    // ============================================================================

    /**
     * Convert RGB to HSL color space
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {[number, number, number]} [hue (0-360), saturation (0-1), lightness (0-1)]
     */
    function rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s;
      const l = (max + min) / 2;

      if (max === min) {
        h = 0;
        s = 0; // Achromatic
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          default:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return [h * 360, s, l];
    }

    /**
     * Convert HSL to RGB color space
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-1)
     * @param {number} l - Lightness (0-1)
     * @returns {[number, number, number]} [red (0-255), green (0-255), blue (0-255)]
     */
    function hslToRgb(h, s, l) {
      h = ((h % 360) + 360) % 360;
      h /= 360;
      let r, g, b;

      if (s === 0) {
        r = g = b = l; // Achromatic
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    /**
     * Generate fallback colors when extraction fails
     * @param {number} idx - Card index
     * @returns {{c1: number[], c2: number[]}} Two RGB colors
     */
    function fallbackFromIndex(idx) {
      const h = (idx * 37) % 360; // Spread hues across spectrum
      const s = 0.65;
      const c1 = hslToRgb(h, s, 0.52);
      const c2 = hslToRgb(h, s, 0.72);
      return { c1, c2 };
    }

    /**
     * Extract dominant colors from an image using histogram analysis
     * @param {HTMLImageElement} img - Image element to analyze
     * @param {number} idx - Card index (for fallback)
     * @returns {{c1: number[], c2: number[]}} Two dominant RGB colors
     */
    function extractColors(img, idx) {
      try {
        // Downscale image for faster processing
        const MAX = 48;
        const ratio =
          img.naturalWidth && img.naturalHeight
            ? img.naturalWidth / img.naturalHeight
            : 1;
        const tw = ratio >= 1 ? MAX : Math.max(16, Math.round(MAX * ratio));
        const th = ratio >= 1 ? Math.max(16, Math.round(MAX / ratio)) : MAX;

        // Draw image to temporary canvas
        const canvas = document.createElement("canvas");
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, tw, th);
        const data = ctx.getImageData(0, 0, tw, th).data;

        // Create 2D histogram bins (hue × saturation)
        const H_BINS = 36; // 10° hue increments
        const S_BINS = 5; // 20% saturation increments
        const SIZE = H_BINS * S_BINS;
        const wSum = new Float32Array(SIZE); // Weighted pixel count
        const rSum = new Float32Array(SIZE); // Weighted red sum
        const gSum = new Float32Array(SIZE); // Weighted green sum
        const bSum = new Float32Array(SIZE); // Weighted blue sum

        // Analyze each pixel
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3] / 255;
          if (a < 0.05) continue; // Skip transparent pixels

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const [h, s, l] = rgbToHsl(r, g, b);

          // Skip near-white, near-black, and desaturated colors
          if (l < 0.1 || l > 0.92 || s < 0.08) continue;

          // Weight by saturation and mid-tone preference
          const w = a * (s * s) * (1 - Math.abs(l - 0.5) * 0.6);

          // Calculate bin indices
          const hi = Math.max(
            0,
            Math.min(H_BINS - 1, Math.floor((h / 360) * H_BINS))
          );
          const si = Math.max(0, Math.min(S_BINS - 1, Math.floor(s * S_BINS)));
          const bidx = hi * S_BINS + si;

          // Accumulate weighted values
          wSum[bidx] += w;
          rSum[bidx] += r * w;
          gSum[bidx] += g * w;
          bSum[bidx] += b * w;
        }

        // Find primary color (bin with highest weight)
        let pIdx = -1;
        let pW = 0;
        for (let i = 0; i < SIZE; i++) {
          if (wSum[i] > pW) {
            pW = wSum[i];
            pIdx = i;
          }
        }

        if (pIdx < 0 || pW <= 0) return fallbackFromIndex(idx);

        const pHue = Math.floor(pIdx / S_BINS) * (360 / H_BINS);

        // Find secondary color (sufficiently different hue)
        let sIdx = -1;
        let sW = 0;
        for (let i = 0; i < SIZE; i++) {
          const w = wSum[i];
          if (w <= 0) continue;

          const h = Math.floor(i / S_BINS) * (360 / H_BINS);
          let dh = Math.abs(h - pHue);
          dh = Math.min(dh, 360 - dh); // Shortest distance on color wheel

          if (dh >= 25 && w > sW) {
            // At least 25° different
            sW = w;
            sIdx = i;
          }
        }

        // Calculate weighted average RGB for a bin
        const avgRGB = (idx) => {
          const w = wSum[idx] || 1e-6;
          return [
            Math.round(rSum[idx] / w),
            Math.round(gSum[idx] / w),
            Math.round(bSum[idx] / w),
          ];
        };

        // Build primary color
        const [pr, pg, pb] = avgRGB(pIdx);
        let [h1, s1] = rgbToHsl(pr, pg, pb);
        s1 = Math.max(0.45, Math.min(1, s1 * 1.15)); // Boost saturation
        const c1 = hslToRgb(h1, s1, 0.5);

        // Build secondary color
        let c2;
        if (sIdx >= 0 && sW >= pW * 0.6) {
          // Use distinct secondary color
          const [sr, sg, sb] = avgRGB(sIdx);
          let [h2, s2] = rgbToHsl(sr, sg, sb);
          s2 = Math.max(0.45, Math.min(1, s2 * 1.05));
          c2 = hslToRgb(h2, s2, 0.72);
        } else {
          // Use lighter version of primary
          c2 = hslToRgb(h1, s1, 0.72);
        }

        return { c1, c2 };
      } catch {
        return fallbackFromIndex(idx);
      }
    }

    /**
     * Extract colors from card images progressively
     * Only extracts from visible images initially, others are extracted on demand
     */
    function buildPalette() {
      // Initialize palette with fallback colors
      gradPalette = items.map((it, i) => fallbackFromIndex(i));

      // Extract colors only from visible images (first 5) to avoid blocking
      const VISIBLE_COUNT = Math.min(5, items.length);
      for (let i = 0; i < VISIBLE_COUNT; i++) {
        const img = items[i].el.querySelector("img");
        if (img && img.complete && img.naturalWidth > 0) {
          gradPalette[i] = extractColors(img, i);
        }
      }
    }

    /**
     * Extract color for a specific image index (called on demand)
     */
    function extractColorForIndex(idx) {
      if (idx < 0 || idx >= items.length) return;

      const img = items[idx].el.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) {
        gradPalette[idx] = extractColors(img, idx);
      }
    }

    /**
     * Update the target gradient colors
     */
    function updateGradientTarget(pal) {
      const to = {
        r1: pal.c1[0],
        g1: pal.c1[1],
        b1: pal.c1[2],
        r2: pal.c2[0],
        g2: pal.c2[1],
        b2: pal.c2[2],
      };

      // Animate transition with GSAP if available
      if (gsap) {
        bgFastUntil = performance.now() + 800; // High FPS for smooth transition
        gsap.to(gradCurrent, {
          ...to,
          duration: 0.45,
          ease: "power2.out",
        });
      } else {
        Object.assign(gradCurrent, to);
      }
    }

    /**
     * Set the active gradient based on the centered card
     * @param {number} idx - Card index
     */
    function setActiveGradient(idx) {
      if (!bgCtx || idx < 0 || idx >= items.length || idx === activeIndex)
        return;

      activeIndex = idx;

      // Check if we need to extract colors (if we only have fallback)
      const img = items[idx].el.querySelector("img");
      const currentPal = gradPalette[idx];
      const isFallback =
        !currentPal ||
        (currentPal.c1 &&
          currentPal.c1[0] === currentPal.c1[1] &&
          currentPal.c1[1] === currentPal.c1[2]);

      if (img && img.complete && img.naturalWidth > 0 && isFallback) {
        // Schedule extraction to avoid blocking the main thread during scroll
        const runExtraction = () => {
          extractColorForIndex(idx);
          // Only update if this is still the active card
          if (activeIndex === idx) {
            updateGradientTarget(gradPalette[idx]);
          }
        };

        if (window.requestIdleCallback) {
          window.requestIdleCallback(runExtraction);
        } else {
          setTimeout(runExtraction, 50);
        }
      }

      // Apply current palette immediately (might be fallback)
      const pal = gradPalette[idx] || {
        c1: [240, 240, 240],
        c2: [235, 235, 235],
      };

      updateGradientTarget(pal);
    }

    // ============================================================================
    // BACKGROUND RENDERING
    // ============================================================================

    /**
     * Resize background canvas to match viewport
     */
    function resizeBG() {
      if (!bgCanvas || !bgCtx) return;

      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = bgCanvas.clientWidth || stage.clientWidth;
      const h = bgCanvas.clientHeight || stage.clientHeight;
      const tw = Math.floor(w * dpr);
      const th = Math.floor(h * dpr);

      if (bgCanvas.width !== tw || bgCanvas.height !== th) {
        bgCanvas.width = tw;
        bgCanvas.height = th;
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    /**
     * Render animated gradient background
     */
    function drawBackground() {
      if (!bgCanvas || !bgCtx) return;

      const now = performance.now();
      const minInterval = now < bgFastUntil ? 16 : 33; // 60fps or 30fps

      // Throttle rendering based on transition state
      if (now - lastBgDraw < minInterval) {
        bgRAF = requestAnimationFrame(drawBackground);
        return;
      }

      lastBgDraw = now;
      resizeBG();

      const w = bgCanvas.clientWidth || stage.clientWidth;
      const h = bgCanvas.clientHeight || stage.clientHeight;

      // Fill base color
      bgCtx.fillStyle = "#f6f7f9";
      bgCtx.fillRect(0, 0, w, h);

      // Animate gradient centers
      const time = now * 0.0002;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const a1 = Math.min(w, h) * 0.35; // Amplitude for first gradient
      const a2 = Math.min(w, h) * 0.28; // Amplitude for second gradient

      // Calculate floating positions using trigonometry
      const x1 = cx + Math.cos(time) * a1;
      const y1 = cy + Math.sin(time * 0.8) * a1 * 0.4;
      const x2 = cx + Math.cos(-time * 0.9 + 1.2) * a2;
      const y2 = cy + Math.sin(-time * 0.7 + 0.7) * a2 * 0.5;

      const r1 = Math.max(w, h) * 0.75; // First gradient radius
      const r2 = Math.max(w, h) * 0.65; // Second gradient radius

      // Draw first radial gradient
      const g1 = bgCtx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(
        0,
        `rgba(${gradCurrent.r1},${gradCurrent.g1},${gradCurrent.b1},0.85)`
      );
      g1.addColorStop(1, "rgba(255,255,255,0)");
      bgCtx.fillStyle = g1;
      bgCtx.fillRect(0, 0, w, h);

      // Draw second radial gradient
      const g2 = bgCtx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(
        0,
        `rgba(${gradCurrent.r2},${gradCurrent.g2},${gradCurrent.b2},0.70)`
      );
      g2.addColorStop(1, "rgba(255,255,255,0)");
      bgCtx.fillStyle = g2;
      bgCtx.fillRect(0, 0, w, h);

      bgRAF = requestAnimationFrame(drawBackground);
    }

    /**
     * Start background animation loop
     */
    function startBG() {
      if (!bgCanvas || !bgCtx) return;
      cancelBG();
      bgRAF = requestAnimationFrame(drawBackground);
    }

    /**
     * Stop background animation loop
     */
    function cancelBG() {
      if (bgRAF) cancelAnimationFrame(bgRAF);
      bgRAF = null;
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Handle window resize
     */
    function onResize() {
      const prevStep = STEP || 1;
      const ratio = SCROLL_X / (items.length * prevStep);

      // Force recalculation of gap and dimensions
      measure();

      VW_HALF = window.innerWidth * 0.5;
      SCROLL_X = mod(ratio * TRACK, TRACK);

      // Force update of all transforms to maintain spacing
      updateCarouselTransforms();
      resizeBG();
    }

    // Mouse wheel scrolling
    function onWheel(e) {
      if (isEntering) return;
      e.preventDefault();

      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      vX += delta * WHEEL_SENS * 20;
    }
    stage.addEventListener("wheel", onWheel, { passive: false });

    // Prevent default drag behavior
    function onDragStart(e) {
      e.preventDefault();
    }
    stage.addEventListener("dragstart", onDragStart);

    // Drag state
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let lastDelta = 0;
    let startX = 0;
    let hasMoved = false;

    // Pointer down - start dragging
    function onPointerDown(e) {
      if (isEntering) return;
      if (e.target.closest(".frame")) return;

      dragging = true;
      lastX = e.clientX;
      startX = e.clientX;
      lastT = performance.now();
      lastDelta = 0;
      hasMoved = false;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("dragging");
    }
    stage.addEventListener("pointerdown", onPointerDown);

    // Pointer move - update scroll position
    function onPointerMove(e) {
      if (!dragging) return;

      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(1, now - lastT) / 1000;

      // Track if user has moved significantly
      if (Math.abs(e.clientX - startX) > 5) {
        hasMoved = true;
      }

      SCROLL_X = mod(SCROLL_X - dx * DRAG_SENS, TRACK);
      lastDelta = dx / dt; // Track velocity for momentum
      lastX = e.clientX;
      lastT = now;
    }
    stage.addEventListener("pointermove", onPointerMove);

    // Pointer up - apply momentum or handle click
    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      stage.releasePointerCapture(e.pointerId);

      // If user didn't move much, treat as click
      if (!hasMoved) {
        // Check if click was on a navigation button - if so, ignore
        const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
        if (clickedElement && clickedElement.closest(".carousel-nav")) {
          // Click was on navigation button, don't trigger card click
          stage.classList.remove("dragging");
          return;
        }

        // Find which card was clicked based on position
        const clickX = e.clientX;
        const clickY = e.clientY;

        // Check each card to see if click was on it
        for (let i = 0; i < items.length; i++) {
          const card = items[i].el;
          const rect = card.getBoundingClientRect();

          if (
            clickX >= rect.left &&
            clickX <= rect.right &&
            clickY >= rect.top &&
            clickY <= rect.bottom
          ) {
            if (onCardClick) {
              const author = authors[i];
              onCardClick(
                i,
                IMAGES[i],
                author?.name,
                author?.bio,
                author?.birth,
                author?.death,
                author?.nationality,
                author?.domain,
                author?.knownFor
              );
            }
            break;
          }
        }
      } else {
        vX = -lastDelta * DRAG_SENS; // Apply final velocity
      }

      stage.classList.remove("dragging");
    }
    stage.addEventListener("pointerup", onPointerUp);

    // Debounced resize handler
    function onDebouncedResize() {
      clearTimeout(onResize._t);
      onResize._t = setTimeout(onResize, 80);
    }
    window.addEventListener("resize", onDebouncedResize);

    // Pause animations when tab is hidden
    function onVisibilityChange() {
      if (document.hidden) {
        cancelCarousel();
        cancelBG();
      } else {
        startCarousel();
        startBG();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // ============================================================================
    // INITIALIZATION & ENTRY ANIMATION
    // ============================================================================

    /**
     * Subtle entry animation for visible cards
     * @param {Array} visibleCards - Cards to animate
     */
    async function animateEntry(visibleCards) {
      // Skip animation if images are still loading - just show cards
      const imagesLoading = visibleCards.some(({ item }) => {
        const img = item.el.querySelector("img");
        return img && !img.complete;
      });

      if (imagesLoading) {
        // Just set final positions without animation
        visibleCards.forEach(({ item, screenX }) => {
          const { transform } = transformForScreenX(screenX);
          item.el.style.transform = transform;
          item.el.style.opacity = "1";
        });
        return;
      }

      // Subtle fade-in animation only
      await new Promise((r) => requestAnimationFrame(r));

      visibleCards.forEach(({ item, screenX }, idx) => {
        const { transform } = transformForScreenX(screenX);

        // Start with final position but invisible
        item.el.style.transform = transform;
        item.el.style.opacity = "0";

        // Simple fade-in with slight delay
        setTimeout(() => {
          item.el.style.transition = "opacity 0.3s ease-out";
          item.el.style.opacity = "1";
        }, idx * 20);
      });

      // Wait for fade-in to complete
      await new Promise((resolve) => {
        setTimeout(resolve, visibleCards.length * 20 + 300);
      });
    }

    /**
     * Initialize the carousel application
     */
    async function init() {
      // Preload images for faster loading
      preloadImageLinks(IMAGES);

      // Create DOM elements
      createCards();
      measure();
      updateCarouselTransforms();
      stage.classList.add("carousel-mode");

      // Wait for all images to load
      await waitForImages();

      // Decode images to prevent jank
      await decodeAllImages();

      // Force browser to paint images
      items.forEach((it) => {
        const img = it.el.querySelector("img");
        if (img) void img.offsetHeight;
      });

      // Extract colors from images for gradients
      buildPalette();

      // Find and set initial centered card
      const half = TRACK / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;
        const d = Math.abs(pos);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      }

      setActiveGradient(closestIdx);

      // Preload nearby images for initial view
      preloadNearbyImages(closestIdx);

      // Initialize background canvas
      resizeBG();
      if (bgCtx) {
        const w = bgCanvas.clientWidth || stage.clientWidth;
        const h = bgCanvas.clientHeight || stage.clientHeight;
        bgCtx.fillStyle = "#f6f7f9";
        bgCtx.fillRect(0, 0, w, h);
      }

      // Skip warmup compositing to avoid visible scrolling animation
      // GPU compositing will happen naturally during first interaction

      // Wait for browser idle time
      if ("requestIdleCallback" in window) {
        await new Promise((r) => requestIdleCallback(r, { timeout: 100 }));
      }

      // Start background animation
      startBG();
      await new Promise((r) => setTimeout(r, 100)); // Let background settle

      // Prepare entry animation for visible cards
      const viewportWidth = window.innerWidth;
      const visibleCards = [];

      for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;

        const screenX = pos;
        if (Math.abs(screenX) < viewportWidth * 0.6) {
          visibleCards.push({ item: items[i], screenX, index: i });
        }
      }

      // Sort cards left to right
      visibleCards.sort((a, b) => a.screenX - b.screenX);

      // Hide loader
      if (loader) loader.classList.add("loader--hide");

      // Animate cards entering
      await animateEntry(visibleCards);

      // Enable user interaction
      isEntering = false;

      // Start main carousel loop
      startCarousel();
    }

    // ============================================================================
    // START APPLICATION
    // ============================================================================

    init();

    // Navigation controls are already set up above, just ensure they're updated
    // The ref is already pointing to the correct function with closure access

    return () => {
      cancelCarousel();
      cancelBG();
      if (rafId) cancelAnimationFrame(rafId);
      if (bgRAF) cancelAnimationFrame(bgRAF);

      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("dragstart", onDragStart);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onDebouncedResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      carouselControlsRef.current = null;
    };
  }, [onCardClick]);

  // Navigation handlers - direct access for Firefox compatibility
  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    if (carouselControlsRef.current?.navigate) {
      carouselControlsRef.current.navigate("prev");
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();

    if (carouselControlsRef.current?.navigate) {
      carouselControlsRef.current.navigate("next");
    }
  };

  return (
    <div className="stage" ref={stageRef}>
      <canvas id="bg" ref={bgRef} className="bg-canvas"></canvas>

      <div id="loader" ref={loaderRef}>
        Loading...
      </div>

      <div id="cards" ref={cardsRef}></div>

      <button
        className="carousel-nav carousel-nav--prev carousel-nav--mobile-only"
        onClick={handlePrev}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        aria-label="Précédent"
        type="button"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        className="carousel-nav carousel-nav--next carousel-nav--mobile-only"
        onClick={handleNext}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        aria-label="Suivant"
        type="button"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
