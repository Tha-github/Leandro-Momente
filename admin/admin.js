// ─── Supabase client ─────────────────────────────────────────────────────────

function initClient() {
  const cfg = (window.siteConfig || {}).supabase;
  if (!cfg || !cfg.url || cfg.url.startsWith("https://SEU")) {
    alert("Configure as credenciais do Supabase em config/site.js antes de usar o painel.");
    return null;
  }
  return window.supabase.createClient(cfg.url, cfg.anonKey);
}

const sb = initClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Login page ───────────────────────────────────────────────────────────────

async function handleLoginPage() {
  if (!document.getElementById("login-form")) return;
  if (!sb) return;

  // Se já está autenticado, vai direto para o painel
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    window.location.replace("painel.html");
    return;
  }

  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");
  const btn = document.getElementById("login-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    btn.disabled = true;
    btn.textContent = "Entrando…";

    const { error } = await sb.auth.signInWithPassword({
      email: form.email.value.trim(),
      password: form.password.value
    });

    if (error) {
      errorEl.textContent = "E-mail ou senha incorretos. Tente novamente.";
      btn.disabled = false;
      btn.textContent = "Entrar";
    } else {
      window.location.replace("painel.html");
    }
  });
}

// ─── Painel page ─────────────────────────────────────────────────────────────

let allArticles = [];
let editingId = null;

async function handlePainelPage() {
  if (!document.getElementById("article-list")) return;
  if (!sb) return;

  // Verificar autenticação
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.replace("index.html");
    return;
  }

  // Logout
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await sb.auth.signOut();
    window.location.replace("index.html");
  });

  // Botão nova notícia
  document.getElementById("new-article-btn").addEventListener("click", () => openForm(null));

  // Fechar modal
  document.getElementById("close-modal").addEventListener("click", closeForm);
  document.getElementById("cancel-btn").addEventListener("click", closeForm);
  document.getElementById("form-modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeForm();
  });

  // Formulário: gerar slug automaticamente ao digitar o título
  document.querySelector("[name=titulo]").addEventListener("input", (e) => {
    if (!editingId) {
      document.querySelector("[name=slug]").value = slugify(e.target.value);
    }
  });

  // Submit do formulário
  document.getElementById("article-form").addEventListener("submit", handleFormSubmit);

  // Carregar artigos
  await loadArticles();
}

async function loadArticles() {
  const { data, error } = await sb
    .from("noticias")
    .select("id,slug,titulo,categoria,data_publicacao,publicado,destaque,imagem_capa")
    .order("created_at", { ascending: false });

  if (error) {
    document.getElementById("article-list").innerHTML = `<tr><td colspan="5">Erro ao carregar: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  allArticles = data || [];
  updateStats();
  renderTable();
}

function updateStats() {
  const total = allArticles.length;
  const publicados = allArticles.filter((a) => a.publicado).length;
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-publicados").textContent = publicados;
  document.getElementById("stat-rascunhos").textContent = total - publicados;
}

function renderTable() {
  const tbody = document.getElementById("article-list");

  if (!allArticles.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Nenhuma notícia cadastrada ainda.</td></tr>';
    return;
  }

  tbody.innerHTML = allArticles.map((a) => `
    <tr>
      <td class="col-titulo">${escapeHtml(a.titulo)}</td>
      <td>${escapeHtml(a.categoria || "—")}</td>
      <td>${formatDate(a.data_publicacao)}</td>
      <td>
        <span class="status-badge ${a.publicado ? "publicado" : "rascunho"}">
          ${a.publicado ? "Publicado" : "Rascunho"}
        </span>
      </td>
      <td class="col-acoes">
        <button class="btn-edit" type="button" data-id="${a.id}">Editar</button>
        <button class="btn-delete" type="button" data-id="${a.id}">Excluir</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => openEditById(Number(btn.dataset.id)));
  });

  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteArticle(Number(btn.dataset.id)));
  });
}

