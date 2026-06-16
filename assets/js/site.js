const projects = [
  {
    title: "Jeep Rebuild",
    year: 2010,
    slug: "jeep-rebuild",
    image: "assets/projects/Jeep/IMG_3698.jpg",
    summary: "An early rebuild focused on teardown discipline, mechanical sequencing, and bringing a worn platform back to life.",
    tools: ["Mechanical repair", "Diagnostics", "Fabrication", "Assembly"]
  },
  {
    title: "Chevelle Restoration",
    year: 2020,
    slug: "chevelle-restoration",
    image: "assets/projects/Chevelle/hero.PNG",
    summary: "A long-form restoration focused on body prep, mechanical patience, and preserving the car's character.",
    tools: ["Restoration", "Sheet metal", "Paint/body", "Detailing"]
  },
  {
    title: "Tire Modeling Analysis",
    year: 2025,
    slug: "tire-modeling-analysis",
    image: "assets/projects/tire model anaylsis/hero.png",
    summary: "A vehicle dynamics study focused on tire behavior, suspension inputs, and model validation.",
    tools: ["Vehicle dynamics", "Tire modeling", "Data analysis", "Validation"]
  },
  {
    title: "Skateboard Business",
    year: 2022,
    slug: "skateboard-business",
    image: "/assets/img/project-skateboard-business.svg",
    summary: "A small product venture combining making, brand presentation, photography, and direct customer feedback.",
    tools: ["Product design", "Photography", "Branding", "Sales"]
  },
  {
    title: "Miata",
    year: 2025,
    slug: "miata",
    image: "assets/projects/Miata/B2x0jnmEMgpV9Ec02Wjtg_61a1e7c4bd4b47218a7d2ad6ee8094f7.png",
    summary: "A lightweight sports-car project centered on maintenance, handling feel, and driver-focused refinement.",
    tools: ["Automotive repair", "Suspension", "Maintenance", "Testing"]
  },
  {
    title: "Sony A7iii Shutter Replacement",
    year: 2024,
    slug: "sony-a7iii-shutter-replacement",
    image: "assets/projects/sony-a7iii-shutter-replacement/hero.jpg",
    summary: "A precision repair project replacing a failed shutter assembly through careful disassembly and reassembly.",
    tools: ["Camera repair", "Electronics", "Precision tools", "Testing"]
  },
  {
    title: "Pursa MRK3 Assembly",
    year: 2025,
    slug: "pursa-mrk3-assembly",
    image: "assets/projects/Purse MK3/IMG_6284.JPG",
    summary: "A 3D-printer assembly and calibration project focused on alignment, tuning, and reliable output.",
    tools: ["3D printing", "Assembly", "Calibration", "Troubleshooting"]
  }
];

const featuredOrder = [
  "chevelle-restoration",
  "sony-a7iii-shutter-replacement",
  "tire-modeling-analysis",
  "miata"
];

const projectGrid = document.querySelector("[data-project-grid]");
const sortSelect = document.querySelector("[data-project-sort]");

function assetPath(path) {
  return document.body.dataset.depth === "project" ? `../${path}` : path;
}

function assetUrl(path) {
  return new URL(assetPath(path), document.baseURI).href;
}

function renderProjects(order = "custom") {
  if (!projectGrid) return;
  let sorted;
  if (order === "custom") {
    const featured = featuredOrder.map(slug => projects.find(p => p.slug === slug)).filter(Boolean);
    const rest = projects.filter(p => !featuredOrder.includes(p.slug));
    sorted = [...featured, ...rest];
  } else {
    sorted = [...projects].sort((a, b) => order === "asc" ? a.year - b.year : b.year - a.year);
  }
  projectGrid.innerHTML = sorted.map((project) => `
    <a class="project-tile" href="projects/${project.slug}.html" style="--tile-image: url('${assetUrl(project.image)}')" aria-label="Open ${project.title} project">
      <time datetime="${project.year}">${project.year}</time>
      <h2>${project.title}</h2>
      <p>${project.summary}</p>
    </a>
  `).join("");
}

