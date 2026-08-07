const areas = [
  { title: "Criança e Adolescente", description: "ECA, conselhos tutelares, medidas protetivas e socioeducativas, fluxos de proteção." },
  { title: "Mulheres", description: "Lei Maria da Penha, rede de enfrentamento à violência, acolhimento e encaminhamentos." },
  { title: "Pessoa Idosa", description: "Estatuto da Pessoa Idosa, prevenção à violência patrimonial e negligência." },
  { title: "Pessoa com Deficiência", description: "Lei Brasileira de Inclusão, acessibilidade e garantia de direitos." },
  { title: "Rede e Políticas Públicas", description: "Articulação intersetorial, conselhos de direitos, planos e fluxos municipais." }
];

const topics = [
  "Aplicação do ECA no cotidiano da rede",
  "Atendimento a mulheres em situação de violência",
  "Direitos da pessoa idosa",
  "Inclusão e acessibilidade",
  "Funcionamento de conselhos de direitos",
  "Fluxos de proteção intersetoriais"
];

const legislation = [
  { title: "Estatuto da Criança e do Adolescente", meta: "Lei 8.069/1990", description: "Marco regulatório para a proteção integral da criança e do adolescente." },
  { title: "Lei Maria da Penha", meta: "Lei 11.340/2006", description: "Diretrizes para a prevenção e enfrentamento à violência doméstica e familiar." },
  { title: "Estatuto da Pessoa Idosa", meta: "Lei 10.741/2003", description: "Norma central para a proteção da pessoa idosa e sua autonomia." },
  { title: "Lei Brasileira de Inclusão", meta: "Lei 13.146/2015", description: "Instrumento essencial para a efetivação de direitos da pessoa com deficiência." }
];

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Supabase ────────────────────────────────────────────────────────────────

function getSupabaseClient() {
  const cfg = (window.siteConfig || {}).supabase;
  if (!cfg || !cfg.url || cfg.url.startsWith("https://SEU")) return null;
  if (!window.supabase) return null;
  return window.supabase.createClient(cfg.url, cfg.anonKey);
}

// Normaliza campos snake_case do Supabase para camelCase usados nos templates
function normalizeNoticia(item) {
  if (!item) return null;
  return {
    ...item,
    dataPublicacao: item.data_publicacao || item.dataPublicacao,
    tempoLeitura: item.tempo_leitura || item.tempoLeitura,
    imagemCapa: item.imagem_capa || item.imagemCapa || null
  };
}

async function fetchNoticias() {
  const client = getSupabaseClient();
  if (!client) {
    return (window.noticias || []).map(normalizeNoticia);
  }
  const { data, error } = await client
    .from("noticias")
    .select("id,slug,titulo,resumo,categoria,autor,data_publicacao,tempo_leitura,imagem_capa,destaque,publicado")
    .eq("publicado", true)
    .order("data_publicacao", { ascending: false });
  if (error) {
    console.error("Supabase fetchNoticias:", error.message);
    return (window.noticias || []).map(normalizeNoticia);
  }
  return data.map(normalizeNoticia);
}

async function fetchNoticia(slug) {
  const client = getSupabaseClient();
  if (!client) {
    const found = (window.noticias || []).find((n) => n.slug === slug) || null;
    return normalizeNoticia(found);
  }
  const { data, error } = await client
    .from("noticias")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle();
  if (error) {
    console.error("Supabase fetchNoticia:", error.message);
    return null;
  }
  return normalizeNoticia(data);
}

// ─── Config sync ─────────────────────────────────────────────────────────────

