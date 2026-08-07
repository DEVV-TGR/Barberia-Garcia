/* ==========================================================================
   Núcleo — utilidades partilhadas pelas três páginas
   ========================================================================== */

import { CASA } from "./dados.js";
import { estaAbertoAgora } from "./marcacoes.js";

export const $  = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const euros = (v) => (v === 0 ? "Sob orçamento" : `${v} €`);

export const duracao = (m) => (m >= 60
  ? (m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)} h ${m % 60} min`)
  : `${m} min`);

export const escapar = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ── Navegação partilhada ────────────────────────────────────────────────── */

export function ligarNavegacao() {
  const cabecalho = $("#cabecalho");
  if (cabecalho) {
    const aoRolar = () => cabecalho.classList.toggle("encolhido", window.scrollY > 50);
    aoRolar();
    addEventListener("scroll", aoRolar, { passive: true });
  }

  const botao = $("#abre-menu");
  const menu = $("#menu");
  if (!botao || !menu) return;

  const fechar = () => {
    menu.classList.remove("aberto");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu");
  };

  botao.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
  $$("#menu a").forEach((a) => a.addEventListener("click", fechar));
  addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });

  // Assinalar a página actual no menu
  const aqui = location.pathname.split("/").pop() || "index.html";
  $$("#menu a[href]").forEach((a) => {
    if (a.getAttribute("href") === aqui) a.setAttribute("aria-current", "page");
  });
}

/* ── Revelação ao scroll ─────────────────────────────────────────────────── */

export function ligarRevelacao() {
  const alvos = $$(".revelar");
  if (!alvos.length) return;
  if (!("IntersectionObserver" in window)) {
    alvos.forEach((a) => a.classList.add("visivel"));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
  alvos.forEach((a) => obs.observe(a));
}

/* ── Rodapé ──────────────────────────────────────────────────────────────── */

export function pintarRodape() {
  const ano = $("#ano");
  if (ano) ano.textContent = new Date().getFullYear();

  const alvo = $("#rodape-horario");
  if (alvo) {
    const hoje = new Date().getDay();
    alvo.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((i) => {
      const h = CASA.horario[i];
      return `<li${i === hoje ? ' class="hoje"' : ""}>
        <span>${h.dia}</span>
        <span>${h.aberto ? `${h.abre}–${h.fecha}` : "Encerrado"}</span>
      </li>`;
    }).join("");
  }

  const estado = $("#estado-loja");
  if (estado) {
    const e = estaAbertoAgora();
    estado.classList.toggle("aberta", e.aberto);
    const txt = $("#estado-texto");
    if (txt) txt.textContent = e.aberto ? e.motivo : `Fechado · ${e.motivo}`;
  }
}

/* ── Descarregar ficheiro gerado no navegador ────────────────────────────── */

export function descarregar(nome, conteudo, tipo = "text/calendar;charset=utf-8") {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Adiar a revogação: o Safari precisa do URL vivo durante o clique
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ── Arranque comum ──────────────────────────────────────────────────────── */

export function arrancarComum() {
  ligarNavegacao();
  ligarRevelacao();
  pintarRodape();
}
