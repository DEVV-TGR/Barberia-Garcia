/* Paleta da casa. Sem dependências: é importada pelo tema, pelos componentes e
   pelos testes de contraste, que correm fora do Next. */

export const cores = {
  fundo: "#0d2a1f",
  fundo2: "#123726",
  fundo3: "#1a4632",
  fundo4: "#245c42",
  acento: "#f2b705",
  acento2: "#ffd24a",
  acento3: "#8a6a06",
  texto: "#f0ece2",
  texto2: "#a8b5ac",
  texto3: "#6d8074",
  erro: "#ff8a7a",
  ok: "#86d99a"
} as const;

/* A escala mínima de texto. A versão anterior tinha rótulos a 8.6px e 9.3px —
   ilegíveis no telemóvel, e a verdadeira causa da queixa sobre resoluções. */
export const TEXTO_MINIMO = 12;
