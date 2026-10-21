export function createCards({
  cardsRoot,
  images,
  isMobile,
  cardW,
  cardH,
  step,
  items,
}) {
  cardsRoot.innerHTML = "";
  items.length = 0;

  const fragment = document.createDocumentFragment();

  images.forEach((src, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.width = `${cardW}px`;
    card.style.height = `${cardH}px`;
    card.style.willChange = "transform, filter";

    const img = new Image();
    img.className = "card__img";
    img.decoding = "async";
    img.draggable = false;
    img.width = cardW;
    img.height = cardH;
    img.setAttribute("width", cardW);
    img.setAttribute("height", cardH);

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
    items.push({ el: card, x: i * step, imageLoaded: false });
  });

  cardsRoot.appendChild(fragment);
}

export function preloadNearbyImages({
  items,
  images,
  centerIndex,
  isMobile,
  mod,
}) {
  const PRELOAD_RANGE = isMobile ? 2 : 4;

  for (let offset = -PRELOAD_RANGE; offset <= PRELOAD_RANGE; offset++) {
    const idx = mod(centerIndex + offset, items.length);
    const item = items[idx];
    if (!item) continue;

    const img = item.el.querySelector("img");
    if (!img) continue;

    if (img.complete) {
      item.imageLoaded = true;
      continue;
    }

    const dist = Math.abs(offset);
    img.fetchPriority = dist <= 1 ? "high" : "auto";

    if (!img.src || img.src === "") {
      if (idx >= 0 && idx < images.length) {
        img.src = images[idx];
      }
    }

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
