const areas = [
  {
    title: "Criança e Adolescente",
    description: "ECA, conselhos tutelares, medidas protetivas e socioeducativas, fluxos de proteção."
  },
  {
    title: "Mulheres",
    description: "Lei Maria da Penha, rede de enfrentamento à violência, acolhimento e encaminhamentos."
  },
  {
    title: "Pessoa Idosa",
    description: "Estatuto da Pessoa Idosa, prevenção à violência patrimonial e negligência."
  },
  {
    title: "Pessoa com Deficiência",
    description: "Lei Brasileira de Inclusão, acessibilidade e garantia de direitos."
  },
  {
    title: "Rede e Políticas Públicas",
    description: "Articulação intersetorial, conselhos de direitos, planos e fluxos municipais."
  }
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
  {
    title: "Estatuto da Criança e do Adolescente",
    meta: "Lei 8.069/1990",
    description: "Marco regulatório para a proteção integral da criança e do adolescente."
  },
  {
    title: "Lei Maria da Penha",
    meta: "Lei 11.340/2006",
    description: "Diretrizes para a prevenção e enfrentamento à violência doméstica e familiar."
  },
  {
    title: "Estatuto da Pessoa Idosa",
    meta: "Lei 10.741/2003",
    description: "Norma central para a proteção da pessoa idosa e sua autonomia."
  },
  {
    title: "Lei Brasileira de Inclusão",
    meta: "Lei 13.146/2015",
    description: "Instrumento essencial para a efetivação de direitos da pessoa com deficiência."
  }
];

function formatDate(value) {
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function syncSiteConfig() {
  const config = window.siteConfig || {};

  document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
    const number = config.whatsappNumber || "5511999999999";
    const message = config.whatsappMessage || "";
    const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    link.href = url;
  });

  document.querySelectorAll("[data-email-link]").forEach((link) => {
    if (config.email) {
      link.href = `mailto:${config.email}`;
      link.textContent = config.email;
    }
  });

  document.querySelectorAll("[data-address]").forEach((node) => {
    if (config.address) {
      node.textContent = config.address;
    }
  });

  document.querySelectorAll("[data-opening-hours]").forEach((node) => {
    if (config.openingHours) {
      node.textContent = config.openingHours;
    }
  });
}

function renderHomePage() {
  const config = window.siteConfig || {};
  if (config.hero) {
    document.querySelector("[data-hero-eyebrow]").textContent = config.hero.eyebrow;
    document.querySelector("[data-hero-title]").textContent = config.hero.title;
    document.querySelector("[data-hero-subtitle]").textContent = config.hero.subtitle;
  }

  const areasList = document.getElementById("areas-list");
  if (areasList) {
    areasList.innerHTML = areas
      .map((area) => `
        <article class="card reveal">
          <h3>${area.title}</h3>
          <p>${area.description}</p>
        </article>
      `)
      .join("");
  }

  const legislationList = document.getElementById("legislation-list");
  if (legislationList) {
    legislationList.innerHTML = legislation
      .map((item) => `
        <article class="legislation-card reveal">
          <h3>${item.title}</h3>
          <p class="meta">${item.meta}</p>
          <p>${item.description}</p>
        </article>
      `)
      .join("");
  }

  const topicsList = document.getElementById("topics-list");
  if (topicsList) {
    topicsList.innerHTML = topics
      .map((topic) => `<article class="topics-card reveal"><p>${topic}</p></article>`)
      .join("");
  }

  const previewList = document.getElementById("news-preview");
  if (previewList && window.noticias) {
    previewList.innerHTML = window.noticias
      .slice(0, 3)
      .map((item) => `
        <article class="news-card reveal">
          <p class="meta">${item.categoria} · ${formatDate(item.dataPublicacao)}</p>
          <h3>${item.titulo}</h3>
          <p>${item.resumo}</p>
          <a href="noticia.html?slug=${item.slug}">Ler mais</a>
        </article>
      `)
      .join("");
  }

  document.getElementById("year").textContent = new Date().getFullYear();
}

function attachMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function attachHeaderBehavior() {
  const header = document.querySelector(".site-header");
  const links = document.querySelectorAll('.site-nav a[href^="#"]');
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);

    const currentSection = sections.findLast((section) => window.scrollY + 180 >= section.offsetTop);
    if (!currentSection) return;

    links.forEach((link) => {
      const hash = link.getAttribute("href");
      const active = hash && hash.slice(1) === currentSection.id;
      link.classList.toggle("active", active);
    });
  };

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  window.addEventListener("resize", updateHeaderState);
  updateHeaderState();
}