async function openEditById(id) {
  // Busca o artigo completo (com conteudo) para edição
  const { data, error } = await sb.from("noticias").select("*").eq("id", id).single();
  if (error || !data) { alert("Não foi possível carregar a notícia."); return; }
  openForm(data);
}

function openForm(article) {
  editingId = article ? article.id : null;
  const form = document.getElementById("article-form");

  form.titulo.value = article?.titulo || "";
  form.slug.value = article?.slug || "";
  form.resumo.value = article?.resumo || "";
  form.conteudo.value = article?.conteudo || "";
  form.categoria.value = article?.categoria || "Criança e Adolescente";
  form.autor.value = article?.autor || "Leandro Momente";
  form.data_publicacao.value = article?.data_publicacao || "";
  form.tempo_leitura.value = article?.tempo_leitura || "";
  form.destaque.checked = Boolean(article?.destaque);
  form.publicado.checked = Boolean(article?.publicado);
  form.imagem_capa.value = "";

  const preview = document.getElementById("current-image");
  if (article?.imagem_capa) {
    preview.innerHTML = `<img src="${escapeHtml(article.imagem_capa)}" alt="Imagem atual" />`;
  } else {
    preview.innerHTML = "";
  }

  document.getElementById("modal-title").textContent = article ? "Editar notícia" : "Nova notícia";
  document.getElementById("form-error").textContent = "";

  const modal = document.getElementById("form-modal");
  modal.hidden = false;
  form.titulo.focus();
}

function closeForm() {
  document.getElementById("form-modal").hidden = true;
  editingId = null;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const saveBtn = document.getElementById("save-btn");
  const errorEl = document.getElementById("form-error");

  errorEl.textContent = "";
  saveBtn.disabled = true;
  saveBtn.textContent = "Salvando…";

  let imagemCapa = null;
  const imageFile = form.imagem_capa.files[0];

  if (imageFile) {
    const ext = imageFile.name.split(".").pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await sb.storage
      .from("imagens")
      .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      errorEl.textContent = "Erro ao enviar imagem: " + uploadError.message;
      saveBtn.disabled = false;
      saveBtn.textContent = "Salvar notícia";
      return;
    }

    const { data: { publicUrl } } = sb.storage.from("imagens").getPublicUrl(fileName);
    imagemCapa = publicUrl;
  }

  const payload = {
    titulo: form.titulo.value.trim(),
    slug: form.slug.value.trim(),
    resumo: form.resumo.value.trim(),
    conteudo: form.conteudo.value.trim(),
    categoria: form.categoria.value,
    autor: form.autor.value.trim(),
    data_publicacao: form.data_publicacao.value || null,
    tempo_leitura: form.tempo_leitura.value.trim(),
    destaque: form.destaque.checked,
    publicado: form.publicado.checked
  };

  if (imagemCapa) payload.imagem_capa = imagemCapa;

  let error;
  if (editingId) {
    ({ error } = await sb.from("noticias").update(payload).eq("id", editingId));
  } else {
    ({ error } = await sb.from("noticias").insert(payload));
  }

  if (error) {
    errorEl.textContent = "Erro ao salvar: " + error.message;
  } else {
    closeForm();
    await loadArticles();
  }

  saveBtn.disabled = false;
  saveBtn.textContent = "Salvar notícia";
}

async function deleteArticle(id) {
  const article = allArticles.find((a) => a.id === id);
  const confirmMsg = `Excluir a notícia "${article?.titulo || id}"?\n\nEsta ação não pode ser desfeita.`;
  if (!confirm(confirmMsg)) return;

  const { error } = await sb.from("noticias").delete().eq("id", id);
  if (error) {
    alert("Erro ao excluir: " + error.message);
  } else {
    await loadArticles();
  }
}

// ─── Initialize ───────────────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {
  handleLoginPage();
  handlePainelPage();
});
