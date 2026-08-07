/* ==========================================================================
   Motor de marcações
   --------------------------------------------------------------------------
   Regras da casa, aplicadas literalmente:
     · Segunda a sábado, 10:00–20:00. Domingo encerrado.
     · Uma marcação tem de caber inteira antes da hora de fecho.
     · Um barbeiro não pode ter duas marcações sobrepostas.
     · Antecedência mínima de 30 minutos; máxima de 60 dias.

   Persistência em localStorage — é uma demonstração, não há servidor.
   ========================================================================== */

import { CASA, BARBEIROS, SERVICOS } from "./dados.js";

const CHAVE = "barbearia-garcia:marcacoes:v1";
const CHAVE_SEED = "barbearia-garcia:seed:v1";

export const PASSO_SLOT = 15;      // minutos entre horas propostas
export const ANTECEDENCIA_MIN = 30; // minutos
export const HORIZONTE_DIAS = 60;

/* ── Tempo ───────────────────────────────────────────────────────────────── */

export const paraMinutos = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const paraHoras = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Chave YYYY-MM-DD na hora local (evita o desvio de toISOString em UTC). */
export const chaveData = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const dataDeChave = (chave) => {
  const [a, m, d] = chave.split("-").map(Number);
  return new Date(a, m - 1, d);
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado"];

export const nomeMes = (i) => MESES[i];
export const nomeDia = (i) => DIAS[i];

export function dataPorExtenso(chave) {
  const d = dataDeChave(chave);
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/* ── Consultas ao catálogo ───────────────────────────────────────────────── */

export const servicoPorId  = (id) => SERVICOS.find((s) => s.id === id);
export const barbeiroPorId = (id) => BARBEIROS.find((b) => b.id === id);

export const nomeBarbeiro = (id) =>
  id === "qualquer" ? "Sem preferência" : (barbeiroPorId(id)?.nome ?? "—");

/* ── Horário ─────────────────────────────────────────────────────────────── */

export function expedienteDe(chave) {
  const h = CASA.horario[dataDeChave(chave).getDay()];
  return h.aberto ? { abre: paraMinutos(h.abre), fecha: paraMinutos(h.fecha) } : null;
}

export function estaAbertoAgora(agora = new Date()) {
  const h = CASA.horario[agora.getDay()];
  if (!h.aberto) return { aberto: false, motivo: "Encerrado ao domingo" };
  const min = agora.getHours() * 60 + agora.getMinutes();
  const abre = paraMinutos(h.abre), fecha = paraMinutos(h.fecha);
  if (min < abre)  return { aberto: false, motivo: `Abre às ${h.abre}` };
  if (min >= fecha) return { aberto: false, motivo: "Já fechámos por hoje" };
  return { aberto: true, motivo: `Aberto até às ${h.fecha}` };
}

/* ── Armazenamento ───────────────────────────────────────────────────────── */

function ler() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : [];
  } catch {
    return []; // localStorage indisponível (modo privado, por exemplo)
  }
}

function gravar(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch { /* sem persistência: a sessão continua a funcionar em memória */ }
}

let cache = null;
export function todasAsMarcacoes() {
  if (cache === null) cache = ler();
  return cache;
}

export function marcacoesDoCliente() {
  return todasAsMarcacoes()
    .filter((m) => m.minha)
    .sort((a, b) => (a.data + a.inicio).localeCompare
      ? (a.data === b.data ? a.inicio - b.inicio : a.data.localeCompare(b.data))
      : 0);
}

/* ── Disponibilidade ─────────────────────────────────────────────────────── */

const sobrepoe = (i1, d1, i2, d2) => i1 < i2 + d2 && i2 < i1 + d1;

/** Barbeiros sem conflito para o intervalo pedido. */
export function barbeirosLivres(chave, inicio, duracao) {
  const doDia = todasAsMarcacoes().filter((m) => m.data === chave);
  return BARBEIROS.filter((b) =>
    !doDia.some((m) => m.barbeiroId === b.id && sobrepoe(inicio, duracao, m.inicio, m.minutos))
  );
}

