const projects = [
  {
    title: "Jeep Rebuild",
    year: 2010,
    slug: "jeep-rebuild",
    image: "/assets/img/project-jeep-rebuild.svg",
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
    image: "/assets/img/project-tire-modeling-analysis.svg",
    summary: "A vehicle dynamics study focused on tire behavior, suspension inputs, and model validation.",
    tools: ["Vehicle dynamics", "Tire modeling", "Data analysis", "Validation"]
  },
  {
    title: "Tesla Cyber truck CAD project",
    year: 2023,
    slug: "tesla-cyber-truck-cad-project",
    image: "/assets/img/project-tesla-cyber-truck-cad.svg",
    summary: "A CAD exercise translating a sharp vehicle form into clean geometry and controlled surfaces.",
    tools: ["CAD", "Surfacing", "Assembly", "Design modeling"]
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
    image: "/assets/img/project-miata.svg",
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
    image: "/assets/img/project-pursa-mrk3.svg",
    summary: "A 3D-printer assembly and calibration project focused on alignment, tuning, and reliable output.",
    tools: ["3D printing", "Assembly", "Calibration", "Troubleshooting"]
  }
];

const projectGrid = document.querySelector("[data-project-grid]");
const sortSelect = document.querySelector("[data-project-sort]");

function assetPath(path) {
  return document.body.dataset.depth === "project" ? `../${path}` : path;
}

function assetUrl(path) {
  return new URL(assetPath(path), document.baseURI).href;
}

function renderProjects(order = "desc") {
  if (!projectGrid) return;
  const sorted = [...projects].sort((a, b) => order === "asc" ? a.year - b.year : b.year - a.year);
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
    const rect = hero.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const visibleCenter = rect.top + rect.height / 2;
    const normalized = (visibleCenter - viewportHeight / 2) / viewportHeight;
    const offset = Math.max(-54, Math.min(54, normalized * -64));
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

renderProjectGallery();
initProjectHeroParallax();
prepareRevealText();
updateRevealText();
window.addEventListener("scroll", updateRevealText, { passive: true });
window.addEventListener("resize", updateRevealText);
