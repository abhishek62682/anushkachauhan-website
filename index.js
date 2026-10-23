// Tridhaara homepage behaviour: chroma-key background tiles, banner/hero
// rotation, category + product carousels, "shop the look" widget, product
// card navigation, newsletter form, and Lenis smooth scroll.

function chromaKey(img, options) {
  options = options || {};
  var padXRatio = options.padXRatio != null ? options.padXRatio : 0.18;
  var padYRatio = options.padYRatio != null ? options.padYRatio : 0.18;
  var backgroundRepeat = options.backgroundRepeat || "repeat";
  var backgroundSize = options.backgroundSize || "160px auto";
  var useTileCanvas = !!options.useTileCanvas;

  var src = img.getAttribute("data-src");
  var loader = new Image();
  loader.crossOrigin = "anonymous";
  loader.onload = function () {
    var c = document.createElement("canvas");
    c.width = loader.naturalWidth;
    c.height = loader.naturalHeight;
    var ctx = c.getContext("2d");
    ctx.drawImage(loader, 0, 0);
    var w = c.width,
      h = c.height;
    var data = ctx.getImageData(0, 0, w, h);
    var d = data.data;

    var sample = ctx.getImageData(10, 10, 1, 1).data;
    var r0 = sample[0],
      g0 = sample[1],
      b0 = sample[2];

    for (var i = 0; i < d.length; i += 4) {
      var dr = d[i] - r0,
        dg = d[i + 1] - g0,
        db = d[i + 2] - b0;
      var dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist < 30) d[i + 3] = 0;
      else if (dist < 55) d[i + 3] = Math.round((255 * (dist - 30)) / (55 - 30));
    }
    ctx.putImageData(data, 0, 0);

    var minX = w,
      minY = h,
      maxX = 0,
      maxY = 0;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var a = d[(y * w + x) * 4 + 3];
        if (a > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    var padX = Math.round((maxX - minX) * padXRatio);
    var padY = Math.round((maxY - minY) * padYRatio);
    minX = Math.max(0, minX - padX);
    minY = Math.max(0, minY - padY);
    maxX = Math.min(w - 1, maxX + padX);
    maxY = Math.min(h - 1, maxY + padY);

    var cw = Math.max(1, maxX - minX + 1);
    var ch = Math.max(1, maxY - minY + 1);
    var crop = document.createElement("canvas");
    crop.width = cw;
    crop.height = ch;
    crop.getContext("2d").drawImage(c, minX, minY, cw, ch, 0, 0, cw, ch);

    if (useTileCanvas && img.hasAttribute("data-tile-bg")) {
      img.src = crop.toDataURL("image/png");
    }

    var target = document.querySelector(img.getAttribute("data-tile-bg"));
    if (target) {
      target.style.backgroundImage = "url(" + crop.toDataURL("image/png") + ")";
      target.style.backgroundRepeat = backgroundRepeat;
      target.style.backgroundSize = backgroundSize;
    }
  };
  loader.src = src;
}

function initChromaKeys() {
  document.querySelectorAll(".trending img.chroma-key").forEach(function (img) {
    chromaKey(img, { padXRatio: 0.18, padYRatio: 0.18, backgroundRepeat: "repeat", backgroundSize: "160px auto", useTileCanvas: true });
  });
  document.querySelectorAll(".look img.chroma-key").forEach(function (img) {
    chromaKey(img, { padXRatio: 0.03, padYRatio: 0.03, backgroundRepeat: "repeat", backgroundSize: "140px auto" });
  });
  document.querySelectorAll(".footer img.chroma-key").forEach(function (img) {
    chromaKey(img, { padXRatio: 0.18, padYRatio: 0.02, backgroundRepeat: "repeat-x", backgroundSize: "auto 100%" });
  });
}