if (sortSelect) {
  renderProjects(sortSelect.value);
  sortSelect.addEventListener("change", () => renderProjects(sortSelect.value));
}

const currentProject = projects.find((project) => project.slug === document.body.dataset.project) || null;

function projectHref(slug) {
  return `./${slug}.html`;
}

document.querySelectorAll("[data-project-menu]").forEach((menu) => {
  const current = document.body.dataset.project || "";
  menu.innerHTML = projects.map((project) => {
    const active = project.slug === current ? ' aria-current="page"' : "";
    return `<a href="${projectHref(project.slug)}"${active}>${project.title}</a>`;
  }).join("");
});

document.querySelectorAll("[data-project-tools]").forEach((target) => {
  if (!currentProject) return;
  target.innerHTML = currentProject.tools.map((tool) => `<span>${tool}</span>`).join("");
});

document.querySelectorAll("[data-project-hero], [data-project-image]").forEach((target) => {
  if (!currentProject) return;
  const imageUrl = assetUrl(currentProject.image);
  target.style.setProperty("--detail-image", `url('${imageUrl}')`);
  const container = target.closest(".project-detail") || target.parentElement;
  if (container) container.style.setProperty("--detail-image", `url('${imageUrl}')`);
});


function renderProjectGallery() {
  const gallery = document.querySelector('[data-project-gallery]');
  const manifestNode = document.querySelector('[data-project-gallery-manifest]');
  if (!gallery || !manifestNode) return;

  let manifest;
  try {
    manifest = JSON.parse(manifestNode.textContent);
  } catch (error) {
    console.error('Invalid project gallery manifest', error);
    return;
  }
  if (!manifest?.items?.length) {
    gallery.innerHTML = '';
    return;
  }

  gallery.innerHTML = manifest.items.map((item, index) => {
    const mediaUrl = assetUrl(item.src);
    const common = `class="gallery-media"`;
    const wrapperStyle = `--col-span:${item.colSpan}; --media-width:${item.width}; --media-height:${item.height};`;
    if (item.kind === 'video') {
      return `
        <figure class="gallery-item" data-gallery-item data-col-span="${item.colSpan}" style="${wrapperStyle}">
          <video ${common} autoplay muted loop playsinline controls preload="metadata" poster="${assetUrl(manifest.hero)}">
            <source src="${mediaUrl}" type="${mediaUrl.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4'}">
          </video>
        </figure>
      `;
    }
    return `
      <figure class="gallery-item" data-gallery-item data-col-span="${item.colSpan}" style="${wrapperStyle}">
        <img ${common} src="${mediaUrl}" alt="${currentProject ? currentProject.title : 'Project'} gallery media ${index + 1}" loading="lazy">
      </figure>
    `;
  }).join('');

  const videos = gallery.querySelectorAll('video');
  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    const playVideo = () => video.play().catch(() => {});
    video.addEventListener('loadedmetadata', playVideo, { once: true });
    playVideo();
  });

  const layoutGallery = () => {
    const styles = window.getComputedStyle(gallery);
    const rowHeight = parseFloat(styles.gridAutoRows) || 10;
    const gap = parseFloat(styles.rowGap || styles.gap) || 12;
    const columns = 3;
    const columnWidth = (gallery.clientWidth - gap * (columns - 1)) / columns;
    gallery.querySelectorAll('[data-gallery-item]').forEach((item) => {
      const colSpan = Number(item.dataset.colSpan || 1);
      const mediaWidth = Number(item.style.getPropertyValue('--media-width')) || 1;
      const mediaHeight = Number(item.style.getPropertyValue('--media-height')) || 1;
      const width = columnWidth * colSpan + gap * (colSpan - 1);
      const height = width * (mediaHeight / mediaWidth);
      const rowSpan = Math.max(1, Math.ceil((height + gap) / (rowHeight + gap)));
      item.style.setProperty('--row-span', String(rowSpan));
    });
  };

  const relayout = () => window.requestAnimationFrame(layoutGallery);
  gallery.querySelectorAll('img, video').forEach((media) => {
    media.addEventListener('loadeddata', relayout);
    media.addEventListener('loadedmetadata', relayout);
    media.addEventListener('load', relayout);
  });
  relayout();
  window.addEventListener('resize', relayout);
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initProjectHeroParallax() {
  const hero = document.querySelector('.project-hero-overlay');
  if (!hero || prefersReducedMotion) return;

  let ticking = false;
  const updateParallax = () => {
    const scrollOffset = window.scrollY * -0.18;
    const offset = Math.max(-160, Math.min(32, scrollOffset));
    hero.style.setProperty('--hero-parallax', `${offset}px`);
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  requestUpdate();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
}

function prepareRevealText() {
  document.querySelectorAll(".reveal-text").forEach((element) => {
    if (element.dataset.revealReady) return;
    const text = element.textContent.trim();
    if (!text) return;
    const chunks = text
      .replace(/\s+/g, " ")
      .split(/(?<=[.;:])\s+|,\s+(?=[a-zA-Z])/)
      .filter(Boolean);
    element.textContent = "";
    chunks.forEach((chunk) => {
      const line = document.createElement("span");
      line.className = "reveal-line";
      line.textContent = chunk;
      if (!/[\s ]$/.test(chunk)) line.appendChild(document.createTextNode(" "));
      element.appendChild(line);
    });
    element.dataset.revealReady = "true";
  });
}

function updateRevealText() {
  if (prefersReducedMotion) return;
  const viewport = window.innerHeight;
  document.querySelectorAll(".reveal-text").forEach((element) => {
    const rect = element.getBoundingClientRect();
    const lines = [...element.querySelectorAll(".reveal-line")];
    if (!lines.length) return;
    const start = viewport * 1.08;
    const end = viewport * 0.62;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    const visibleCount = Math.floor(progress * (lines.length + 0.98));
    lines.forEach((line, index) => {
      line.classList.toggle("is-visible", index < visibleCount && rect.bottom > viewport * 0.2);
    });
  });
}

function initExperienceTimeline() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const items = [...timeline.querySelectorAll('.timeline-item')];
  if (!items.length) return;

  // Inject bead + fill
  const fill = document.createElement('div');
  fill.className = 'timeline-fill';
  timeline.appendChild(fill);

  const bead = document.createElement('div');
  bead.className = 'timeline-bead';
  timeline.appendChild(bead);

  const OVERLAP = 0.25;
  const MOBILE_BP = 880;

  function isMobile() { return window.innerWidth <= MOBILE_BP; }

  // ── Stagger layout ───────────────────────────────────────────
  function applyStagger() {
    if (isMobile()) {
      items.forEach((item) => { item.style.marginTop = ''; });
      return;
    }
    items.forEach((item, i) => {
      if (i === 0) { item.style.marginTop = ''; return; }
      const overlap = items[i - 1].offsetHeight * OVERLAP;
      item.style.marginTop = `-${overlap}px`;
    });
  }

  // ── Smooth overdamped lerp bead ──────────────────────────────
  let beadY = 0;
  let rafId = null;

  function getBeadTarget() {
    const rect = timeline.getBoundingClientRect();
    return window.innerHeight / 2 - rect.top;
  }

  function tick() {
    const timelineH = timeline.offsetHeight;
    const target = getBeadTarget();

    // Overdamped lerp — smooth catch-up with no oscillation
    beadY += (target - beadY) * 0.065;

    const clamped = Math.max(0, Math.min(timelineH, beadY));
    fill.style.height = `${clamped}px`;
    bead.style.top = `${clamped}px`;

    // Visibility
    const inRange = target > 0 && target < timelineH;
    bead.classList.toggle('is-visible', inRange);

    // Item activation — compare bead's CURRENT absolute viewport Y to each tile centre
    const timelineTop = timeline.getBoundingClientRect().top;
    const beadAbsY = timelineTop + clamped;
    let anyActive = false;
    items.forEach((item) => {
      const r = item.getBoundingClientRect();
      const midY = r.top + item.offsetHeight / 2;
      const active = midY <= beadAbsY;
      item.classList.toggle('is-active', active);
      if (active) anyActive = true;
    });

    // Grow bead after passing first section
    bead.classList.toggle('has-passed', anyActive);

    // Keep animating while bead is moving or in range
    if (inRange || Math.abs(target - beadY) > 0.5) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  function startTick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  // ── Layout + events ──────────────────────────────────────────
  applyStagger();
  startTick();

  window.addEventListener('scroll', startTick, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { applyStagger(); startTick(); }, 80);
  });
}

