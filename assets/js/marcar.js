/* ==========================================================================
   Assistente de marcações
   ========================================================================== */

import { BARBEIROS, SERVICOS } from "./dados.js";
import * as M from "./marcacoes.js";
import { $, $$, euros, duracao, escapar, arrancarComum, descarregar } from "./nucleo.js";

const CHAVE_CLIENTE = "barbearia-garcia:cliente:v1";
const TOTAL_PASSOS = 4;

const estado = {
  passo: 1,
  servicoId: null,
  barbeiroId: null,
  data: null,
  inicio: null,
  ultima: null,
  mesVisivel: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
};

/* ── Passo 1: serviços ───────────────────────────────────────────────────── */

const cartaoServico = (s) => `
  <label class="opcao">
    <input type="radio" name="servico" value="${s.id}">
    <span class="opcao__corpo">
      <span>
        ${s.destaque ? '<span class="faixa-destaque">Mais pedido</span>' : ""}
        <span class="opcao__nome">${escapar(s.nome)}</span>
        <span class="opcao__meta">${duracao(s.minutos)}</span>
      </span>
      <span class="opcao__preco">${euros(s.preco)}</span>
    </span>
  </label>`;

/* Os mais pedidos são atalhos para a carta, não opções à parte: dois radios
   com o mesmo `name` nunca poderiam estar ambos marcados. */
const atalhoServico = (s) => `
  <button type="button" class="atalho" data-atalho="${s.id}" aria-pressed="false">
    <span class="faixa-destaque">Mais pedido</span>
    <span class="opcao__nome">${escapar(s.nome)}</span>
    <span class="opcao__meta">${duracao(s.minutos)} · ${euros(s.preco)}</span>
  </button>`;

