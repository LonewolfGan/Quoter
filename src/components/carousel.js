import { useEffect, useRef } from "react";
import authors from "../assets/authors";
import {
  mod,
  GAP,
  getResponsiveCardDimensions,
  transformForScreenX,
} from "./carousel/carouselMath";
import { createCards, preloadNearbyImages } from "./carousel/cardFactory";
import { setupCarouselEvents } from "./carousel/carouselEvents";

export function Carousel3D({ onCardClick }) {
  const stageRef = useRef(null);
  const cardsRef = useRef(null);
  const loaderRef = useRef(null);
  const carouselControlsRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const cardsRoot = cardsRef.current;
    const loader = loaderRef.current;
    if (!stage || !cardsRoot) return undefined;

    const IMAGES = authors.map((author) => author.image);
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const FRICTION = isMobile ? 0.9 : 0.92;
    const WHEEL_SENS = isMobile ? 0.3 : 0.8;
    const DRAG_SENS = isMobile ? 0.4 : 0.8;
    const AUTO_SPEED = isMobile ? 120 : 150;

    const items = [];
    let CARD_W = 350;
    let CARD_H = 450;
    let STEP = CARD_W + GAP;
    let TRACK = 0;
    let SCROLL_X = 0;
    let VW_HALF = window.innerWidth * 0.5;
    let vX = 0;
    let activeIndex = -1;
    let rafId = null;
    let lastTime = 0;

    function measure() {
      const { w, h } = getResponsiveCardDimensions();
      if (Math.abs(w - CARD_W) > 0.5 || Math.abs(h - CARD_H) > 0.5) {
        CARD_W = w;
        CARD_H = h;
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
      STEP = CARD_W + GAP;
      TRACK = items.length * STEP;
      items.forEach((it, i) => {
        it.x = i * STEP;
      });
    }

    function updateCarouselTransforms() {
      const half = TRACK / 2;
      let closestIdx = -1;
      let closestDist = Infinity;

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        let pos = it.x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;

        const dist = Math.abs(pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }

        const { transform, z } = transformForScreenX(pos, VW_HALF);
        it.el.style.transform = transform;
        it.el.style.zIndex = String(1000 + Math.round(z));
      }

      if (closestIdx !== activeIndex) {
        activeIndex = closestIdx;
        preloadNearbyImages({
          items,
          images: IMAGES,
          centerIndex: closestIdx,
          isMobile,
          mod,
        });
      }
    }

    function tick(now) {
      if (!lastTime) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!prefersReducedMotion) {
        vX *= Math.pow(FRICTION, dt * 60);
        if (Math.abs(vX) < 0.01) vX = 0;

        let autoSpeed = AUTO_SPEED;
        if (eventController.isHovered()) autoSpeed = 0;
        const totalVX = vX + autoSpeed;
        SCROLL_X = mod(SCROLL_X + totalVX * dt, TRACK);
      }

      updateCarouselTransforms();
      rafId = requestAnimationFrame(tick);
    }

    function startCarousel() {
      cancelCarousel();
      lastTime = 0;
      rafId = requestAnimationFrame((t) => {
        updateCarouselTransforms();
        tick(t);
      });
    }

    function cancelCarousel() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function onResize() {
      const prevStep = STEP || 1;
      const ratio = SCROLL_X / (items.length * prevStep);
      measure();
      VW_HALF = window.innerWidth * 0.5;
      SCROLL_X = mod(ratio * TRACK, TRACK);
      updateCarouselTransforms();
    }

    function navigateCarousel(direction) {
      const delta = direction === "next" ? 1 : -1;
      const targetDistance = STEP || CARD_W + GAP;
      const requiredVelocity = targetDistance * (1 - FRICTION) * 60;
      vX += delta * requiredVelocity;
    }

    carouselControlsRef.current = { navigate: navigateCarousel };

    const eventController = setupCarouselEvents({
      stage,
      authors,
      images: IMAGES,
      items,
      wheelSens: WHEEL_SENS,
      dragSens: DRAG_SENS,
      prefersReducedMotion,
      onCardClick,
      onResize,
      cancelCarousel,
      startCarousel,
      getScrollX: () => SCROLL_X,
      setScrollX: (val) => {
        SCROLL_X = val;
      },
      getTrack: () => TRACK,
      getVx: () => vX,
      setVx: (val) => {
        vX = val;
      },
      mod,
    });

    const dims = getResponsiveCardDimensions();
    CARD_W = dims.w;
    CARD_H = dims.h;
    STEP = CARD_W + GAP;

    createCards({
      cardsRoot,
      images: IMAGES,
      isMobile,
      cardW: CARD_W,
      cardH: CARD_H,
      step: STEP,
      items,
    });

    measure();
    updateCarouselTransforms();
    stage.classList.add("carousel-mode");
    if (loader) loader.classList.add("loader--hide");
    startCarousel();

    return () => {
      cancelCarousel();
      eventController.cleanup();
      carouselControlsRef.current = null;
    };
  }, [onCardClick]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    carouselControlsRef.current?.navigate?.("prev");
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    carouselControlsRef.current?.navigate?.("next");
  };

  return (
    <div className="stage" ref={stageRef}>
      <div id="loader" ref={loaderRef}>
        Loading...
      </div>
      <div id="cards" ref={cardsRef}></div>
      <button
        className="carousel-nav carousel-nav--prev"
        onClick={handlePrev}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        aria-label="Précédent"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        className="carousel-nav carousel-nav--next"
        onClick={handleNext}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        aria-label="Suivant"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
