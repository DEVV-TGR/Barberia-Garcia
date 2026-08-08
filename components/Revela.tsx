"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { CURVA, TEMPO, movimentoReduzido } from "@/lib/movimento";

/**
 * Revela o conteúdo quando ele entra no ecrã. Recebe secções inteiras vindas do
 * servidor como `children` — não as torna clientes, só lhes põe uma moldura por
 * cima.
 *
 * O observador desliga-se à primeira: uma secção que já foi vista não volta a
 * desaparecer ao rolar para trás, que é dos tiques mais cansativos da web.
 */
export default function Revela({
  children,
  atraso = 0,
  deslocamento = 28
}: {
  children: React.ReactNode;
  /** Milissegundos a esperar depois de entrar no ecrã. */
  atraso?: number;
  /** Quantos pixéis sobe ao aparecer. */
  deslocamento?: number;
}) {
  const alvo = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = alvo.current;
    if (!elemento) return;

    if (movimentoReduzido() || typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisivel(true);
        observador.disconnect();
      },
      // Uma nesga da secção chega para começar; a margem negativa em baixo
      // impede que apareça enquanto ainda mal se vê.
      { threshold: 0.04, rootMargin: "0px 0px -8% 0px" }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <Box
      ref={alvo}
      data-revela
      sx={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? "none" : `translate3d(0, ${deslocamento}px, 0)`,
        transition: [
          `opacity ${TEMPO.longo}ms ${CURVA.entrada} ${atraso}ms`,
          `transform ${TEMPO.longo}ms ${CURVA.entrada} ${atraso}ms`
        ].join(", "),
        // Sem isto o browser repinta a secção toda a cada frame do translate
        willChange: visivel ? "auto" : "opacity, transform"
      }}
    >
      {children}
    </Box>
  );
}
