/* ==========================================================================
   Painel interno — agenda dos barbeiros
   --------------------------------------------------------------------------
   O código de acesso está no código-fonte: numa demonstração sem servidor não
   há forma de o esconder. Serve para separar o painel do site público, não
   para proteger dados.
   ========================================================================== */

import { BARBEIROS } from "./dados.js";
import * as M from "./marcacoes.js";
import { $, $$, euros, duracao, escapar, arrancarComum } from "./nucleo.js";

const CODIGO = "1997";
const CHAVE_SESSAO = "barbearia-garcia:painel:v1";

const estado = {
  dia: M.chaveData(new Date()),
  barbeiro: ""            // vazio = todos
};

/* ── Acesso ──────────────────────────────────────────────────────────────── */

function entrar() {
  $("#entrada-painel").hidden = true;
  $("#painel-agenda").hidden = false;
  pintarFiltros();
  pintarDia();
}

function sair() {
  try { sessionStorage.removeItem(CHAVE_SESSAO); } catch { /* ignorado */ }
  $("#painel-agenda").hidden = true;
  $("#entrada-painel").hidden = false;
  $("#pin").value = "";
}

/* ── Filtros ─────────────────────────────────────────────────────────────── */

function pintarFiltros() {
  $("#filtros").innerHTML = [
    `<button type="button" class="filtro" data-barbeiro="" aria-pressed="${estado.barbeiro === ""}">Todos</button>`,
    ...BARBEIROS.map((b) => `
      <button type="button" class="filtro" data-barbeiro="${b.id}" aria-pressed="${estado.barbeiro === b.id}">
        <img src="${b.foto}" alt="" loading="lazy">${escapar(b.nome.split(" ")[0])}
      </button>`)
  ].join("");

  $$(".filtro").forEach((b) => b.addEventListener("click", () => {
    estado.barbeiro = b.dataset.barbeiro;
    pintarFiltros();
    pintarDia();
  }));
}

/* ── Agenda ──────────────────────────────────────────────────────────────── */

function pintarDia() {
  $("#selector-dia").value = estado.dia;

  const hoje = M.chaveData(new Date());
  const extenso = M.dataPorExtenso(estado.dia);
  $("#dia-extenso").textContent =
    estado.dia === hoje ? `Hoje — ${extenso}` : extenso[0].toUpperCase() + extenso.slice(1);

  const r = M.resumoDoDia(estado.dia, estado.barbeiro);
  $("#resumo-dia").innerHTML = `
    <div><dt>Marcações</dt><dd>${r.total}</dd></div>
    <div><dt>Ocupação</dt><dd>${Math.floor(r.minutos / 60)}<small> h ${r.minutos % 60} min</small></dd></div>
    <div><dt>Receita prevista</dt><dd>${r.receita}<small> €</small></dd></div>
    <div><dt>Concluídas</dt><dd>${r.concluidas}<small> de ${r.total}</small></dd></div>`;

  const lista = M.marcacoesDe(estado.dia, estado.barbeiro);
  const alvo = $("#agenda");

  if (!lista.length) {
    const fechado = !M.expedienteDe(estado.dia);
    alvo.innerHTML = `<div class="agenda-vazia">
      <strong>${fechado ? "Encerrado" : "Sem marcações"}</strong>
      ${fechado ? "A barbearia não abre ao domingo." : "Não há nada agendado para este dia."}
    </div>`;
    return;
  }

  alvo.innerHTML = `<ul class="agenda__lista">${lista.map((m) => {
    const s = M.servicoPorId(m.servicoId);
    const b = M.barbeiroPorId(m.barbeiroId);
    const est = M.ESTADOS[m.estado] || M.ESTADOS.agendada;
    return `<li class="marcacao ${escapar(m.estado)}">
      <div class="marcacao__hora">
        ${M.paraHoras(m.inicio)}
        <small>até ${M.paraHoras(m.inicio + m.minutos)}</small>
      </div>

      <div>
        <p class="marcacao__quem">${escapar(m.nome)}</p>
        <p class="marcacao__linha">
          ${escapar(s ? s.nome : "—")} · ${duracao(m.minutos)} · ${euros(m.preco)}
        </p>
        ${m.telemovel ? `<p class="marcacao__linha"><a href="tel:${escapar(m.telemovel)}">${escapar(m.telemovel)}</a> · ${escapar(m.codigo)}</p>` : ""}
        ${m.notas ? `<p class="marcacao__notas">${escapar(m.notas)}</p>` : ""}
        <p class="marcacao__barbeiro">
          ${b ? `<img src="${b.foto}" alt="" loading="lazy">` : ""}${escapar(M.nomeBarbeiro(m.barbeiroId))}
        </p>
      </div>

      <div class="marcacao__accoes">
        <span class="selo selo--${escapar(m.estado)}">${escapar(est.rotulo)}</span>
        ${m.estado !== "concluida" ? `<button type="button" class="accao accao--ok" data-estado="concluida" data-id="${m.id}">Concluída</button>` : ""}
        ${m.estado !== "falta" ? `<button type="button" class="accao accao--falta" data-estado="falta" data-id="${m.id}">Faltou</button>` : ""}
        ${m.estado !== "agendada" ? `<button type="button" class="accao" data-estado="agendada" data-id="${m.id}">Reabrir</button>` : ""}
        <button type="button" class="accao accao--falta" data-anular="${m.id}">Anular</button>
      </div>
    </li>`;
  }).join("")}</ul>`;

  $$("[data-estado]").forEach((b) => b.addEventListener("click", () => {
    M.definirEstado(b.dataset.id, b.dataset.estado);
    pintarDia();
  }));

  $$("[data-anular]").forEach((b) => b.addEventListener("click", () => {
    if (!confirm("Anular esta marcação?")) return;
    M.anularMarcacao(b.dataset.anular);
    pintarDia();
  }));
}

function moverDia(passos) {
  const d = M.dataDeChave(estado.dia);
  d.setDate(d.getDate() + passos);
  estado.dia = M.chaveData(d);
  pintarDia();
}

/* ── Arranque ────────────────────────────────────────────────────────────── */

function iniciar() {
  arrancarComum();

  $("#form-pin").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("#pin").value.trim() !== CODIGO) {
      $("#erro-pin").textContent = "Código errado.";
      $("#pin").select();
      return;
    }
    $("#erro-pin").textContent = "";
    try { sessionStorage.setItem(CHAVE_SESSAO, "1"); } catch { /* ignorado */ }
    entrar();
  });

  $("#sair").addEventListener("click", sair);
  $("#dia-anterior").addEventListener("click", () => moverDia(-1));
  $("#dia-seguinte").addEventListener("click", () => moverDia(1));
  $("#ir-hoje").addEventListener("click", () => { estado.dia = M.chaveData(new Date()); pintarDia(); });
  $("#selector-dia").addEventListener("change", (e) => {
    if (e.target.value) { estado.dia = e.target.value; pintarDia(); }
  });

  $("#carregar-exemplo").addEventListener("click", () => {
    M.semearAgenda();
    pintarDia();
  });

  $("#limpar-tudo").addEventListener("click", () => {
    if (!confirm("Apagar todas as marcações guardadas neste navegador?")) return;
    M.limparTudo();
    pintarDia();
  });

  // Mantém a sessão ao recarregar, mas não entre separadores fechados
  let jaEntrou = false;
  try { jaEntrou = sessionStorage.getItem(CHAVE_SESSAO) === "1"; } catch { /* ignorado */ }
  if (jaEntrou) entrar();
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", iniciar);
else iniciar();
