// Configuração
const API_URL = "https://rickandmortyapi.com/api/character";

// Estado
let paginaAtual = 1;
let totalPaginas = 1;

// Favoritos salvos no navegador
let favoritos = JSON.parse(localStorage.getItem("favoritos") || "{}");
let mostrandoFavoritos = false;

// Elementos do HTML
const listaCards   = document.getElementById("lista-cards");
const campoBusca   = document.getElementById("busca");
const filtroStatus = document.getElementById("filtro-status");
const btnFavoritos = document.getElementById("btn-favoritos");
const btnAnterior  = document.getElementById("btn-anterior");
const btnProxima   = document.getElementById("btn-proxima");
const infoPagina   = document.getElementById("info-pagina");
const mensagem     = document.getElementById("mensagem");

// Busca na API
async function buscarPersonagens() {
  // Monta parâmetros
  const params = new URLSearchParams({ page: paginaAtual });
  if (campoBusca.value.trim()) params.set("name", campoBusca.value.trim());
  if (filtroStatus.value)      params.set("status", filtroStatus.value);

  mensagem.textContent = "Carregando personagens...";
  listaCards.innerHTML = "";

  try {
    // Requisição
    const resposta = await fetch(`${API_URL}?${params}`);

    // 404: nada encontrado
    if (resposta.status === 404) {
      totalPaginas = 1;
      atualizarPaginacao();
      mensagem.textContent = "Nenhum personagem encontrado.";
      return;
    }
    if (!resposta.ok) throw new Error("Erro HTTP " + resposta.status);

    // JSON para objeto
    const dados = await resposta.json();
    console.log("Resposta da API:", dados); // Para o vídeo

    totalPaginas = dados.info.pages;
    mensagem.textContent = `${dados.info.count} personagens encontrados`;
    renderizarCards(dados.results);
    atualizarPaginacao();
  } catch (erro) {
    // Erro de rede
    console.error(erro);
    mensagem.textContent = "Erro ao carregar os dados. Verifique sua internet e tente de novo.";
  }
}

// Cria um card
function criarCard(personagem) {
  const card = document.createElement("article");
  card.className = "card";

  // Coração
  const coracao = document.createElement("button");
  coracao.className = "btn-coracao";
  coracao.type = "button";
  coracao.textContent = favoritos[personagem.id] ? "♥" : "♡";
  coracao.title = "Favoritar";
  coracao.addEventListener("click", () => alternarFavorito(personagem, coracao));

  // Nome
  const nome = document.createElement("h2");
  nome.textContent = personagem.name;

  // Imagem
  const imagem = document.createElement("img");
  imagem.src = personagem.image;
  imagem.alt = "Foto de " + personagem.name;
  imagem.loading = "lazy"; // Carrega sob demanda

  // Informações
  const infos = document.createElement("ul");
  const linhas = [
    ["Status", personagem.status, true],
    ["Espécie", personagem.species],
    ["Gênero", personagem.gender],
    ["Origem", personagem.origin.name],
    ["Episódios", personagem.episode.length],
  ];
  linhas.forEach(([rotulo, valor, ehStatus]) => {
    const li = document.createElement("li");
    const forte = document.createElement("strong");
    forte.textContent = rotulo + ": ";
    const texto = document.createElement("span");
    texto.textContent = valor;
    if (ehStatus) texto.className = "status " + valor.toLowerCase();
    li.append(forte, texto);
    infos.appendChild(li);
  });

  // Monta o card
  card.appendChild(coracao);
  card.appendChild(nome);
  card.appendChild(imagem);
  card.appendChild(infos);
  return card;
}

// Mostra os cards
function renderizarCards(personagens) {
  listaCards.innerHTML = "";
  personagens.forEach((p) => listaCards.appendChild(criarCard(p)));
}

// Favoritar / desfavoritar
function alternarFavorito(personagem, botao) {
  if (favoritos[personagem.id]) {
    delete favoritos[personagem.id];
    botao.textContent = "♡";
  } else {
    favoritos[personagem.id] = personagem;
    botao.textContent = "♥";
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  // Atualiza lista de favoritos
  if (mostrandoFavoritos) mostrarFavoritos();
}

// Lista só favoritos
function mostrarFavoritos() {
  const lista = Object.values(favoritos);
  renderizarCards(lista);
  mensagem.textContent = lista.length
    ? `${lista.length} favorito(s)`
    : "Você ainda não favoritou ninguém. Clique no ♡ de um card!";
  infoPagina.textContent = "";
  btnAnterior.disabled = true;
  btnProxima.disabled = true;
}

// Atualiza paginação
function atualizarPaginacao() {
  infoPagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  btnAnterior.disabled = paginaAtual <= 1;
  btnProxima.disabled = paginaAtual >= totalPaginas;
}

// Volta à busca normal
function recarregar() {
  mostrandoFavoritos = false;
  btnFavoritos.classList.remove("ativo");
  buscarPersonagens();
}

// Botões de página
btnAnterior.addEventListener("click", () => { paginaAtual--; buscarPersonagens(); window.scrollTo(0, 0); });
btnProxima.addEventListener("click",  () => { paginaAtual++; buscarPersonagens(); window.scrollTo(0, 0); });

// Busca com atraso
let temporizador;
campoBusca.addEventListener("input", () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => { paginaAtual = 1; recarregar(); }, 400);
});
// Filtro de status
filtroStatus.addEventListener("change", () => { paginaAtual = 1; recarregar(); });

// Botão favoritos
btnFavoritos.addEventListener("click", () => {
  mostrandoFavoritos = !mostrandoFavoritos;
  btnFavoritos.classList.toggle("ativo", mostrandoFavoritos);
  if (mostrandoFavoritos) mostrarFavoritos(); else buscarPersonagens();
});

// Início
buscarPersonagens();