function attachRevealObserver() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function attachFloatingButtons() {
  const fab = document.querySelector(".floating-whatsapp");
  const backTop = document.querySelector(".back-to-top");
  if (!fab || !backTop) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      fab.classList.add("is-visible");
      backTop.classList.add("is-visible");
    } else {
      fab.classList.remove("is-visible");
      backTop.classList.remove("is-visible");
    }
  });
}

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

    document.querySelectorAll(".error-message").forEach((item) => {
      item.textContent = "";
    });

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
    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(formatted)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    const status = document.getElementById("form-status");
    if (status) {
      status.textContent = "Mensagem preparada. A janela do WhatsApp foi aberta para continuidade.";
    }
    form.reset();
  });
}

function renderNewsListPage() {
  const list = document.getElementById("news-list");
  const filters = document.getElementById("filters");
  if (!list || !filters || !window.noticias) return;

  const categories = ["Todas", ...new Set(window.noticias.map((item) => item.categoria))];
  let activeCategory = "Todas";
  let query = "";
  let visibleCount = 8;

  function getFilteredItems() {
    return window.noticias.filter((item) => {
      const matchesCategory = activeCategory === "Todas" || item.categoria === activeCategory;
      const haystack = `${item.titulo} ${item.resumo} ${item.categoria}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }

  function render() {
    const filtered = getFilteredItems();
    const items = filtered.slice(0, visibleCount);
    list.innerHTML = items.length
      ? items.map((item) => `
          <article class="news-item">
            <a href="noticia.html?slug=${item.slug}">
              <p class="meta">${item.categoria} · ${formatDate(item.dataPublicacao)}</p>
              <h3>${item.titulo}</h3>
              <p>${item.resumo}</p>
              <p class="meta">${item.tempoLeitura}</p>
            </a>
          </article>
        `).join("")
      : '<p>Nenhum conteúdo encontrado para esta busca.</p>';

    const loadMore = document.getElementById("load-more");
    if (loadMore) {
      loadMore.style.display = filtered.length > visibleCount ? "inline-flex" : "none";
    }
  }

  filters.innerHTML = `
    <input id="search-news" type="search" placeholder="Buscar por palavra-chave" />
    <div class="filters"></div>
  `;

  const chipContainer = filters.querySelector(".filters");
  chipContainer.innerHTML = categories.map((category) => `
    <button class="filter-chip ${category === activeCategory ? "active" : ""}" type="button" data-category="${category}">${category}</button>
  `).join("");

  const searchInput = document.getElementById("search-news");
  searchInput.addEventListener("input", (event) => {
    query = event.target.value;
    visibleCount = 8;
    render();
  });

  chipContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.getAttribute("data-category");
    visibleCount = 8;
    chipContainer.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip.getAttribute("data-category") === activeCategory));
    render();
  });

  const loadMoreButton = document.createElement("button");
  loadMoreButton.id = "load-more";
  loadMoreButton.className = "button button-primary";
  loadMoreButton.type = "button";
  loadMoreButton.textContent = "Carregar mais";
  loadMoreButton.addEventListener("click", () => {
    visibleCount += 8;
    render();
  });
  filters.appendChild(loadMoreButton);
  render();
}

function renderArticlePage() {
  const articleContent = document.getElementById("article-content");
  const sidebar = document.getElementById("article-sidebar");
  if (!articleContent || !sidebar || !window.noticias) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const article = window.noticias.find((item) => item.slug === slug);
  if (!article) {
    articleContent.innerHTML = '<p>Artigo não encontrado.</p>';
    return;
  }

  const headings = Array.from(article.conteudo.matchAll(/<h2>(.*?)<\/h2>/g)).map((match) => match[1]);
  const related = window.noticias.filter((item) => item.categoria === article.categoria && item.slug !== article.slug).slice(0, 3);

  articleContent.innerHTML = `
    <p class="meta">${article.categoria}</p>
    <h1>${article.titulo}</h1>
    <p class="meta">Publicado em ${formatDate(article.dataPublicacao)} · ${article.autor} · ${article.tempoLeitura}</p>
    <div class="article-card">
      ${article.conteudo}
    </div>
  `;

  sidebar.innerHTML = `
    <h3>Índice</h3>
    <ul>
      ${headings.length ? headings.map((heading) => `<li><a href="#">${heading}</a></li>`).join("") : "<li>Sem subtítulos.</li>"}
    </ul>
    <h3>Conteúdos relacionados</h3>
    <ul>
      ${related.map((item) => `<li><a href="noticia.html?slug=${item.slug}">${item.titulo}</a></li>`).join("")}
    </ul>
  `;
}

function initialize() {
  syncSiteConfig();
  renderHomePage();
  attachMobileMenu();
  attachHeaderBehavior();
  attachRevealObserver();
  attachFloatingButtons();
  attachContactForm();
  renderNewsListPage();
  renderArticlePage();
}

window.addEventListener("DOMContentLoaded", initialize);
