/* ==========================================================================
   Barbearia Garcia — interface
   ========================================================================== */

import { CASA, BARBEIROS, SERVICOS, GALERIA } from "./dados.js";
import * as M from "./marcacoes.js";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const euros = (v) => (v === 0 ? "Sob orçamento" : `${v} €`);
const duracao = (m) => (m >= 60
  ? (m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)} h ${m % 60} min`)
  : `${m} min`);
const escapar = (s) => String(s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ── Conteúdo estático ───────────────────────────────────────────────────── */

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
  // Começa à segunda, como se lê num postal de porta
  const ordem = [1, 2, 3, 4, 5, 6, 0];
  $("#horario").innerHTML = ordem.map((i) => {
    const h = CASA.horario[i];
    return `<li class="${i === hoje ? "hoje" : ""}">
      <span class="dia">${h.dia}</span>
      ${h.aberto ? `<span>${h.abre} – ${h.fecha}</span>` : `<span class="fechado">Encerrado</span>`}
    </li>`;
  }).join("");

  const estado = M.estaAbertoAgora();
  const caixa = $("#estado-loja");
  caixa.classList.toggle("aberta", estado.aberto);
  $("#estado-texto").textContent = estado.aberto ? estado.motivo : `Fechado · ${estado.motivo}`;

  const rodapeHero = $("#hero-estado");
  if (rodapeHero) {
    rodapeHero.innerHTML = estado.aberto
      ? `Agora <strong>aberto</strong> · até às ${CASA.horario[hoje].fecha}`
      : `Segunda a sábado · <strong>10:00 – 20:00</strong>`;
  }
}

/* ── Navegação e movimento ───────────────────────────────────────────────── */

function ligarNavegacao() {
  const cabecalho = $("#cabecalho");
  const alvo = 60;
  const aoRolar = () => cabecalho.classList.toggle("encolhido", window.scrollY > alvo);
  aoRolar();
  addEventListener("scroll", aoRolar, { passive: true });

  const botao = $("#abre-menu");
  const menu = $("#menu");
  const fechar = () => { menu.classList.remove("aberto"); botao.setAttribute("aria-expanded", "false"); };

  botao.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
  $$("#menu a").forEach((a) => a.addEventListener("click", fechar));
  addEventListener("keydown", (e) => { if (e.key === "Escape") fechar(); });
}

function ligarRevelacao() {
  const alvos = $$(".revelar");
  if (!("IntersectionObserver" in window)) {
    alvos.forEach((a) => a.classList.add("visivel"));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  alvos.forEach((a) => obs.observe(a));
}

/* ══════════════════════════════════════════════════════════════════════════
   Assistente de marcações
   ══════════════════════════════════════════════════════════════════════════ */

const estado = {
  passo: 1,
  servicoId: null,
  barbeiroId: null,
  data: null,
  inicio: null,
  mesVisivel: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
};

const TOTAL_PASSOS = 4;

/* ── Passo 1: serviços ───────────────────────────────────────────────────── */

function pintarOpcoesServico() {
  const grupos = [...new Set(SERVICOS.map((s) => s.grupo))];
  $("#opcoes-servico").innerHTML = grupos.map((g) => `
    <h4 class="grupo-titulo">${escapar(g)}</h4>
    <div class="opcoes">
      ${SERVICOS.filter((s) => s.grupo === g).map((s) => `
        <label class="opcao">
          <input type="radio" name="servico" value="${s.id}">
          <span class="opcao__corpo">
            <span>
              <span class="opcao__nome">${escapar(s.nome)}</span>
              <span class="opcao__meta">${duracao(s.minutos)}</span>
            </span>
            <span class="opcao__preco">${euros(s.preco)}</span>
          </span>
        </label>`).join("")}
    </div>`).join("");

  $$('#opcoes-servico input').forEach((i) => i.addEventListener("change", () => {
    estado.servicoId = i.value;
    // Trocar de serviço invalida a hora escolhida: a duração mudou
    estado.data = null; estado.inicio = null;
    actualizarBotoes();
  }));
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
    actualizarBotoes();
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

  // Segunda = primeira coluna
  const diaSemanaInicio = (new Date(ano, mes, 1).getDay() + 6) % 7;
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  let html = "";
  for (let i = 0; i < diaSemanaInicio; i++) html += `<span class="dia vazio"></span>`;

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(ano, mes, d);
    const chave = M.chaveData(data);
    const foraDeAlcance = data < hoje || data > limite;
    const fechado = !M.expedienteDe(chave);
    const semVaga = !foraDeAlcance && !fechado &&
      !M.diaTemVaga(chave, servico, estado.barbeiroId);
    const bloqueado = foraDeAlcance || fechado || semVaga;

    const titulo = fechado ? "Encerrado" : semVaga ? "Sem vagas" : M.dataPorExtenso(chave);
    html += `<button type="button" class="dia${M.chaveData(new Date()) === chave ? " hoje" : ""}"
      data-dia="${chave}" ${bloqueado ? "disabled" : ""}
      aria-pressed="${estado.data === chave}" title="${escapar(titulo)}">${d}</button>`;
  }
  $("#cal-dias").innerHTML = html;

  // Só recua até ao mês corrente; avança até ao horizonte
  const mesCorrente = new Date(); mesCorrente.setDate(1); mesCorrente.setHours(0, 0, 0, 0);
  $("#cal-anterior").disabled = primeiro <= mesCorrente;
  const mesLimite = new Date(limite.getFullYear(), limite.getMonth(), 1);
  $("#cal-seguinte").disabled = primeiro >= mesLimite;

  $$("#cal-dias .dia[data-dia]").forEach((b) => b.addEventListener("click", () => {
    estado.data = b.dataset.dia;
    estado.inicio = null;
    pintarCalendario();
    pintarHoras();
    actualizarBotoes();
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
    <p class="sobrescrita">
      ${escapar(M.dataPorExtenso(estado.data))} · ${livres.length} ${livres.length === 1 ? "vaga" : "vagas"}
    </p>
    <div class="horas">
      ${slots.map((s) => `
        <button type="button" class="hora" data-inicio="${s.inicio}"
          ${s.livre ? "" : "disabled"} aria-pressed="${estado.inicio === s.inicio}"
          ${s.livre ? "" : 'title="Ocupado"'}>${s.etiqueta}</button>`).join("")}
    </div>`;

  $$(".hora[data-inicio]").forEach((b) => b.addEventListener("click", () => {
    estado.inicio = Number(b.dataset.inicio);
    $$(".hora").forEach((o) => o.setAttribute("aria-pressed", String(Number(o.dataset.inicio) === estado.inicio)));
    actualizarBotoes();
  }));
}

