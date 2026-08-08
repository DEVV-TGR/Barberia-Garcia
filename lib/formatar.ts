/** Apresentação de preços e durações, igual em todo o lado. */

export const euros = (v: number): string => (v === 0 ? "Sob orçamento" : `${v} €`);

export const duracao = (m: number): string =>
  m >= 60
    ? m % 60 === 0
      ? `${m / 60} h`
      : `${Math.floor(m / 60)} h ${m % 60} min`
    : `${m} min`;

const POR_EXTENSO: Record<number, string> = {
  25: "Vinte e cinco", 26: "Vinte e seis", 27: "Vinte e sete", 28: "Vinte e oito",
  29: "Vinte e nove", 30: "Trinta", 31: "Trinta e um", 32: "Trinta e dois",
  33: "Trinta e três", 34: "Trinta e quatro", 35: "Trinta e cinco"
};

export const anosPorExtenso = (n: number): string => POR_EXTENSO[n] ?? String(n);
