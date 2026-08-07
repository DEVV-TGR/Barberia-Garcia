/* ==========================================================================
   Página inicial
   ========================================================================== */

import { CASA, BARBEIROS, SERVICOS, GALERIA } from "./dados.js";
import { $, euros, duracao, escapar, arrancarComum } from "./nucleo.js";

const POR_EXTENSO = {
  25: "Vinte e cinco", 26: "Vinte e seis", 27: "Vinte e sete", 28: "Vinte e oito",
  29: "Vinte e nove", 30: "Trinta", 31: "Trinta e um", 32: "Trinta e dois",
  33: "Trinta e três", 34: "Trinta e quatro", 35: "Trinta e cinco"
};

function pintarServicos() {
  const grupos = [...new Set(SERVICOS.map((s) => s.grupo))];
  $("#lista-servicos").innerHTML = grupos.map((g) => `
    <h3 class="grupo-titulo">${escapar(g)}</h3>
    <ul class="lista-servicos">
      ${SERVICOS.filter((s) => s.grupo === g).map((s) => `
        <li class="servico">
          <span class="servico__nome">${escapar(s.nome)}</span>
          <span class="servico__duracao">${duracao(s.minutos)}</span>
          <span class="servico__preco${s.preco === 0 ? " sob-consulta" : ""}">${euros(s.preco)}</span>
          <a class="botao botao--pequeno" href="marcar.html?servico=${encodeURIComponent(s.id)}"
             aria-label="Marcar ${escapar(s.nome)}">Marcar</a>
        </li>`).join("")}
    </ul>`).join("");
}

function pintarEquipa() {
  $("#grelha-equipa").innerHTML = BARBEIROS.map((b, i) => `
    <article class="barbeiro">
      <div class="barbeiro__foto">
        <span class="barbeiro__num">0${i + 1}</span>
        <img src="${b.foto}" alt="Retrato de ${escapar(b.nome)}" loading="lazy">
        <div class="barbeiro__id">
          <h3>${escapar(b.nome)}</h3>
          <p>${escapar(b.papel)}</p>
        </div>
      </div>
      <p class="barbeiro__bio">${escapar(b.bio)}</p>
    </article>`).join("");
}

function pintarGaleria() {
  $("#grelha-galeria").innerHTML = GALERIA.map((g) => `
    <figure><img src="${g.src}" alt="${escapar(g.alt)}" loading="lazy"></figure>`).join("");
}

function pintarHorario() {
  const hoje = new Date().getDay();
  $("#horario").innerHTML = [1, 2, 3, 4, 5, 6, 0].map((i) => {
    const h = CASA.horario[i];
    return `<li class="${i === hoje ? "hoje" : ""}">
      <span>${h.dia}</span>
      ${h.aberto ? `<span>${h.abre} – ${h.fecha}</span>` : `<span class="fechado">Encerrado</span>`}
    </li>`;
  }).join("");
}

function iniciar() {
  const anos = new Date().getFullYear() - CASA.desde;
  const alvo = $("#anos-casa");
  if (alvo) alvo.textContent = POR_EXTENSO[anos] || `${anos}`;

  pintarServicos();
  pintarEquipa();
  pintarGaleria();
  pintarHorario();
  arrancarComum();
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", iniciar);
else iniciar();
