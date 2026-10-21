export function setupCarouselEvents({
  stage,
  authors,
  images,
  items,
  wheelSens,
  dragSens,
  prefersReducedMotion,
  onCardClick,
  onResize,
  cancelCarousel,
  startCarousel,
  getScrollX,
  setScrollX,
  getTrack,
  getVx,
  setVx,
  mod,
}) {
  function onWheel(e) {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const wheelFactor = Math.min(Math.abs(delta), 100) * Math.sign(delta);
    setVx(getVx() + wheelFactor * wheelSens * 10);
  }
  stage.addEventListener("wheel", onWheel, { passive: true });

  function onDragStart(e) {
    e.preventDefault();
  }
  stage.addEventListener("dragstart", onDragStart);

  let isHovered = false;
  function onMouseEnter() {
    if (!prefersReducedMotion) isHovered = true;
  }
  function onMouseLeave() {
    if (!prefersReducedMotion) isHovered = false;
  }
  stage.addEventListener("mouseenter", onMouseEnter);
  stage.addEventListener("mouseleave", onMouseLeave);

  let dragging = false;
  let lastX = 0;
  let lastT = 0;
  let lastDelta = 0;
  let startX = 0;
  let hasMoved = false;

  function onPointerDown(e) {
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

  function onPointerMove(e) {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = Math.max(1, now - lastT) / 1000;

    if (Math.abs(e.clientX - startX) > 5) {
      hasMoved = true;
    }

    const currentTrack = getTrack();
    setScrollX(mod(getScrollX() - dx * dragSens * 15, currentTrack));
    lastDelta = dx / dt;
    lastX = e.clientX;
    lastT = now;
  }
  stage.addEventListener("pointermove", onPointerMove);

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    try {
      stage.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (!hasMoved) {
      const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
      if (clickedElement && clickedElement.closest(".carousel-nav")) {
        stage.classList.remove("dragging");
        return;
      }

      for (let i = 0; i < items.length; i++) {
        const card = items[i].el;
        const rect = card.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          if (onCardClick) {
            const author = authors[i];
            onCardClick(
              i,
              images[i],
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
    } else if (!prefersReducedMotion) {
      setVx(-lastDelta * dragSens * 15);
    }
    stage.classList.remove("dragging");
  }
  stage.addEventListener("pointerup", onPointerUp);

  function onPointerCancel(e) {
    if (!dragging) return;
    dragging = false;
    try {
      stage.releasePointerCapture(e.pointerId);
    } catch (_) {}
    stage.classList.remove("dragging");
  }
  stage.addEventListener("pointercancel", onPointerCancel);

  function onDebouncedResize() {
    clearTimeout(onResize._t);
    onResize._t = setTimeout(onResize, 80);
  }
  window.addEventListener("resize", onDebouncedResize);

  function onVisibilityChange() {
    if (document.hidden) {
      cancelCarousel();
    } else {
      startCarousel();
    }
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  return {
    isHovered: () => isHovered,
    cleanup: () => {
      clearTimeout(onResize._t);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("dragstart", onDragStart);
      stage.removeEventListener("mouseenter", onMouseEnter);
      stage.removeEventListener("mouseleave", onMouseLeave);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("resize", onDebouncedResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    },
  };
}