function pintarOpcoesServico() {
  const destaques = SERVICOS.filter((s) => s.destaque);
  const grupos = [...new Set(SERVICOS.map((s) => s.grupo))];

  $("#opcoes-servico").innerHTML = [
    destaques.length ? `
      <h3 class="grupo-titulo">Os mais pedidos</h3>
      <div class="atalhos">${destaques.map(atalhoServico).join("")}</div>` : "",
    // Cada grupo abre e fecha: com 18 serviços na barbearia, quem procura a
    // tatuagem tinha de percorrer a lista toda.
    ...grupos.map((g) => {
      const doGrupo = SERVICOS.filter((s) => s.grupo === g);
      return `
      <details class="grupo" open>
        <summary class="grupo-titulo">
          <span>${escapar(g)}</span>
          <span class="grupo__conta">${doGrupo.length}</span>
          <svg class="grupo__seta" viewBox="0 0 24 24" width="16" height="16" fill="none"
               stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </summary>
        <div class="opcoes">${doGrupo.map((s) => cartaoServico(s)).join("")}</div>
      </details>`;
    })
  ].join("");

  $$('#opcoes-servico input[name="servico"]').forEach((i) =>
    i.addEventListener("change", () => escolherServico(i.value)));

  $$("#opcoes-servico [data-atalho]").forEach((b) => b.addEventListener("click", () => {
    escolherServico(b.dataset.atalho);
    // Levar à entrada correspondente na carta, para se ver o que ficou escolhido
    $(`#opcoes-servico input[value="${b.dataset.atalho}"]`)
      ?.closest(".opcao")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
}

function escolherServico(id) {
  estado.servicoId = id;
  estado.data = null;   // a duração mudou: a hora escolhida deixa de servir
  estado.inicio = null;

  const radio = $(`#opcoes-servico input[value="${id}"]`);
  if (radio) radio.checked = true;
  $$("#opcoes-servico [data-atalho]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.atalho === id)));

  actualizarBarra();
}

/* ── Passo 2: barbeiros ──────────────────────────────────────────────────── */

function pintarOpcoesBarbeiro() {
  const qualquer = `
    <label class="opcao opcao--barbeiro">
      <input type="radio" name="barbeiro" value="qualquer">
      <span class="opcao__corpo">
        <span class="opcao__retrato opcao__retrato--qualquer" aria-hidden="true">✂</span>
        <span>
          <span class="opcao__nome">Sem preferência</span>
          <span class="opcao__meta">O primeiro que estiver livre</span>
        </span>
      </span>
    </label>`;

  $("#opcoes-barbeiro").innerHTML = qualquer + BARBEIROS.map((b) => `
    <label class="opcao opcao--barbeiro">
      <input type="radio" name="barbeiro" value="${b.id}">
      <span class="opcao__corpo">
        <img class="opcao__retrato" src="${b.foto}" alt="" loading="lazy">
        <span>
          <span class="opcao__nome">${escapar(b.nome)}</span>
          <span class="opcao__meta">${escapar(b.papel.split("·")[1]?.trim() || b.papel)}</span>
        </span>
      </span>
    </label>`).join("");

  $$('#opcoes-barbeiro input').forEach((i) => i.addEventListener("change", () => {
    estado.barbeiroId = i.value;
    estado.data = null; estado.inicio = null; // a agenda depende do barbeiro
    actualizarBarra();
  }));
}

/* ── Passo 3: calendário e horas ─────────────────────────────────────────── */

function pintarCalendario() {
  const servico = M.servicoPorId(estado.servicoId);
  if (!servico) return;

  const primeiro = estado.mesVisivel;
  const ano = primeiro.getFullYear(), mes = primeiro.getMonth();
  const mesNome = M.nomeMes(mes);
  $("#cal-mes").textContent = `${mesNome[0].toUpperCase()}${mesNome.slice(1)} de ${ano}`;

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const limite = new Date(hoje); limite.setDate(limite.getDate() + M.HORIZONTE_DIAS);

  const diaSemanaInicio = (new Date(ano, mes, 1).getDay() + 6) % 7; // segunda primeiro
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  let html = "";
  for (let i = 0; i < diaSemanaInicio; i++) html += `<span class="dia vazio"></span>`;

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(ano, mes, d);
    const chave = M.chaveData(data);
    const fora = data < hoje || data > limite;
    const fechado = !M.expedienteDe(chave);
    const semVaga = !fora && !fechado && !M.diaTemVaga(chave, servico, estado.barbeiroId);
    const bloqueado = fora || fechado || semVaga;
    const titulo = fechado ? "Encerrado" : semVaga ? "Sem vagas" : M.dataPorExtenso(chave);

    html += `<button type="button" class="dia${M.chaveData(new Date()) === chave ? " hoje" : ""}"
      data-dia="${chave}" ${bloqueado ? "disabled" : ""}
      aria-pressed="${estado.data === chave}" title="${escapar(titulo)}">${d}</button>`;
  }
  $("#cal-dias").innerHTML = html;

  const mesCorrente = new Date(); mesCorrente.setDate(1); mesCorrente.setHours(0, 0, 0, 0);
  $("#cal-anterior").disabled = primeiro <= mesCorrente;
  $("#cal-seguinte").disabled = primeiro >= new Date(limite.getFullYear(), limite.getMonth(), 1);

  $$("#cal-dias .dia[data-dia]").forEach((b) => b.addEventListener("click", () => {
    estado.data = b.dataset.dia;
    estado.inicio = null;
    pintarCalendario();
    pintarHoras();
    actualizarBarra();
  }));
}

function pintarHoras() {
  const zona = $("#zona-horas");
  if (!estado.data) {
    zona.innerHTML = `<p class="aguarda-dia">Escolha primeiro um dia no calendário.</p>`;
    return;
  }

  const servico = M.servicoPorId(estado.servicoId);
  const slots = M.horasDoDia(estado.data, servico, estado.barbeiroId);
  const livres = slots.filter((s) => s.livre);

  if (!livres.length) {
    zona.innerHTML = `<p class="sem-vagas">Não há vagas em ${escapar(M.dataPorExtenso(estado.data))}.<br>Escolha outro dia.</p>`;
    return;
  }

  zona.innerHTML = `
    <p class="sobrescrita">${escapar(M.dataPorExtenso(estado.data))} · ${livres.length} ${livres.length === 1 ? "vaga" : "vagas"}</p>
    <div class="horas">
      ${slots.map((s) => `
        <button type="button" class="hora" data-inicio="${s.inicio}"
          ${s.livre ? "" : 'disabled title="Ocupado"'}
          aria-pressed="${estado.inicio === s.inicio}">${s.etiqueta}</button>`).join("")}
    </div>`;

  $$(".hora[data-inicio]").forEach((b) => b.addEventListener("click", () => {
    estado.inicio = Number(b.dataset.inicio);
    $$(".hora").forEach((o) => o.setAttribute("aria-pressed", String(Number(o.dataset.inicio) === estado.inicio)));
    actualizarBarra();
  }));
}

/* ── Resumo ──────────────────────────────────────────────────────────────── */

function pintarResumo(alvo = "#resumo", marcacao = null) {
  const servico = M.servicoPorId(marcacao ? marcacao.servicoId : estado.servicoId);
  if (!servico) return;

  const data   = marcacao ? marcacao.data : estado.data;
  const inicio = marcacao ? marcacao.inicio : estado.inicio;
  const quem   = marcacao ? marcacao.barbeiroId : estado.barbeiroId;

  $(alvo).innerHTML = `
    <h4>${marcacao ? "A sua marcação" : "Resumo"}</h4>
    <dl>
      <div class="linha"><dt>Serviço</dt><dd>${escapar(servico.nome)}</dd></div>
      <div class="linha"><dt>Barbeiro</dt><dd>${escapar(M.nomeBarbeiro(quem))}</dd></div>
      <div class="linha"><dt>Dia</dt><dd>${escapar(M.dataPorExtenso(data))}</dd></div>
      <div class="linha"><dt>Hora</dt><dd>${M.paraHoras(inicio)} – ${M.paraHoras(inicio + servico.minutos)}</dd></div>
      <div class="linha total"><dt>A pagar no balcão</dt><dd>${euros(servico.preco)}</dd></div>
    </dl>`;
}

/* ── Barra de acção ──────────────────────────────────────────────────────────
   O pedido explícito: o botão de avançar tem de estar sempre à mão, sem
   obrigar a rolar até ao fim do painel.
   ------------------------------------------------------------------------ */

function actualizarBarra() {
  const barra = $("#barra-accao");
  if (estado.passo === 5) { barra.hidden = true; return; }

  const pronto = passoCompleto(estado.passo);
  barra.hidden = !pronto && estado.passo === 1;

  $("#btn-atras").hidden = estado.passo === 1;
  const avancar = $("#btn-avancar");
  avancar.disabled = !pronto;
  avancar.textContent = estado.passo === TOTAL_PASSOS ? "Confirmar" : "Avançar";

  const servico = M.servicoPorId(estado.servicoId);
  const partes = [];
  if (servico) partes.push(`${duracao(servico.minutos)} · <em>${euros(servico.preco)}</em>`);
  if (estado.barbeiroId) partes.push(escapar(M.nomeBarbeiro(estado.barbeiroId)));
  if (estado.data && estado.inicio !== null) {
    partes.push(`${escapar(M.dataPorExtenso(estado.data))}, ${M.paraHoras(estado.inicio)}`);
  }

  $("#barra-resumo").innerHTML = servico
    ? `<strong>${escapar(servico.nome)}</strong><span>${partes.join(" · ")}</span>`
    : `<span>Escolha um serviço para continuar</span>`;
}

/* ── Fluxo ───────────────────────────────────────────────────────────────── */

function passoCompleto(p) {
  if (p === 1) return Boolean(estado.servicoId);
  if (p === 2) return Boolean(estado.barbeiroId);
  if (p === 3) return Boolean(estado.data) && estado.inicio !== null;
  return p === 4;
}

function mostrarPasso(p) {
  estado.passo = p;
  $$(".painel[data-painel]").forEach((s) => { s.hidden = Number(s.dataset.painel) !== p; });

  $$("#passos li").forEach((li) => {
    const n = Number(li.dataset.passo);
    li.classList.toggle("feito", n < p);
    li.querySelector(".n").textContent = n < p ? "✓" : String(n);
    if (n === p) li.setAttribute("aria-current", "step");
    else li.removeAttribute("aria-current");
  });

  if (p === 3) { pintarCalendario(); pintarHoras(); }
  if (p === 4) pintarResumo();
  actualizarBarra();
}

const subirAoTopo = () =>
  $("#passos").scrollIntoView({ behavior: "smooth", block: "start" });

function avancar() {
  if (estado.passo === TOTAL_PASSOS) return confirmar();
  if (!passoCompleto(estado.passo)) return;
  mostrarPasso(estado.passo + 1);
  subirAoTopo();
}

function confirmar() {
  const okNome = validarCampo("nome", M.validarNome);
  const okTel  = validarCampo("telemovel", M.validarTelemovel);
  if (!okNome || !okTel) { $(okNome ? "#telemovel" : "#nome").focus(); return; }

  const r = M.criarMarcacao({
    servicoId: estado.servicoId, barbeiroId: estado.barbeiroId,
    data: estado.data, inicio: estado.inicio,
    nome: $("#nome").value, telemovel: $("#telemovel").value, notas: $("#notas").value
  });

  if (r.erro) {
    estado.inicio = null;
    mostrarPasso(3);
    pintarHoras();
    const aviso = document.createElement("p");
    aviso.className = "sem-vagas";
    aviso.style.cssText = "border-color:var(--erro);color:var(--erro)";
    aviso.textContent = r.erro;
    $("#zona-horas").prepend(aviso);
    subirAoTopo();
    return;
  }

  // Guardar para a próxima marcação — evita reescrever tudo de novo
  try {
    localStorage.setItem(CHAVE_CLIENTE, JSON.stringify({
      nome: $("#nome").value.trim(), telemovel: $("#telemovel").value.trim()
    }));
  } catch { /* sem persistência: segue sem guardar */ }

  const m = r.marcacao;
  estado.ultima = m;

  $("#texto-confirmacao").innerHTML =
    `${escapar(m.nome.split(" ")[0])}, esperamos por si ${escapar(M.dataPorExtenso(m.data))} às ${M.paraHoras(m.inicio)}, com ${escapar(M.nomeBarbeiro(m.barbeiroId))}.`;
  pintarResumo("#resumo-final", m);
  $("#google-agenda").href = M.ligacaoGoogleAgenda(m, M.servicoPorId(m.servicoId));

  mostrarPasso(5);
  pintarMinhas();
  subirAoTopo();
}

function validarCampo(id, validador) {
  const campo = $(`#campo-${id}`);
  const erro = validador($(`#${id}`).value);
  campo.classList.toggle("invalido", Boolean(erro));
  $(`#erro-${id}`).textContent = erro || "";
  return !erro;
}

function reiniciar() {
  Object.assign(estado, { servicoId: null, barbeiroId: null, data: null, inicio: null, ultima: null });
  $("#assistente").reset();
  $$(".campo").forEach((c) => c.classList.remove("invalido"));
  $$(".campo__erro").forEach((e) => (e.textContent = ""));
  preencherCliente();
  mostrarPasso(1);
  subirAoTopo();
}

/* ── Marcações guardadas ─────────────────────────────────────────────────── */

function pintarMinhas() {
  const lista = M.marcacoesDoCliente();
  const alvo = $("#lista-minhas");

  if (!lista.length) {
    alvo.innerHTML = `<p class="vazio-nota">Ainda não marcou nada. As suas marcações aparecem aqui.</p>`;
    return;
  }

  alvo.innerHTML = `<ul class="minhas__lista">${lista.map((m) => {
    const s = M.servicoPorId(m.servicoId);
    const passada = M.jaPassou(m);
    return `<li class="reserva${passada ? " passada" : ""}">
      <div>
        <p class="reserva__quando">${escapar(M.dataPorExtenso(m.data))} · ${M.paraHoras(m.inicio)}</p>
        <p class="reserva__que">${escapar(s ? s.nome : "—")} · ${escapar(M.nomeBarbeiro(m.barbeiroId))} · ${euros(m.preco)}</p>
        ${passada ? '<p class="reserva__cod">Já passou</p>' : ""}
      </div>
      ${passada ? "" : `<button type="button" class="anular" data-anular="${m.id}">Anular</button>`}
    </li>`;
  }).join("")}</ul>`;

  $$("[data-anular]").forEach((b) => b.addEventListener("click", () => {
    const quando = b.closest(".reserva").querySelector(".reserva__quando").textContent.trim();
    if (!confirm(`Anular a marcação de ${quando}?`)) return;
    M.anularMarcacao(b.dataset.anular);
    pintarMinhas();
    if (estado.passo === 3) { pintarCalendario(); pintarHoras(); }
  }));
}

/* ── Arranque ────────────────────────────────────────────────────────────── */

function preencherCliente() {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE_CLIENTE) || "null");
    if (!c) return;
    $("#nome").value = c.nome || "";
    $("#telemovel").value = c.telemovel || "";
  } catch { /* nada guardado */ }
}