function syncSiteConfig() {
  const config = window.siteConfig || {};

  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    const number = config.whatsappNumber || "5511999999999";
    const message = config.whatsappMessage || "";
    link.href = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  });

  document.querySelectorAll("[data-email-link]").forEach((link) => {
    if (config.email) {
      link.href = `mailto:${config.email}`;
      link.textContent = config.email;
    }
  });

  document.querySelectorAll("[data-address]").forEach((node) => {
    if (config.address) node.textContent = config.address;
  });

  document.querySelectorAll("[data-phone-link]").forEach((link) => {
    const number = config.whatsappNumber || "5511999999999";
    const display = config.phoneDisplay || `+${number}`;
    link.href = `tel:+${number}`;
    link.textContent = display;
  });

  document.querySelectorAll("[data-opening-hours]").forEach((node) => {
    if (config.openingHours) node.textContent = config.openingHours;
  });
}

// ─── Home page ────────────────────────────────────────────────────────────────

async function renderHomePage() {
  const config = window.siteConfig || {};

  if (config.hero) {
    const eyebrow = document.querySelector("[data-hero-eyebrow]");
    const title = document.querySelector("[data-hero-title]");
    const subtitle = document.querySelector("[data-hero-subtitle]");
    if (eyebrow) eyebrow.textContent = config.hero.eyebrow;
    if (title) title.textContent = config.hero.title;
    if (subtitle) subtitle.textContent = config.hero.subtitle;
  }

  const areasList = document.getElementById("areas-list");
  if (areasList) {
    areasList.innerHTML = areas.map((area) => `
      <article class="card reveal">
        <h3>${area.title}</h3>
        <p>${area.description}</p>
        <a class="small-link" href="#contato">Saiba mais</a>
      </article>
    `).join("");
  }

  const legislationList = document.getElementById("legislation-list");
  if (legislationList) {
    legislationList.innerHTML = legislation.map((item) => `
      <article class="legislation-card reveal">
        <h3>${item.title}</h3>
        <p class="meta">${item.meta}</p>
        <p>${item.description}</p>
      </article>
    `).join("");
  }

  const topicsList = document.getElementById("topics-list");
  if (topicsList) {
    topicsList.innerHTML = topics.map((topic) => `
      <article class="topics-card reveal"><p>${topic}</p></article>
    `).join("");
  }

  const previewList = document.getElementById("news-preview");
  if (previewList) {
    const noticias = await fetchNoticias();
    previewList.innerHTML = noticias.slice(0, 3).map((item) => `
      <article class="news-card reveal">
        ${item.imagemCapa ? `<img src="${escapeHtml(item.imagemCapa)}" alt="${escapeHtml(item.titulo)}" loading="lazy" class="news-card-img" />` : ""}
        <p class="meta">${escapeHtml(item.categoria)} · ${formatDate(item.dataPublicacao)}</p>
        <h3>${escapeHtml(item.titulo)}</h3>
        <p>${escapeHtml(item.resumo)}</p>
        <a href="noticia.html?slug=${encodeURIComponent(item.slug)}">Ler mais</a>
      </article>
    `).join("");
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────

function attachMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  // Substituir texto "Menu" por ícones SVG hambúrguer / fechar
  toggle.setAttribute("aria-label", "Abrir menu");
  toggle.innerHTML = `
    <svg class="icon-menu" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M3 6h18M3 12h18M3 18h18"/>
    </svg>
    <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>
    </svg>`;

  // Overlay de fundo
  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  // Botão × dentro do sidebar
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "nav-close-btn";
  closeBtn.setAttribute("aria-label", "Fechar menu");
  closeBtn.textContent = "×";
  nav.insertBefore(closeBtn, nav.firstChild);

  function closeNav() {
    nav.classList.remove("open");
    overlay.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  }

  function openNav() {
    nav.classList.add("open");
    overlay.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    document.body.style.overflow = "hidden";
  }

  toggle.addEventListener("click", () => {
    nav.classList.contains("open") ? closeNav() : openNav();
  });
  overlay.addEventListener("click", closeNav);
  closeBtn.addEventListener("click", closeNav);
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
}

// ─── Header behavior ──────────────────────────────────────────────────────────

function attachHeaderBehavior() {
  const header = document.querySelector(".site-header");
  const links = document.querySelectorAll('.site-nav a[href^="#"]');
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);
    const currentSection = sections.findLast((s) => window.scrollY + 180 >= s.offsetTop);
    if (!currentSection) return;
    links.forEach((link) => {
      const hash = link.getAttribute("href");
      link.classList.toggle("active", Boolean(hash) && hash.slice(1) === currentSection.id);
    });
  };

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  window.addEventListener("resize", updateHeaderState);
  updateHeaderState();
}

