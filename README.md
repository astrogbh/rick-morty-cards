# Rick & Morty — Cards de Personagens

Aplicação front-end que consome em tempo real a [Rick and Morty API](https://rickandmortyapi.com/) e exibe os personagens em **cards criados dinamicamente com JavaScript**.

Projeto desenvolvido para a disciplina de **Web Development Front-End**, utilizando apenas **HTML, CSS e JavaScript puro** (sem frameworks).

**Site publicado:** _adicione aqui o link do GitHub Pages_
**Vídeo pitch:** _adicione aqui o link do YouTube_

---

## Funcionalidades

- Cards gerados 100% via JavaScript (`createElement` + `appendChild`); o HTML possui apenas um container vazio.
- Cada card exibe **nome, imagem, status, espécie, gênero, origem e número de episódios**.
- **Busca** por nome (com *debounce* para não sobrecarregar a API).
- **Filtro** por status (vivo, morto, desconhecido).
- **Paginação** (20 personagens por página).
- **Favoritos** (♡ / ♥) salvos no `localStorage`, com visualização apenas dos favoritos.
- Tratamento de **carregando**, **erro de rede** e **nenhum resultado** (404 da API).
- Layout **responsivo** (CSS Grid) para desktop e celular.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica da página |
| CSS3 | Estilo, variáveis CSS, Grid, tema inspirado no portal verde da série |
| JavaScript (ES6+) | `fetch`, `async/await`, manipulação do DOM, eventos, `localStorage` |

## Estrutura do projeto

```
rick-morty-cards/
├── index.html   # Estrutura da página (container vazio para os cards)
├── style.css    # Estilos e responsividade
└── script.js    # Consumo da API e criação dos cards
```

## Como executar

Não é necessário instalar nada nem criar token.

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/rick-morty-cards.git
   ```
2. Abra a pasta `rick-morty-cards`.
3. Abra o `index.html` no navegador (ou use a extensão **Live Server** do VS Code).

> É preciso estar conectado à internet, pois os dados vêm da API em tempo real.

## API utilizada

- **Documentação:** https://rickandmortyapi.com/documentation
- **Endpoint:** `GET https://rickandmortyapi.com/api/character`
- **Autenticação:** nenhuma (sem token)
- **Parâmetros usados:** `page`, `name`, `status`

Exemplo: `https://rickandmortyapi.com/api/character?page=2&name=rick&status=alive`

Estrutura resumida da resposta:

```json
{
  "info": { "count": 826, "pages": 42, "next": "...?page=2", "prev": null },
  "results": [
    {
      "id": 1,
      "name": "Rick Sanchez",
      "status": "Alive",
      "species": "Human",
      "gender": "Male",
      "origin": { "name": "Earth (C-137)" },
      "image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
      "episode": ["..."]
    }
  ]
}
```

## Como funciona (resumo do código)

1. `buscarPersonagens()` monta a URL com os filtros e chama a API com `fetch`.
2. A resposta é convertida com `resposta.json()`.
3. Para cada personagem, `criarCard()` cria os elementos com `document.createElement`.
4. Os elementos são encaixados com `appendChild` e inseridos em `#lista-cards`.
5. Eventos (`addEventListener`) disparam novas buscas ao filtrar, pesquisar ou mudar de página.

## Créditos

Dados fornecidos pela [Rick and Morty API](https://rickandmortyapi.com/). Rick and Morty é propriedade de seus respectivos detentores; este projeto tem fins exclusivamente educacionais.