/* ── Passo 4: resumo e validação ─────────────────────────────────────────── */

function pintarResumo(alvo = "#resumo", marcacao = null) {
  const servico = M.servicoPorId(marcacao ? marcacao.servicoId : estado.servicoId);
  if (!servico) return;

  const data    = marcacao ? marcacao.data : estado.data;
  const inicio  = marcacao ? marcacao.inicio : estado.inicio;
  const quem    = marcacao ? marcacao.barbeiroId : estado.barbeiroId;
  const fim     = inicio + servico.minutos;

  $(alvo).innerHTML = `
    <h4>${marcacao ? "A sua marcação" : "Resumo"}</h4>
    <dl>
      <div class="linha"><dt>Serviço</dt><dd>${escapar(servico.nome)}</dd></div>
      <div class="linha"><dt>Barbeiro</dt><dd>${escapar(M.nomeBarbeiro(quem))}</dd></div>
      <div class="linha"><dt>Dia</dt><dd>${escapar(M.dataPorExtenso(data))}</dd></div>
      <div class="linha"><dt>Hora</dt><dd>${M.paraHoras(inicio)} – ${M.paraHoras(fim)}</dd></div>
      <div class="linha total"><dt>A pagar no balcão</dt><dd>${euros(servico.preco)}</dd></div>
    </dl>`;
}

function validarCampo(id, validador) {
  const campo = $(`#campo-${id}`);
  const erro = validador($(`#${id}`).value);
  campo.classList.toggle("invalido", Boolean(erro));
  $(`#erro-${id}`).textContent = erro || "";
  return !erro;
}

/* ── Fluxo ───────────────────────────────────────────────────────────────── */

function passoCompleto(p) {
  if (p === 1) return Boolean(estado.servicoId);
  if (p === 2) return Boolean(estado.barbeiroId);
  if (p === 3) return Boolean(estado.data) && estado.inicio !== null;
  if (p === 4) return true;
  return false;
}

function actualizarBotoes() {
  const avancar = $("#btn-avancar");
  const atras = $("#btn-atras");
  avancar.disabled = !passoCompleto(estado.passo);
  avancar.textContent = estado.passo === TOTAL_PASSOS ? "Confirmar marcação" : "Continuar";
  atras.style.visibility = estado.passo === 1 ? "hidden" : "visible";
}

function mostrarPasso(p) {
  estado.passo = p;
  $$(".painel[data-painel]").forEach((s) => { s.hidden = Number(s.dataset.painel) !== p; });
  $("#pe-assistente").hidden = p === 5;

  $$("#passos li").forEach((li) => {
    const n = Number(li.dataset.passo);
    li.classList.toggle("feito", n < p);
    if (n < p) li.querySelector(".n").textContent = "✓";
    else li.querySelector(".n").textContent = String(n);
    if (n === p) li.setAttribute("aria-current", "step");
    else li.removeAttribute("aria-current");
  });

  if (p === 3) { pintarCalendario(); pintarHoras(); }
  if (p === 4) pintarResumo();
  actualizarBotoes();
}