export function estaLivre(chave, inicio, duracao, barbeiroId) {
  if (barbeiroId === "qualquer") return barbeirosLivres(chave, inicio, duracao).length > 0;
  return barbeirosLivres(chave, inicio, duracao).some((b) => b.id === barbeiroId);
}

/**
 * Horas propostas para um dia. Devolve sempre a grelha completa, marcando
 * cada slot como livre ou não — mostrar as horas esgotadas é mais informativo
 * do que escondê-las.
 */
export function horasDoDia(chave, servico, barbeiroId, agora = new Date()) {
  const exp = expedienteDe(chave);
  if (!exp) return [];

  const duracao = servico.minutos;
  const ultimoInicio = exp.fecha - duracao;
  if (ultimoInicio < exp.abre) return []; // serviço não cabe no dia

  const hoje = chaveData(agora);
  const minimoHoje = agora.getHours() * 60 + agora.getMinutes() + ANTECEDENCIA_MIN;

  const slots = [];
  for (let t = exp.abre; t <= ultimoInicio; t += PASSO_SLOT) {
    const tarde = chave === hoje && t < minimoHoje;
    slots.push({
      inicio: t,
      etiqueta: paraHoras(t),
      livre: !tarde && estaLivre(chave, t, duracao, barbeiroId)
    });
  }
  return slots;
}

export function diaTemVaga(chave, servico, barbeiroId, agora = new Date()) {
  return horasDoDia(chave, servico, barbeiroId, agora).some((s) => s.livre);
}

/* ── Criar e anular ──────────────────────────────────────────────────────── */

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem I, O, 0, 1

function gerarCodigo() {
  let c = "";
  for (let i = 0; i < 4; i++) c += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  return `BG-${c}`;
}

export function criarMarcacao({ servicoId, barbeiroId, data, inicio, nome, telemovel, notas }) {
  const servico = servicoPorId(servicoId);
  if (!servico) return { erro: "Serviço desconhecido." };

  // Revalidação no momento de gravar: o slot pode ter sido ocupado entretanto
  if (!estaLivre(data, inicio, servico.minutos, barbeiroId)) {
    return { erro: "Essa hora acabou de ficar ocupada. Escolha outra, por favor." };
  }

  const atribuido = barbeiroId === "qualquer"
    ? barbeirosLivres(data, inicio, servico.minutos)[0].id
    : barbeiroId;

  const marcacao = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    codigo: gerarCodigo(),
    servicoId, minutos: servico.minutos, preco: servico.preco,
    barbeiroId: atribuido,
    escolhaBarbeiro: barbeiroId,
    data, inicio,
    nome: nome.trim(), telemovel: telemovel.trim(), notas: (notas || "").trim(),
    estado: "agendada",
    minha: true,
    criadoEm: Date.now()
  };

  cache = [...todasAsMarcacoes(), marcacao];
  gravar(cache);
  return { marcacao };
}

export function anularMarcacao(id) {
  cache = todasAsMarcacoes().filter((m) => m.id !== id);
  gravar(cache);
}

export function jaPassou(m, agora = new Date()) {
  const d = dataDeChave(m.data);
  d.setMinutes(m.inicio + m.minutos);
  return d < agora;
}

/* ── Agenda de exemplo ───────────────────────────────────────────────────────
   Sem isto o calendário aparece completamente vazio e a demonstração não
   mostra o que acontece quando uma hora já está tomada. Gerada uma única vez
   por navegador, a partir de uma semente fixa, para se manter estável entre
   visitas.
   ------------------------------------------------------------------------ */

