"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import EcraCarregamento from "./EcraCarregamento";
import { CURVA, TEMPO, movimentoReduzido } from "@/lib/movimento";

/**
 * Loader entre páginas e entrada do conteúdo novo.
 *
 * O App Router não emite eventos de navegação — não há `routeChangeStart` como
 * havia no Pages Router. O arranque é apanhado no clique (delegado no
 * documento, portanto vale para qualquer `<Link>` do site sem lhes tocar) e no
 * `popstate`, para o botão de voltar do browser. O fim é a mudança de
 * `usePathname()`, que só acontece quando a rota nova já está pronta a pintar.
 */
export default function TransicaoPagina({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();

  // Arranca ligado: a primeira visita também leva o emblema, em vez de o site
  // aparecer a meio de carregar as imagens de fundo.
  const [aCarregar, setACarregar] = useState(true);
  const partida = useRef<string | null>(null);
  const desde = useRef(0);
  const visto = useRef(caminho);

  useEffect(() => {
    // O relógio da primeira carga só pode começar no cliente: `performance.now()`
    // no corpo do componente daria valores diferentes no servidor e aqui.
    if (desde.current === 0) desde.current = performance.now();
  }, []);

  useEffect(() => {
    function mostrar(saidaDe: string | null) {
      partida.current = saidaDe;
      desde.current = performance.now();
      setACarregar(true);
    }

    /**
     * Desliza até uma âncora da própria página.
     *
     * Feito aqui e não com `scroll-behavior: smooth` no `html`: essa regra
     * apanha todo o scroll programático da página — o restauro de posição ao
     * voltar atrás, o scroll que o browser faz ao focar um campo — e transforma
     * cada um deles numa viagem animada, com o alvo a mexer-se por baixo do
     * dedo. Aqui só desliza o que o visitante mandou deslizar.
     */
    function deslizar(e: MouseEvent, destino: URL) {
      if (movimentoReduzido()) return;

      const alvo = document.getElementById(decodeURIComponent(destino.hash.slice(1)));
      if (!alvo) return;

      // Sem isto seguia-se o salto seco do browser e o deslize não se via
      e.preventDefault();
      history.pushState(null, "", destino.href);
      // `scroll-margin-top` do tema tira o alvo de debaixo do cabeçalho fixo
      alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function aoClicar(e: MouseEvent) {
      // Cliques já tratados, com modificador, ou de outro botão que não o
      // esquerdo, não são navegação nossa — abrem noutro separador ou nada.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const ligacao = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!ligacao) return;
      if (ligacao.target && ligacao.target !== "_self") return;
      if (ligacao.hasAttribute("download")) return;
      // Uma ligação desligada não vai a lado nenhum: sem isto o loader ficava
      // aberto à espera de uma rota que nunca chega.
      if (ligacao.getAttribute("aria-disabled") === "true") return;

      const destino = new URL(ligacao.href, location.href);
      if (destino.origin !== location.origin) return;

      // Âncora dentro da mesma página é um salto de scroll, não uma navegação:
      // não leva loader, leva deslize.
      if (destino.pathname === location.pathname) {
        if (destino.hash) deslizar(e, destino);
        return;
      }

      mostrar(location.pathname);
    }

    function aoVoltar() {
      // Voltar de uma âncora não muda de página, só de sítio: sem esta guarda o
      // loader cobria o ecrã para um salto que nem sequer recarrega nada.
      if (visto.current === location.pathname) return;
      // Aqui o caminho já mudou por baixo dos pés: sem referência de partida, o
      // fecho fica só à conta do tempo mínimo.
      mostrar(null);
    }

    /* Fase de captura, e não a de borbulhar, por duas razões que se completam:
       o `next/link` chama `preventDefault()` no seu próprio handler, e a
       borbulhar chegaríamos aqui já com `defaultPrevented` a verdadeiro em
       todas as navegações; e o `next/link` verifica `defaultPrevented` antes de
       navegar, portanto o `preventDefault()` do deslize basta para o travar,
       sem precisar de `stopPropagation()` — que mataria o `onClick` que fecha o
       menu do telemóvel. */
    document.addEventListener("click", aoClicar, true);
    addEventListener("popstate", aoVoltar);
    return () => {
      document.removeEventListener("click", aoClicar, true);
      removeEventListener("popstate", aoVoltar);
    };
  }, []);

  // Última página vista, para o `popstate` distinguir mudar de página de saltar
  // dentro dela
  useEffect(() => { visto.current = caminho; }, [caminho]);

  useEffect(() => {
    if (!aCarregar) return;

    // Ainda estamos na página de onde saímos: a rota nova não chegou. Só a rede
    // de segurança fecha isto, para um erro de rede não trancar o site.
    if (partida.current !== null && partida.current === caminho) {
      const limite = setTimeout(() => setACarregar(false), TEMPO.loaderLimite);
      return () => clearTimeout(limite);
    }

    const minimo = movimentoReduzido() ? 0 : TEMPO.loaderMinimo;
    const restante = Math.max(0, minimo - (performance.now() - desde.current));
    const fim = setTimeout(() => {
      partida.current = null;
      setACarregar(false);
    }, restante);
    return () => clearTimeout(fim);
  }, [caminho, aCarregar]);

  return (
    <>
      <EcraCarregamento visivel={aCarregar} />
      {/* A chave por caminho é o que faz cada página entrar de novo; sem ela o
          React reaproveita a árvore e a entrada só se via na primeira. */}
      <Box
        key={caminho}
        data-pagina
        sx={{
          animation: `paginaEntra ${TEMPO.longo}ms ${CURVA.entrada} ${TEMPO.loaderFade / 2}ms both`
        }}
      >
        {children}
      </Box>
    </>
  );
}