// ── Education hero parallax ──────────────────────────────────────
function initEduHeroParallax() {
  const bg = document.getElementById('eduHeroBg');
  if (!bg) return;
  const section = bg.closest('.edu-hero');

  function update() {
    const rect = section.getBoundingClientRect();
    // Move bg at 35% of scroll speed relative to section position
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.175;
    bg.style.transform = `translateY(${offset}px)`;
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

// ── 3-D Project Carousel ─────────────────────────────────────────
function initCarousel() {
  const scene = document.getElementById('carouselScene');
  const ring = document.getElementById('carouselRing');
  if (!scene || !ring) return;

  const RADIUS = 352;
  const TILE_W = 264;
  const TILE_H = 310;
  const AUTO_SPEED = 0.000117; // rad / ms idle rotation

  // Build tiles from the global projects array
  const tiles = projects.map((project) => {
    const tile = document.createElement('div');
    tile.className = 'carousel-tile';
    tile.draggable = false;
    tile.innerHTML = `
      <div class="carousel-tile-img" style="background-image:url('${assetUrl(project.image)}')"></div>
      <div class="carousel-tile-info">
        <span class="carousel-tile-year">${project.year}</span>
        <span class="carousel-tile-title">${project.title}</span>
        <a class="carousel-tile-btn" href="projects/${project.slug}.html">View Project →</a>
      </div>`;
    ring.appendChild(tile);
    return tile;
  });

  const count = tiles.length;
  const step = (2 * Math.PI) / count;

  // State
  let angle = 0;
  let targetAngle = 0;
  let angVel = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartAngle = 0;
  let dragVel = 0;
  let lastDragX = 0;
  let lastDragTime = 0;
  let lastFrameTime = performance.now();
  let scrollBoost = 0;
  let isHovered = false;

  function isCarouselActive() {
    const r = scene.getBoundingClientRect();
    const cy = r.top + r.height / 2;
    return cy > 0 && cy < window.innerHeight;
  }

  // Update tile 3D positions
  function renderFrame(theta) {
    tiles.forEach((tile, i) => {
      const a = theta + step * i;
      const x = Math.sin(a) * RADIUS;
      const z = Math.cos(a) * RADIUS;
      const norm = (z / RADIUS + 1) / 2; // 0 = back, 1 = front
      const scale = 0.38 + 0.62 * norm;
      const opacity = 0.25 + 0.75 * norm;
      tile.style.transform =
        `translate3d(${x - TILE_W / 2}px,${-TILE_H / 2}px,${z}px) scale(${scale})`;
      tile.style.zIndex = Math.round(norm * 100);
      tile.style.opacity = opacity;
    });
  }

  // Hover slow-down — half speed while any tile is hovered
  tiles.forEach((tile) => {
    tile.addEventListener('mouseenter', () => { isHovered = true; });
    tile.addEventListener('mouseleave', () => { isHovered = false; });
  });

  // Scroll-speed boost — passive listener, no hijacking
  window.addEventListener('wheel', (e) => {
    const delta = e.deltaMode === 0 ? e.deltaY : e.deltaY * 30;
    scrollBoost += delta * 0.000012;
  }, { passive: true });

  // Drag / touch rotate with inertia
  function onDown(e) {
    if (e.target.closest('.carousel-tile-btn')) return;
    isDragging = true;
    dragStartX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragStartAngle = targetAngle;
    lastDragX = dragStartX;
    lastDragTime = performance.now();
    dragVel = 0;
    angVel = 0;
    scene.classList.add('is-dragging');
    e.preventDefault();
  }
  function onMove(e) {
    if (!isDragging) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const now = performance.now();
    const dt = Math.max(1, now - lastDragTime);
    dragVel = (x - lastDragX) / dt;
    targetAngle = dragStartAngle + (x - dragStartX) * 0.006;
    lastDragX = x;
    lastDragTime = now;
  }
  // Block clicks during/after drag — must be declared before onUp uses it
  let wasDragging = false;
  scene.addEventListener('click', (e) => {
    if (wasDragging) { e.preventDefault(); wasDragging = false; }
  });

  function onUp() {
    if (!isDragging) return;
    wasDragging = true; // set before clearing isDragging so click handler sees it
    isDragging = false;
    angVel = dragVel * 0.06;
    scene.classList.remove('is-dragging');
  }

  scene.addEventListener('mousedown', onDown);
  scene.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  // Animation loop
  function loop(now) {
    const dt = Math.min(50, now - lastFrameTime);
    lastFrameTime = now;

    if (!isDragging) {
      // Idle auto-rotation — halved while a tile is hovered
      targetAngle += (isHovered ? AUTO_SPEED * 0.5 : AUTO_SPEED) * dt;
      // Scroll boost decays naturally
      scrollBoost *= 0.90;
      targetAngle += scrollBoost;
      // Drag inertia + friction
      angVel *= 0.93;
      targetAngle += angVel;
    }

    // Smooth interpolation
    angle += (targetAngle - angle) * 0.065;
    renderFrame(angle);
    requestAnimationFrame(loop);
  }

  renderFrame(angle);
  requestAnimationFrame(loop);
}

function initHeroParallax() {
  const bg = document.getElementById('heroBg');
  if (!bg) return;
  function update() {
    bg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initCapabilities() {
  const items = document.querySelectorAll('.capability-list li[data-skills]');
  const headline = document.querySelector('.capability-headline');
  const display = document.querySelector('.capability-display');
  const list = document.querySelector('.capability-list');
  if (!items.length || !headline || !display || !list) return;

  const NS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('cap-svg');
  svg.setAttribute('aria-hidden', 'true');
  display.appendChild(svg);

  let activeItem = null;

  function clearDisplay() {
    svg.innerHTML = '';
    display.querySelectorAll('.cap-skill-label').forEach(el => el.remove());
  }

  function showSkills(item) {
    if (activeItem === item) return;
    activeItem = item;
    clearDisplay();
    headline.classList.add('cap-hidden');

    const skills = item.dataset.skills.split(',').map(s => s.trim());
    const count = skills.length;

    const dRect = display.getBoundingClientRect();
    const iRect = item.getBoundingClientRect();
    const lRect = list.getBoundingClientRect();
    const W = dRect.width;
    const H = dRect.height;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // Origin: behind the right edge of the skills tiles (negative x in display coords)
    const ox = lRect.right - dRect.left - 12;
    const oy = Math.max(16, Math.min(H - 16,
      (iRect.top + iRect.height / 2) - dRect.top
    ));

    // Subskill targets — vertically centered in display
    const SPACING = 66;
    const totalH = (count - 1) * SPACING;
    const startY = H / 2 - totalH / 2;
    const lineEndX = W * 0.44;

    skills.forEach((skill, i) => {
      const ty = startY + i * SPACING;
      const tension = (lineEndX - ox) * 0.5;
      const d = `M ${ox} ${oy} C ${ox + tension} ${oy}, ${lineEndX - tension} ${ty}, ${lineEndX} ${ty}`;

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(201,167,87,0.6)');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-linecap', 'round');

      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      // Fast draw — all lines in ~0.1s, minimal stagger
      path.style.animation =
        `capLine 0.1s cubic-bezier(0.25,0,0.5,1) ${i * 0.02}s forwards`;
      svg.appendChild(path);

      // End dot
      const endDot = document.createElementNS(NS, 'circle');
      endDot.setAttribute('cx', lineEndX);
      endDot.setAttribute('cy', ty);
      endDot.setAttribute('r', '2.5');
      endDot.setAttribute('fill', 'rgba(201,167,87,0.55)');
      endDot.style.opacity = '0';
      endDot.style.animation =
        `capDotIn 0.06s ease ${i * 0.02 + 0.09}s forwards`;
      svg.appendChild(endDot);

      // Label appears as line lands
      const label = document.createElement('div');
      label.className = 'cap-skill-label';
      label.textContent = skill;
      label.style.left = `${lineEndX + 12}px`;
      label.style.top = `${ty}px`;
      label.style.animationDelay = `${i * 0.02 + 0.08}s`;
      display.appendChild(label);
    });
  }

  function reset() {
    activeItem = null;
    clearDisplay();
    headline.classList.remove('cap-hidden');
  }

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => showSkills(item));
    item.addEventListener('mouseleave', (e) => {
      const to = e.relatedTarget;
      if (!to || !to.closest('.capability-list li[data-skills]')) reset();
    });
  });
}