function aleatorioSemente(semente) {
  let x = semente;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

export function semearAgenda(agora = new Date()) {
  let semente;
  try {
    semente = Number(localStorage.getItem(CHAVE_SEED));
    if (!semente) {
      semente = Math.floor(Math.random() * 1e9);
      localStorage.setItem(CHAVE_SEED, String(semente));
    }
  } catch {
    semente = 20250807;
  }

  // Só semeia se ainda não houver nada gerado
  if (todasAsMarcacoes().some((m) => !m.minha)) return;

  const rnd = aleatorioSemente(semente);
  const populares = SERVICOS.filter((s) => s.grupo === "Barbearia" && s.minutos <= 60);
  const inventadas = [];

  for (let i = 0; i < 21; i++) {
    const d = new Date(agora);
    d.setDate(d.getDate() + i);
    const chave = chaveData(d);
    const exp = expedienteDe(chave);
    if (!exp) continue;

    // Mais movimento ao fim-de-semana e ao fim do dia
    const sabado = d.getDay() === 6;
    const quantas = Math.floor(rnd() * (sabado ? 7 : 5)) + (sabado ? 4 : 1);

    for (let j = 0; j < quantas; j++) {
      const servico = populares[Math.floor(rnd() * populares.length)];
      const barbeiro = BARBEIROS[Math.floor(rnd() * BARBEIROS.length)];
      const passos = Math.floor((exp.fecha - servico.minutos - exp.abre) / PASSO_SLOT);
      const inicio = exp.abre + Math.floor(rnd() * passos) * PASSO_SLOT;

      const choca = inventadas.some((m) =>
        m.data === chave && m.barbeiroId === barbeiro.id &&
        sobrepoe(inicio, servico.minutos, m.inicio, m.minutos));
      if (choca) continue;

      inventadas.push({
        id: `seed-${i}-${j}`,
        codigo: "—",
        servicoId: servico.id, minutos: servico.minutos, preco: servico.preco,
        barbeiroId: barbeiro.id, escolhaBarbeiro: barbeiro.id,
        data: chave, inicio,
        nome: "Reservado", telemovel: "", notas: "",
        estado: "agendada",
        minha: false, criadoEm: 0
      });
    }
  }

  cache = [...todasAsMarcacoes(), ...inventadas];
  gravar(cache);
}

/* ── Validação ───────────────────────────────────────────────────────────── */

export function validarNome(v) {
  const t = (v || "").trim();
  if (!t) return "Diga-nos como se chama.";
  if (t.length < 2) return "O nome parece curto demais.";
  return null;
}

/** Telemóvel português: 9 dígitos começados por 9, com ou sem indicativo. */
export function validarTelemovel(v) {
  const limpo = (v || "").replace(/[\s.-]/g, "").replace(/^(\+351|00351)/, "");
  if (!limpo) return "Precisamos de um contacto.";
  if (!/^9\d{8}$/.test(limpo)) return "Indique um telemóvel português válido (9XX XXX XXX).";
  return null;
}


/* ══════════════════════════════════════════════════════════════════════════
   Painel — consultas e estados
   ══════════════════════════════════════════════════════════════════════════ */

export const ESTADOS = {
  agendada:  { rotulo: "Agendada",  cor: "agendada" },
  concluida: { rotulo: "Concluída", cor: "concluida" },
  falta:     { rotulo: "Faltou",    cor: "falta" }
};

/** Marcações de um dia, ordenadas por hora. `barbeiroId` vazio devolve todas. */
export function marcacoesDe(chave, barbeiroId = "") {
  return todasAsMarcacoes()
    .filter((m) => m.data === chave && (!barbeiroId || m.barbeiroId === barbeiroId))
    .sort((a, b) => a.inicio - b.inicio);
}

export function definirEstado(id, estado) {
  if (!ESTADOS[estado]) return false;
  const lista = todasAsMarcacoes();
  const alvo = lista.find((m) => m.id === id);
  if (!alvo) return false;
  alvo.estado = estado;
  cache = [...lista];
  gravar(cache);
  return true;
}

/** Contagem, minutos ocupados e receita prevista de um dia. */
export function resumoDoDia(chave, barbeiroId = "") {
  const lista = marcacoesDe(chave, barbeiroId);
  const contadas = lista.filter((m) => m.estado !== "falta");
  return {
    total: lista.length,
    concluidas: lista.filter((m) => m.estado === "concluida").length,
    faltas: lista.filter((m) => m.estado === "falta").length,
    minutos: contadas.reduce((s, m) => s + m.minutos, 0),
    receita: contadas.reduce((s, m) => s + (m.preco || 0), 0)
  };
}

/** Dias com marcações, do mais próximo ao mais distante. */
export function diasComMarcacoes() {
  return [...new Set(todasAsMarcacoes().map((m) => m.data))].sort();
}

export function limparTudo() {
  cache = [];
  gravar(cache);
  try { localStorage.removeItem(CHAVE_SEED); } catch { /* ignorado */ }
}

/* ══════════════════════════════════════════════════════════════════════════
   Calendário
   ══════════════════════════════════════════════════════════════════════════ */

/** Data + minutos → objecto Date local. */
export function instanteDe(chave, minutos) {
  const d = dataDeChave(chave);
  d.setMinutes(minutos);
  return d;
}

/** Carimbo UTC no formato iCalendar: 20260812T090000Z */
const carimboUTC = (d) =>
  d.getUTCFullYear() +
  String(d.getUTCMonth() + 1).padStart(2, "0") +
  String(d.getUTCDate()).padStart(2, "0") + "T" +
  String(d.getUTCHours()).padStart(2, "0") +
  String(d.getUTCMinutes()).padStart(2, "0") +
  String(d.getUTCSeconds()).padStart(2, "0") + "Z";

/** RFC 5545: vírgula, ponto-e-vírgula, barra e quebra de linha são especiais. */
const escaparICS = (t) => String(t)
  .replace(/\\/g, "\\\\")
  .replace(/;/g, "\\;")
  .replace(/,/g, "\\,")
  .replace(/\r?\n/g, "\\n");

/**
 * Gera o ficheiro .ics de uma marcação.
 * A norma exige CRLF — com LF simples o Outlook recusa o ficheiro.
 */
export function paraICS(marcacao, servico) {
  const inicio = instanteDe(marcacao.data, marcacao.inicio);
  const fim = instanteDe(marcacao.data, marcacao.inicio + marcacao.minutos);
  const titulo = `${servico.nome} — ${CASA.nome}`;
  const local = `${CASA.morada}, ${CASA.codigoPostal} ${CASA.localidade}`;
  const detalhe = [
    `Barbeiro: ${nomeBarbeiro(marcacao.barbeiroId)}`,
    `Serviço: ${servico.nome} (${marcacao.minutos} min)`,
    marcacao.preco ? `Valor: ${marcacao.preco} EUR` : null,
    `Código: ${marcacao.codigo}`,
    `Telefone: ${CASA.telefone}`
  ].filter(Boolean).join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Barbearia Garcia//Marcacoes//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${marcacao.id}@barbearia-garcia`,
    `DTSTAMP:${carimboUTC(new Date())}`,
    `DTSTART:${carimboUTC(inicio)}`,
    `DTEND:${carimboUTC(fim)}`,
    `SUMMARY:${escaparICS(titulo)}`,
    `DESCRIPTION:${escaparICS(detalhe)}`,
    `LOCATION:${escaparICS(local)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escaparICS(titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n") + "\r\n";
}

/** Alternativa sem descarregar ficheiro, útil em telemóvel. */
export function ligacaoGoogleAgenda(marcacao, servico) {
  const inicio = instanteDe(marcacao.data, marcacao.inicio);
  const fim = instanteDe(marcacao.data, marcacao.inicio + marcacao.minutos);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${servico.nome} — ${CASA.nome}`,
    dates: `${carimboUTC(inicio)}/${carimboUTC(fim)}`,
    details: `Barbeiro: ${nomeBarbeiro(marcacao.barbeiroId)}\nCódigo: ${marcacao.codigo}`,
    location: `${CASA.morada}, ${CASA.codigoPostal} ${CASA.localidade}`
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
