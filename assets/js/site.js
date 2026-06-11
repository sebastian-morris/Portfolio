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
    image: "/assets/img/project-chevelle-restoration.svg",
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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

prepareRevealText();
updateRevealText();
window.addEventListener("scroll", updateRevealText, { passive: true });
window.addEventListener("resize", updateRevealText);