function avancar() {
  if (estado.passo === TOTAL_PASSOS) return confirmar();
  if (!passoCompleto(estado.passo)) return;
  mostrarPasso(estado.passo + 1);
  $("#marcar").scrollIntoView({ behavior: "smooth", block: "start" });
}

function confirmar() {
  const okNome = validarCampo("nome", M.validarNome);
  const okTel  = validarCampo("telemovel", M.validarTelemovel);
  if (!okNome || !okTel) {
    $(okNome ? "#telemovel" : "#nome").focus();
    return;
  }

  const r = M.criarMarcacao({
    servicoId: estado.servicoId,
    barbeiroId: estado.barbeiroId,
    data: estado.data,
    inicio: estado.inicio,
    nome: $("#nome").value,
    telemovel: $("#telemovel").value,
    notas: $("#notas").value
  });

  if (r.erro) {
    // Slot tomado entretanto: recuar para a escolha de hora com o aviso à vista
    estado.inicio = null;
    mostrarPasso(3);
    pintarHoras();
    const aviso = document.createElement("p");
    aviso.className = "sem-vagas";
    aviso.style.borderColor = "var(--erro)";
    aviso.style.color = "var(--erro)";
    aviso.textContent = r.erro;
    $("#zona-horas").prepend(aviso);
    return;
  }

  const m = r.marcacao;
  $("#texto-confirmacao").innerHTML =
    `${escapar(m.nome.split(" ")[0])}, esperamos por si ${escapar(M.dataPorExtenso(m.data))} às ${M.paraHoras(m.inicio)}, com ${escapar(M.nomeBarbeiro(m.barbeiroId))}.`;
  $("#codigo-reserva").textContent = m.codigo;
  pintarResumo("#resumo-final", m);

  mostrarPasso(5);
  pintarMinhas();
  $("#marcar").scrollIntoView({ behavior: "smooth", block: "start" });
}

function reiniciar() {
  estado.servicoId = null; estado.barbeiroId = null;
  estado.data = null; estado.inicio = null;
  $("#assistente").reset();
  $$(".campo").forEach((c) => c.classList.remove("invalido"));
  $$(".campo__erro").forEach((e) => (e.textContent = ""));
  mostrarPasso(1);
  $("#marcar").scrollIntoView({ behavior: "smooth", block: "start" });
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
        <p class="reserva__cod">${escapar(m.codigo)}${passada ? " · já passou" : ""}</p>
      </div>
      ${passada ? "" : `<button type="button" class="anular" data-anular="${m.id}">Anular</button>`}
    </li>`;
  }).join("")}</ul>`;

  $$("[data-anular]").forEach((b) => b.addEventListener("click", () => {
    const li = b.closest(".reserva");
    const cod = li.querySelector(".reserva__cod").textContent.trim();
    if (!confirm(`Anular a marcação ${cod}?`)) return;
    M.anularMarcacao(b.dataset.anular);
    pintarMinhas();
    if (estado.passo === 3) { pintarCalendario(); pintarHoras(); }
  }));
}

/* ── Arranque ────────────────────────────────────────────────────────────── */

const POR_EXTENSO = {
  25: "Vinte e cinco", 26: "Vinte e seis", 27: "Vinte e sete", 28: "Vinte e oito",
  29: "Vinte e nove", 30: "Trinta", 31: "Trinta e um", 32: "Trinta e dois",
  33: "Trinta e três", 34: "Trinta e quatro", 35: "Trinta e cinco"
};

function iniciar() {
  const agora = new Date();
  $("#ano").textContent = agora.getFullYear();

  const anos = agora.getFullYear() - CASA.desde;
  const alvoAnos = $("#anos-casa");
  if (alvoAnos) alvoAnos.textContent = POR_EXTENSO[anos] || `${anos}`;

  pintarServicos();
  pintarEquipa();
  pintarGaleria();
  pintarHorario();
  ligarNavegacao();
  ligarRevelacao();

  M.semearAgenda();

  pintarOpcoesServico();
  pintarOpcoesBarbeiro();
  pintarMinhas();
  mostrarPasso(1);

  $("#btn-avancar").addEventListener("click", avancar);
  $("#btn-atras").addEventListener("click", () => mostrarPasso(Math.max(1, estado.passo - 1)));
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

  // Enter no formulário confirma em vez de recarregar a página
  $("#assistente").addEventListener("submit", (e) => { e.preventDefault(); avancar(); });
}

if (document.readyState === "loading") addEventListener("DOMContentLoaded", iniciar);
else iniciar();
