# Wiki de Jogos (protótipo)

Wiki sobre a história dos videogames feita só com HTML, CSS e JavaScript, sem backend.

## Como abrir

- **Duplo clique** em `index.html` funciona.
- Com servidor local (por exemplo, a extensão Live Server do VS Code) a wiki lê `data/games.json` direto.

## Estrutura

```
index.html            página única, as telas são montadas pelo JavaScript
css/style.css         tema azul, amarelo e branco, com laranja para ênfase
js/app.js             busca, rotas, linha do tempo, comentários e formulário
data/games.json       banco de dados (fonte dos dados): eras e jogos
data/games-data.js    cópia do JSON para abrir sem servidor (gerada)
gerar-fallback.py     atualiza o games-data.js a partir do games.json
img/                  coloque aqui as capas e fotos de consoles
```

## Como adicionar um jogo

1. Abra `data/games.json` e copie um item de `jogos`.
2. Preencha `id` (sem espaços ou acentos), `titulo`, `ano`, `era` (um `id` de `eras`), `genero`, `empresa`, `sinopse`, `mecanicas`, `curiosidade` e `tags`.
3. Para aparecer na Galeria de Pioneiros, use `"pioneiro": true` e escreva a `frase` de impacto.
4. Rode `python3 gerar-fallback.py` (só é necessário para abrir com duplo clique).

## Como colocar imagens

As capas desta versão são ilustrações genéricas geradas pelo JavaScript. Para usar a imagem oficial de um jogo:

1. Salve o arquivo em `img/`, por exemplo `img/pong.jpg`.
2. No `games.json`, preencha `"imagem": "img/pong.jpg"` no jogo.

Se o arquivo não carregar, a wiki volta sozinha para a capa ilustrada. O mesmo vale para a foto do console principal de cada geração (campo `imagem` dentro de `eras`). Cuide dos direitos de uso e cite a fonte, por exemplo imagens livres do Wikimedia Commons.

## Funcionalidades do roteiro

- Barra de pesquisa com sugestões e filtro dinâmico (título, ano, empresa, gênero e tags).
- Galeria de Pioneiros na página inicial.
- Linha do Tempo clicável com resumo e console principal.
- Página de jogo com capa, sinopse, ficha técnica, mecânicas, "Você sabia?" e tags clicáveis.
- Comentários salvos no `localStorage` do navegador.
- Formulário "Apoie / Seja um contribuinte" com mensagem de agradecimento.

## Fonte do conteúdo

Resumos baseados no artigo "História dos jogos eletrônicos" da Wikipédia (CC BY-SA).
