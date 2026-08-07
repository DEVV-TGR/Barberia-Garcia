"use client";

import { useCallback, useEffect, useState } from "react";
import * as M from "./marcacoes";
import type { Marcacao } from "./dados";

/**
 * Ponte entre o motor e o React.
 *
 * O motor guarda em localStorage, que não existe no servidor. Se o primeiro
 * render já contasse com a agenda, o HTML do servidor e o do cliente ficariam
 * diferentes e o React queixava-se. Por isso `pronto` começa falso: só depois
 * de montar é que se lê o armazenamento e se semeia a agenda de exemplo.
 */
export function useMarcacoes() {
  const [pronto, setPronto] = useState(false);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    M.recarregar();
    M.semearAgenda();
    setPronto(true);
  }, []);

  /** Assinala que os dados mudaram, para quem depende deles voltar a desenhar. */
  const actualizar = useCallback(() => setVersao((v) => v + 1), []);

  const criar = useCallback((pedido: Parameters<typeof M.criarMarcacao>[0]) => {
    const r = M.criarMarcacao(pedido);
    if (r.marcacao) actualizar();
    return r;
  }, [actualizar]);

  const anular = useCallback((id: string) => {
    M.anularMarcacao(id);
    actualizar();
  }, [actualizar]);

  const mudarEstado = useCallback((id: string, estado: Marcacao["estado"]) => {
    M.definirEstado(id, estado);
    actualizar();
  }, [actualizar]);

  const semear = useCallback(() => {
    M.semearAgenda();
    actualizar();
  }, [actualizar]);

  const limpar = useCallback(() => {
    M.limparTudo();
    actualizar();
  }, [actualizar]);

  return { pronto, versao, criar, anular, mudarEstado, semear, limpar, actualizar };
}

const CHAVE_CLIENTE = "barbearia-garcia:cliente:v1";

export interface DadosCliente { nome: string; telemovel: string; }

/** Guarda o nome e o contacto para a marcação seguinte. */
export function useCliente() {
  const [cliente, setCliente] = useState<DadosCliente>({ nome: "", telemovel: "" });

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE_CLIENTE);
      if (bruto) setCliente(JSON.parse(bruto) as DadosCliente);
    } catch { /* nada guardado */ }
  }, []);

  const guardar = useCallback((d: DadosCliente) => {
    setCliente(d);
    try { localStorage.setItem(CHAVE_CLIENTE, JSON.stringify(d)); }
    catch { /* segue sem guardar */ }
  }, []);

  return { cliente, guardar };
}

/** Descarrega um ficheiro gerado no navegador. */
export function descarregar(nome: string, conteudo: string, tipo = "text/calendar;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // O Safari precisa do URL vivo durante o clique
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