/** `marcar.html?servico=<id>` entra já com o serviço escolhido. */
function aplicarLigacaoDirecta() {
  const id = new URLSearchParams(location.search).get("servico");
  if (!id || !M.servicoPorId(id)) return false;
  escolherServico(id);
  mostrarPasso(2);
  return true;
}

function iniciar() {
  arrancarComum();
  M.semearAgenda();

  pintarOpcoesServico();
  pintarOpcoesBarbeiro();
  pintarMinhas();
  preencherCliente();

  if (!aplicarLigacaoDirecta()) mostrarPasso(1);

  $("#btn-avancar").addEventListener("click", avancar);
  $("#btn-atras").addEventListener("click", () => { mostrarPasso(Math.max(1, estado.passo - 1)); subirAoTopo(); });
  $("#nova-marcacao").addEventListener("click", reiniciar);

  $("#cal-anterior").addEventListener("click", () => {
    estado.mesVisivel = new Date(estado.mesVisivel.getFullYear(), estado.mesVisivel.getMonth() - 1, 1);
    pintarCalendario();
  });
  $("#cal-seguinte").addEventListener("click", () => {
    estado.mesVisivel = new Date(estado.mesVisivel.getFullYear(), estado.mesVisivel.getMonth() + 1, 1);
    pintarCalendario();
  });

  $("#nome").addEventListener("blur", () => validarCampo("nome", M.validarNome));
  $("#telemovel").addEventListener("blur", () => validarCampo("telemovel", M.validarTelemovel));

  $("#guardar-ics").addEventListener("click", () => {
    if (!estado.ultima) return;
    const s = M.servicoPorId(estado.ultima.servicoId);
    descarregar(`barbearia-garcia-${estado.ultima.data}-${M.paraHoras(estado.ultima.inicio).replace(":", "h")}.ics`,
      M.paraICS(estado.ultima, s));
  });

  $("#assistente").addEventListener("submit", (e) => { e.preventDefault(); avancar(); });
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", iniciar);
else iniciar();