const scrollCueBtn = document.querySelector('.scroll-cue');
if (scrollCueBtn) {
  scrollCueBtn.addEventListener('click', () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  });
}

function initFixedNav() {
  const base = document.body.dataset.depth === 'project' ? '../' : '';

  const LI_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
  const IG_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`;
  const GH_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;

  const resumeBtn = document.createElement('a');
  resumeBtn.className = 'fixed-resume';
  resumeBtn.href = `${base}assets/resume.pdf`;
  resumeBtn.setAttribute('download', '');
  resumeBtn.setAttribute('aria-label', 'Download resume');
  resumeBtn.innerHTML = `
    <span class="fixed-resume-label">Resume</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
    </svg>
  `;
  document.body.appendChild(resumeBtn);

  const socialNav = document.createElement('nav');
  socialNav.className = 'fixed-socials';
  socialNav.setAttribute('aria-label', 'Social links');
  // GitHub top, Instagram middle, LinkedIn bottom (ascending from corner)
  socialNav.innerHTML = `
    <a href="#" aria-label="GitHub">${GH_SVG}</a>
    <a href="#" aria-label="Instagram">${IG_SVG}</a>
    <a href="https://linkedin.com/in/sebastian-morris-403538323" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${LI_SVG}</a>
  `;
  document.body.appendChild(socialNav);
}

function initPhoneQr() {
  const phoneLink = document.querySelector('.phone-link');
  const modal = document.getElementById('phoneQrModal');
  const qrImg = document.getElementById('phoneQrImg');
  if (!phoneLink || !modal || !qrImg) return;

  const isMobile = () => window.innerWidth < 768;

  phoneLink.addEventListener('click', (e) => {
    if (isMobile()) return;
    e.preventDefault();
    if (!qrImg.src || qrImg.src === window.location.href) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent('tel:+18584149943')}`;
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  });

  modal.addEventListener('click', (e) => {
    if (!e.target.closest('.phone-qr-card')) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

renderProjectGallery();
initProjectHeroParallax();
initHeroParallax();
initExperienceTimeline();
initEduHeroParallax();
initCarousel();
initCapabilities();
initFixedNav();
initPhoneQr();
prepareRevealText();
updateRevealText();
window.addEventListener("scroll", updateRevealText, { passive: true });
window.addEventListener("resize", updateRevealText);