// ─── Reveal observer ──────────────────────────────────────────────────────────

function attachRevealObserver() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// ─── Floating buttons ─────────────────────────────────────────────────────────

function attachFloatingButtons() {
  const fab = document.querySelector(".floating-whatsapp");
  const backTop = document.querySelector(".back-to-top");
  if (!fab && !backTop) return;
  window.addEventListener("scroll", () => {
    const visible = window.scrollY > 300;
    fab?.classList.toggle("is-visible", visible);
    backTop?.classList.toggle("is-visible", visible);
  });
}

// ─── Contact form ─────────────────────────────────────────────────────────────

function attachContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const errors = {};

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const consent = data.get("consent");

    if (!name) errors.name = "Informe seu nome completo.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";
    if (!phone) errors.phone = "Informe um telefone ou WhatsApp.";
    if (!message) errors.message = "Escreva sua mensagem.";
    if (!consent) errors.consent = "É necessário aceitar o consentimento.";

    document.querySelectorAll(".error-message").forEach((el) => { el.textContent = ""; });
    Object.entries(errors).forEach(([key, value]) => {
      const target = form.querySelector(`[data-error-for="${key}"]`);
      if (target) target.textContent = value;
    });

    if (Object.keys(errors).length > 0) {
      const status = document.getElementById("form-status");
      if (status) status.textContent = "Revise os campos destacados para continuar.";
      return;
    }

    const formatted = `Nome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\nInstituição: ${data.get("institution") || "-"}\nMunicípio/UF: ${data.get("city") || "-"}\nAssunto: ${data.get("subject") || "-"}\nMensagem: ${message}`;
    const number = (window.siteConfig || {}).whatsappNumber || "5511999999999";
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(formatted)}`, "_blank", "noopener,noreferrer");

    const status = document.getElementById("form-status");
    if (status) status.textContent = "Mensagem preparada. A janela do WhatsApp foi aberta para continuidade.";
    form.reset();
  });
}

// ─── News list page ───────────────────────────────────────────────────────────

async function renderNewsListPage() {
  const list = document.getElementById("news-list");
  const filters = document.getElementById("filters");
  if (!list || !filters) return;

  list.innerHTML = "<p>Carregando notícias…</p>";

  const noticias = await fetchNoticias();

  if (!noticias.length) {
    list.innerHTML = "<p>Nenhuma notícia disponível no momento.</p>";
    return;
  }

  const categories = ["Todas", ...new Set(noticias.map((item) => item.categoria).filter(Boolean))];
  let activeCategory = "Todas";
  let query = "";
  let visibleCount = 8;

  function getFiltered() {
    return noticias.filter((item) => {
      const matchCat = activeCategory === "Todas" || item.categoria === activeCategory;
      const haystack = `${item.titulo} ${item.resumo} ${item.categoria}`.toLowerCase();
      return matchCat && haystack.includes(query.toLowerCase());
    });
  }

  function render() {
    const filtered = getFiltered();
    const items = filtered.slice(0, visibleCount);
    list.innerHTML = items.length
      ? items.map((item) => `
          <article class="news-item">
            <a href="noticia.html?slug=${encodeURIComponent(item.slug)}">
              <p class="meta">${escapeHtml(item.categoria)} · ${formatDate(item.dataPublicacao)}</p>
              <h3>${escapeHtml(item.titulo)}</h3>
              <p>${escapeHtml(item.resumo)}</p>
              <p class="meta">${escapeHtml(item.tempoLeitura)}</p>
            </a>
          </article>
        `).join("")
      : "<p>Nenhum conteúdo encontrado para esta busca.</p>";

    const loadMore = document.getElementById("load-more");
    if (loadMore) loadMore.style.display = filtered.length > visibleCount ? "inline-flex" : "none";
  }

  filters.innerHTML = `
    <input id="search-news" type="search" placeholder="Buscar por palavra-chave" />
    <div class="filters"></div>
  `;

  const chipContainer = filters.querySelector(".filters");
  chipContainer.innerHTML = categories.map((cat) => `
    <button class="filter-chip ${cat === activeCategory ? "active" : ""}" type="button" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>
  `).join("");

  document.getElementById("search-news").addEventListener("input", (e) => {
    query = e.target.value;
    visibleCount = 8;
    render();
  });

  chipContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    activeCategory = btn.getAttribute("data-category");
    visibleCount = 8;
    chipContainer.querySelectorAll(".filter-chip").forEach((chip) =>
      chip.classList.toggle("active", chip.getAttribute("data-category") === activeCategory)
    );
    render();
  });

  const loadMoreBtn = document.createElement("button");
  loadMoreBtn.id = "load-more";
  loadMoreBtn.className = "button button-primary";
  loadMoreBtn.type = "button";
  loadMoreBtn.textContent = "Carregar mais notícias";
  loadMoreBtn.addEventListener("click", () => { visibleCount += 8; render(); });
  filters.appendChild(loadMoreBtn);

  render();
}

// ─── Article page ─────────────────────────────────────────────────────────────

async function renderArticlePage() {
  const articleContent = document.getElementById("article-content");
  const sidebar = document.getElementById("article-sidebar");
  if (!articleContent || !sidebar) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    articleContent.innerHTML = "<p>Artigo não encontrado.</p>";
    return;
  }

  articleContent.innerHTML = "<p>Carregando…</p>";

  const article = await fetchNoticia(slug);
  if (!article) {
    articleContent.innerHTML = "<p>Artigo não encontrado.</p>";
    return;
  }

  document.title = `${article.titulo} — Leandro Momente`;

  const headings = Array.from(String(article.conteudo || "").matchAll(/<h2[^>]*>(.*?)<\/h2>/g)).map((m) => m[1]);

  const all = await fetchNoticias();
  const related = all.filter((n) => n.categoria === article.categoria && n.slug !== article.slug).slice(0, 3);

  articleContent.innerHTML = `
    ${article.imagemCapa ? `<img src="${escapeHtml(article.imagemCapa)}" alt="${escapeHtml(article.titulo)}" loading="lazy" class="article-cover-img" />` : ""}
    <p class="meta">${escapeHtml(article.categoria)}</p>
    <h1>${escapeHtml(article.titulo)}</h1>
    <p class="meta">Publicado em ${formatDate(article.dataPublicacao)} · ${escapeHtml(article.autor)} · ${escapeHtml(article.tempoLeitura)}</p>
    <div class="article-card">
      ${article.conteudo}
    </div>
  `;

  sidebar.innerHTML = `
    <h3>Índice</h3>
    <ul>
      ${headings.length ? headings.map((h) => `<li><a href="#">${h}</a></li>`).join("") : "<li>Sem subtítulos.</li>"}
    </ul>
    <h3>Conteúdos relacionados</h3>
    <ul>
      ${related.map((n) => `<li><a href="noticia.html?slug=${encodeURIComponent(n.slug)}">${escapeHtml(n.titulo)}</a></li>`).join("")}
    </ul>
  `;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Initialize ───────────────────────────────────────────────────────────────

async function initialize() {
  syncSiteConfig();
  await renderHomePage();
  attachMobileMenu();
  attachHeaderBehavior();
  attachFloatingButtons();
  attachContactForm();
  await renderNewsListPage();
  await renderArticlePage();
  attachRevealObserver();
}

window.addEventListener("DOMContentLoaded", initialize);