function initBannerRotation() {
  const texts = document.querySelectorAll(".banner-text");
  if (!texts.length) return;
  let i = 0;
  texts[0].classList.add("active");
  setInterval(() => {
    texts[i].classList.remove("active");
    texts[i].classList.add("exit");
    const prev = texts[i];
    setTimeout(() => prev.classList.remove("exit"), 600);
    i = (i + 1) % texts.length;
    texts[i].classList.add("active");
  }, 3000);
}

function initHeroSlides() {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;
  let h = 0;
  setInterval(() => {
    slides[h].classList.remove("active");
    h = (h + 1) % slides.length;
    slides[h].classList.add("active");
  }, 4000);
}

function initCategoryCarousel() {
  const catTrack = document.getElementById("catTrack");
  if (!catTrack) return;
  const step = () => catTrack.clientWidth * 0.5;
  document.getElementById("catPrev").onclick = () =>
    catTrack.scrollBy({ left: -step(), behavior: "smooth" });
  document.getElementById("catNext").onclick = () =>
    catTrack.scrollBy({ left: step(), behavior: "smooth" });
}

function initShopTheLook() {
  const lookSlides = document.querySelectorAll(".look-slide");
  const lookDots = document.querySelectorAll(".look-dot");
  const lookSpots = document.querySelectorAll(".hotspot");
  if (!lookSlides.length) return;
  const lookData = [
    { name: "Olive Handloom Cotton Saree", price: "INR 6,900.00" },
    { name: "Black Handloom Silk Saree", price: "INR 11,500.00" },
  ];
  let l = 0;
  const showLook = (n) => {
    l = (n + lookSlides.length) % lookSlides.length;
    lookSlides.forEach((el, k) => el.classList.toggle("active", k === l));
    lookDots.forEach((el, k) => el.classList.toggle("active", k === l));
    lookSpots.forEach((el, k) => el.classList.toggle("active", k === l));
    document.getElementById("lookName").textContent = lookData[l].name;
    document.getElementById("lookPrice").textContent = lookData[l].price;
  };
  lookDots.forEach((d, k) => (d.onclick = () => showLook(k)));
  lookSpots.forEach((d) => (d.onclick = () => showLook(Number(d.dataset.index))));
}

function initProductSliders() {
  document.querySelectorAll(".prod-slider").forEach((sl) => {
    const track = sl.querySelector(".prod-grid");
    const by = () => track.clientWidth * 0.8;
    sl.querySelector(".prod-prev").onclick = () =>
      track.scrollBy({ left: -by(), behavior: "smooth" });
    sl.querySelector(".prod-next").onclick = () =>
      track.scrollBy({ left: by(), behavior: "smooth" });
  });
}

function initProductCardLinks() {
  document.querySelectorAll(".prod-card").forEach((card) => {
    const go = () => {
      const bg = card.querySelector(".prod-img").style.backgroundImage;
      const m = bg.match(/url\(["']?(.*?)["']?\)$/);
      const params = new URLSearchParams({
        name: card.querySelector(".prod-name").textContent.trim(),
        price: card
          .querySelector(".prod-price")
          .textContent.replace(/\s+/g, " ")
          .trim(),
        img: m ? m[1] : "",
      });
      const gal = card.querySelector(".prod-img").dataset.gallery;
      if (gal) params.set("gallery", gal);
      location.href = "product.html?" + params.toString();
    };
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest(".prod-wish, .prod-cart")) return;
      go();
    });
  });
}

function initSubscribeForm() {
  const form = document.querySelector(".subscribe-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.reset();
  });
}

function initLenis() {
  if (typeof Lenis === "undefined") return;
  var lenis = new Lenis({
    duration: 1.1,
    easing: function (t) {
      return Math.min(1, 1.001 - Math.pow(2, -10 * t));
    },
    smoothWheel: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

initChromaKeys();
initBannerRotation();
initHeroSlides();
initCategoryCarousel();
initShopTheLook();
initProductSliders();
initProductCardLinks();
initSubscribeForm();
initLenis();
