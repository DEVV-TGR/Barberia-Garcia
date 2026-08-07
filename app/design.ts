/* Fontes da casa e reexportação da paleta.
   Sem "use client": é importado tanto por componentes de servidor como de
   cliente. Se as fontes vivessem dentro do tema (que é cliente), o servidor
   receberia apenas uma referência e `tituloFonte.style` chegaria vazio. */

import { Oswald, Figtree } from "next/font/google";

export { cores, TEXTO_MINIMO } from "@/lib/cores";

export const tituloFonte = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export const corpoFonte = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});
