/* Vocabulário de movimento da casa.
   Sem dependências e sem "use client": é lido pelo tema, pelos componentes de
   cliente e pelos testes. Ter as curvas e os tempos num só sítio evita que cada
   componente invente a sua — é o que faz um site parecer feito de uma peça. */

/** Curvas. Nenhuma é linear: nada no mundo real arranca e pára de repente. */
export const CURVA = {
  /** Uso geral — hovers, cores, bordas. Arranca depressa e assenta devagar. */
  suave: "cubic-bezier(0.22, 0.61, 0.36, 1)",
  /** Entradas — algo que aparece deve travar com folga no fim. */
  entrada: "cubic-bezier(0.16, 1, 0.30, 1)",
  /** Saídas — o contrário: sai a acelerar, porque já não interessa. */
  saida: "cubic-bezier(0.55, 0, 0.85, 0.35)",
  /** Abrir painéis: chega depressa ao tamanho e assenta o resto devagar. */
  painel: "cubic-bezier(0.32, 0.72, 0, 1)",
  /**
   * Fechar painéis altos. A curva de abertura, ao contrário, come 90 % da
   * altura no primeiro terço do tempo: com mil e tal pixéis a desaparecer, isso
   * lê-se como um estalo, não como um fecho. Esta arranca devagar, acelera a
   * meio e trava no fim — vê-se a lista a dobrar-se.
   */
  dobrar: "cubic-bezier(0.62, 0.02, 0.28, 1)"
} as const;

/** Tempos, em milissegundos. */
export const TEMPO = {
  micro: 160,
  curto: 240,
  medio: 380,
  longo: 560,
  /** Abertura/fecho do accordion dos serviços. */
  painel: 420,
  /** Desvanecer do ecrã de carregamento. */
  loaderFade: 380,
  /** Quanto tempo o loader fica no mínimo, para não piscar numa rota rápida. */
  loaderMinimo: 700,
  /** Rede de segurança: se a rota nunca chegar, o loader não fica preso. */
  loaderLimite: 8000
} as const;

/**
 * Quanto deve demorar um painel a abrir ou fechar, conforme o que tem dentro.
 *
 * Um tempo fixo trata mal os extremos: o grupo com dezoito serviços passa de
 * mil e tal pixéis a zero na mesma fracção de segundo que o grupo com um só, e
 * a página salta debaixo dos olhos. Cresce, mas cada vez menos, para uma lista
 * enorme não ficar eterna.
 */
export function tempoPainel(linhas: number): number {
  return Math.round(TEMPO.curto + Math.min(linhas, 20) * 15);
}

/** Escada de atrasos para entradas em série (linhas de uma lista, cartões). */
export function escada(indice: number, passo = 45, tecto = 8): string {
  return `${Math.min(indice, tecto) * passo}ms`;
}

/** Verdadeiro quando o sistema pede menos movimento. Só faz sentido no cliente. */
export function movimentoReduzido(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
