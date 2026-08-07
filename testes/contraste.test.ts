/* Contraste WCAG 2.1 da paleta — texto normal 4.5:1, texto grande 3:1.
   As combinações são medidas, não presumidas. */

import { describe, it, expect } from "vitest";
import { cores } from "../lib/cores";

const luminancia = (hex: string): number => {
  const canais = hex.replace("#", "").match(/../g)!.map((h) => {
    const v = parseInt(h, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
};

export const contraste = (a: string, b: string): number => {
  const [l1, l2] = [luminancia(a), luminancia(b)];
  const [alto, baixo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (alto + 0.05) / (baixo + 0.05);
};

const PARES: [string, string, string, number][] = [
  ["texto sobre fundo",            cores.texto,  cores.fundo,  4.5],
  ["texto sobre superfície",       cores.texto,  cores.fundo2, 4.5],
  ["texto sobre cartão",           cores.texto,  cores.fundo3, 4.5],
  ["texto secundário sobre fundo", cores.texto2, cores.fundo,  4.5],
  ["texto secundário sobre superfície", cores.texto2, cores.fundo2, 4.5],
  ["acento sobre fundo",           cores.acento, cores.fundo,  4.5],
  ["acento sobre superfície",      cores.acento, cores.fundo2, 4.5],
  ["acento sobre cartão",          cores.acento, cores.fundo3, 4.5],
  ["botão: fundo sobre acento",    cores.fundo,  cores.acento, 4.5],
  ["botão hover",                  cores.fundo,  cores.acento2, 4.5],
  ["botão desactivado",            cores.texto2, cores.fundo3, 4.5],
  ["barra de acção: texto",        cores.fundo,  cores.acento, 4.5],
  ["texto grande sobre cartão",    cores.texto,  cores.fundo3, 3.0]
];

describe("contraste da paleta", () => {
  it.each(PARES)("%s tem contraste suficiente", (_nome, fg, bg, minimo) => {
    expect(contraste(fg, bg)).toBeGreaterThanOrEqual(minimo);
  });
});
