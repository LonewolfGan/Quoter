import React, { useEffect, useRef } from "react";
import authors from "../assets/authors";
import "../styles/carousel.css";

export function Carousel3D({ onCardClick }) {
  const stageRef = useRef(null);
  const cardsRef = useRef(null);
  const loaderRef = useRef(null);
  const carouselControlsRef = useRef(null); // Ref to expose navigation controls

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 768 : false;
    const stage = stageRef.current;
    const cardsRoot = cardsRef.current;
    const loader = loaderRef.current;

    const IMAGES = authors.map((author) => author.image);
    // Keep reference to authors array for accessing names

    /*
  Infinite Gradient 3D Carousel
  A smooth, infinite-scrolling 3D carousel
*/

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    // Physics constants
    const FRICTION = 0.92; // Less friction for more fluid movement
    const WHEEL_SENS = 0.8; // Increased sensitivity
    const DRAG_SENS = 18; // Increased drag sensitivity
    const AUTO_SPEED = prefersReducedMotion ? 0 : 150; // Auto-scroll speed

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

    // Layout measurements
    let CARD_W = 350; // Card width (measured dynamically)
    let CARD_H = 450; // Card height (measured dynamically)
    let STEP = CARD_W + GAP; // Distance between card centers
    let TRACK = 0; // Total carousel track length
    let SCROLL_X = 0; // Current scroll position
    let VW_HALF = window.innerWidth * 0.5;

    // Responsive dimensions
    function getResponsiveCardDimensions() {
      const width = window.innerWidth;
      if (width < 768) {
        // Mobile: 70vw width, maintain aspect ratio ~0.78
        const w = Math.round(width * 0.7);
        const h = Math.round(w * 1.3);
        return { w, h };
      }
      return { w: 350, h: 450 }; // Desktop defaults
    }

    // Physics state
    let vX = 0; // Velocity in X direction
    let isHovered = false; // Pause auto-scroll on hover

    // Navigation function that will be exposed via ref
    function navigateCarousel(direction) {
      // Allow navigation immediately
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
    let lastTime = 0; // Last frame timestamp

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
        card.style.willChange = "transform, filter";

        const img = new Image();
        img.className = "card__img";
        img.decoding = "async";
        img.draggable = false;
        img.width = CARD_W;
        img.height = CARD_H;
        img.setAttribute("width", CARD_W);
        img.setAttribute("height", CARD_H);

        // Defer priority; increase when near the viewport
        img.loading = "lazy";
        img.fetchPriority = "low";
        const file = src.split("/").pop();
        const sm = `/authors/320/${file}`;
        const md = `/authors/640/${file}`;
        img.src = isMobile ? sm : md;
        img.srcset = `${sm} 320w, ${md} 640w`;
        img.sizes = "(max-width: 768px) 70vw, 350px";

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
          { once: true },
        );

        img.addEventListener(
          "error",
          () => {
            img.style.opacity = "0.3";
            img.style.backgroundColor = "#e8e8e8";
          },
          { once: true },
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
      // Reduce preload range on mobile to prevent blocking
      const PRELOAD_RANGE = isMobile ? 2 : 4;

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
        const dist = Math.abs(offset);
        if (dist <= 1) {
          img.fetchPriority = "high";
        } else {
          img.fetchPriority = "auto";
        }

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
            { once: true },
          );
        }
      }
    }

    /**
     * Measure card dimensions and calculate layout
     */
    function measure() {
      // Get responsive dimensions
      const { w, h } = getResponsiveCardDimensions();

      const dimsChanged =
        Math.abs(w - CARD_W) > 0.5 || Math.abs(h - CARD_H) > 0.5;

      if (dimsChanged) {
        CARD_W = w;
        CARD_H = h;

        // Update all existing cards with new dimensions
        items.forEach((item) => {
          if (item.el) {
            item.el.style.width = `${CARD_W}px`;
            item.el.style.height = `${CARD_H}px`;
            const img = item.el.querySelector("img");
            if (img) {
              img.width = CARD_W;
              img.height = CARD_H;
              img.setAttribute("width", CARD_W);
              img.setAttribute("height", CARD_H);
            }
          }
        });
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

      // Apply transforms to all cards
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const pos = positions[i];

        // Optimization: Use visibility instead of display to prevent layout thrashing
        // Only render cards within reasonable view distance
        if (Math.abs(pos) > VW_HALF * 3) {
          if (it.el.style.visibility !== "hidden")
            it.el.style.visibility = "hidden";
        } else {
          if (it.el.style.visibility === "hidden")
            it.el.style.visibility = "visible";
        }

        const { transform, z } = transformForScreenX(pos);

        it.el.style.transform = transform;
        it.el.style.zIndex = String(1000 + Math.round(z)); // Higher z-index for cards in front

        // Optimization: Remove blur on mobile or significantly reduce it
        // Blur is extremely expensive on mobile GPUs
        /*
        const norm = Math.max(-1, Math.min(1, pos / VW_HALF));
        const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
        const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
        it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
        */
      }

      // Update gradient if active card changed
      if (closestIdx !== activeIndex) {
        activeIndex = closestIdx;
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

      // Apply auto-scroll if not interacting
      if (!dragging && !isHovered && AUTO_SPEED > 0) {
        SCROLL_X = mod(SCROLL_X + AUTO_SPEED * dt, TRACK);
      }

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
    }

    // Mouse wheel scrolling
    function onWheel(e) {
      if (prefersReducedMotion) return;
      // Allow wheel immediately
      e.preventDefault();

      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      // Limit wheel velocity to prevent massive jumps
      const wheelFactor = Math.min(Math.abs(delta), 100) * Math.sign(delta);
      vX += wheelFactor * WHEEL_SENS * 10;
    }
    stage.addEventListener("wheel", onWheel, { passive: false });

    // Prevent default drag behavior
    function onDragStart(e) {
      e.preventDefault();
    }
    stage.addEventListener("dragstart", onDragStart);

    // Hover handling for auto-pause
    function onMouseEnter() {
      if (prefersReducedMotion) return;
      isHovered = true;
    }
    stage.addEventListener("mouseenter", onMouseEnter);

    function onMouseLeave() {
      if (prefersReducedMotion) return;
      isHovered = false;
    }
    stage.addEventListener("mouseleave", onMouseLeave);

    // Drag state
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let lastDelta = 0;
    let startX = 0;
    let hasMoved = false;

    // Pointer down - start dragging
    function onPointerDown(e) {
      // Allow interaction immediately
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
      if (prefersReducedMotion) return;
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
                author?.knownFor,
              );
            }
            break;
          }
        }
      } else if (!prefersReducedMotion) {
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
      } else {
        if (!prefersReducedMotion) startCarousel();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // ============================================================================
    // INITIALIZATION & ENTRY ANIMATION
    // ============================================================================

    /**
     * Initialize the carousel application
     */
    async function init() {
      // 1. Initialize responsive dimensions immediately
      const dims = getResponsiveCardDimensions();
      CARD_W = dims.w;
      CARD_H = dims.h;
      STEP = CARD_W + GAP;

      // 2. Create DOM elements
      createCards();
      measure();
      updateCarouselTransforms();
      stage.classList.add("carousel-mode");

      // 3. START IMMEDIATELY
      if (loader) loader.classList.add("loader--hide");
      if (!prefersReducedMotion) startCarousel();

      // 4. Animate entry in parallel (non-blocking)
      const viewportWidth = window.innerWidth;
      const visibleCards = [];
      for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        // Simple wrap check for visibility
        if (pos < -TRACK / 2) pos += TRACK;
        if (pos > TRACK / 2) pos -= TRACK;
        if (Math.abs(pos) < viewportWidth * 0.6) {
          visibleCards.push({ item: items[i], screenX: pos, index: i });
        }
      }
      visibleCards.sort((a, b) => a.screenX - b.screenX);

      // Simple fade in for initial cards (disabled for reduced motion)
      if (!prefersReducedMotion) {
        visibleCards.forEach(({ item }, idx) => {
          item.el.style.opacity = "0";
          setTimeout(() => {
            item.el.style.transition = "opacity 0.5s ease-out";
            item.el.style.opacity = "1";
          }, idx * 50);
        });
      } else {
        visibleCards.forEach(({ item }) => {
          item.el.style.opacity = "1";
        });
      }

      // 5. Initial setup without blocking
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

      activeIndex = closestIdx;
      // Trigger preload for visible items only (handled by updateCarouselTransforms too, but good to be explicit)
      preloadNearbyImages(closestIdx);
    }

    // ============================================================================
    // START APPLICATION
    // ============================================================================

    init();

    // Navigation controls are already set up above, just ensure they're updated
    // The ref is already pointing to the correct function with closure access

    return () => {
      cancelCarousel();
      if (rafId) cancelAnimationFrame(rafId);

      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("dragstart", onDragStart);
      stage.removeEventListener("mouseenter", onMouseEnter);
      stage.removeEventListener("mouseleave", onMouseLeave);
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
