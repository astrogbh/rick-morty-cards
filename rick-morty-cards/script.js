// PASSO 3: a lógica. Aqui o site "conversa" com a API e cria os cards.

// ---------- 1) Configurações e estado ----------
const API_URL = "https://rickandmortyapi.com/api/character";

// "estado" guarda o que o usuário escolheu no momento
let paginaAtual = 1;
let totalPaginas = 1;

// Favoritos ficam salvos no navegador (localStorage) mesmo se fechar a aba.
// Guardamos um objeto { id: personagem } para poder mostrar favoritos sem chamar a API.
let favoritos = JSON.parse(localStorage.getItem("favoritos") || "{}");
let mostrandoFavoritos = false;

// ---------- 2) Pegando elementos do HTML ----------
const listaCards   = document.getElementById("lista-cards");
const campoBusca   = document.getElementById("busca");
const filtroStatus = document.getElementById("filtro-status");
const btnFavoritos = document.getElementById("btn-favoritos");
const btnAnterior  = document.getElementById("btn-anterior");
const btnProxima   = document.getElementById("btn-proxima");
const infoPagina   = document.getElementById("info-pagina");
const mensagem     = document.getElementById("mensagem");

// ---------- 3) Consumindo a API com fetch ----------
async function buscarPersonagens() {
  // Monta a URL com os parâmetros: ?page=1&name=rick&status=alive
  const params = new URLSearchParams({ page: paginaAtual });
  if (campoBusca.value.trim()) params.set("name", campoBusca.value.trim());
  if (filtroStatus.value)      params.set("status", filtroStatus.value);

  mensagem.textContent = "Carregando personagens...";
  listaCards.innerHTML = "";

  try {
    // fetch devolve uma Promise; "await" espera a resposta chegar
    const resposta = await fetch(`${API_URL}?${params}`);

    // A API responde 404 quando a busca não encontra nada
    if (resposta.status === 404) {
      totalPaginas = 1;
      atualizarPaginacao();
      mensagem.textContent = "Nenhum personagem encontrado.";
      return;
    }
    if (!resposta.ok) throw new Error("Erro HTTP " + resposta.status);

    // Converte o corpo da resposta de texto JSON para objeto JavaScript
    const dados = await resposta.json();
    console.log("Resposta da API:", dados); // útil para mostrar no vídeo!

    totalPaginas = dados.info.pages;
    mensagem.textContent = `${dados.info.count} personagens encontrados`;
    renderizarCards(dados.results);
    atualizarPaginacao();
  } catch (erro) {
    console.error(erro);
    mensagem.textContent = "Erro ao carregar os dados. Verifique sua internet e tente de novo.";
  }
}

// ---------- 4) Criando os cards com DOM (createElement + appendChild) ----------
function criarCard(personagem) {
  const card = document.createElement("article");
  card.className = "card";

  // Botão de coração (favoritar)
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
  imagem.loading = "lazy"; // só carrega a imagem quando aparece na tela

  // Informações extras (status, espécie, origem, episódios)
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

  // Monta o card: cada appendChild coloca um elemento dentro do outro
  card.appendChild(coracao);
  card.appendChild(nome);
  card.appendChild(imagem);
  card.appendChild(infos);
  return card;
}

function renderizarCards(personagens) {
  listaCards.innerHTML = "";
  personagens.forEach((p) => listaCards.appendChild(criarCard(p)));
}

// ---------- 5) Favoritos ----------
function alternarFavorito(personagem, botao) {
  if (favoritos[personagem.id]) {
    delete favoritos[personagem.id];
    botao.textContent = "♡";
  } else {
    favoritos[personagem.id] = personagem;
    botao.textContent = "♥";
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  // Se estamos na tela de favoritos, recarrega a lista (o card desfavoritado some)
  if (mostrandoFavoritos) mostrarFavoritos();
}

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

// ---------- 6) Paginação e eventos ----------
function atualizarPaginacao() {
  infoPagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  btnAnterior.disabled = paginaAtual <= 1;
  btnProxima.disabled = paginaAtual >= totalPaginas;
}

function recarregar() {
  mostrandoFavoritos = false;
  btnFavoritos.classList.remove("ativo");
  buscarPersonagens();
}

btnAnterior.addEventListener("click", () => { paginaAtual--; buscarPersonagens(); window.scrollTo(0, 0); });
btnProxima.addEventListener("click",  () => { paginaAtual++; buscarPersonagens(); window.scrollTo(0, 0); });

// Busca: espera o usuário parar de digitar por 400ms (evita chamar a API a cada letra)
let temporizador;
campoBusca.addEventListener("input", () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => { paginaAtual = 1; recarregar(); }, 400);
});
filtroStatus.addEventListener("change", () => { paginaAtual = 1; recarregar(); });

btnFavoritos.addEventListener("click", () => {
  mostrandoFavoritos = !mostrandoFavoritos;
  btnFavoritos.classList.toggle("ativo", mostrandoFavoritos);
  if (mostrandoFavoritos) mostrarFavoritos(); else buscarPersonagens();
});

// ---------- 7) Começa tudo ao abrir a página ----------
buscarPersonagens();
