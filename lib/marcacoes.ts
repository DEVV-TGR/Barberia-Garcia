/* ==========================================================================
   Motor de marcações
   --------------------------------------------------------------------------
   Regras da casa, aplicadas literalmente:
     · Segunda a sábado, 10:00–20:00. Domingo encerrado.
     · Uma marcação tem de caber inteira antes da hora de fecho.
     · Um barbeiro não pode ter duas marcações sobrepostas.
     · Antecedência mínima de 30 minutos; máxima de 60 dias.

   Persistência em localStorage — é uma demonstração, não há servidor.
   Sem uma linha de DOM: é o mesmo motor da versão anterior, com tipos.
   ========================================================================== */

import {
  CASA, BARBEIROS, SERVICOS,
  type Barbeiro, type EstadoMarcacao, type Marcacao, type Servico
} from "./dados";

const CHAVE = "barbearia-garcia:marcacoes:v1";
const CHAVE_SEED = "barbearia-garcia:seed:v1";

export const PASSO_SLOT = 15;       // minutos entre horas propostas
export const ANTECEDENCIA_MIN = 30; // minutos
export const HORIZONTE_DIAS = 60;

/* ── Tempo ───────────────────────────────────────────────────────────────── */

export const paraMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const paraHoras = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Chave YYYY-MM-DD na hora local (evita o desvio de toISOString em UTC). */
export const chaveData = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const dataDeChave = (chave: string): Date => {
  const [a, m, d] = chave.split("-").map(Number);
  return new Date(a, m - 1, d);
};

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado"];

export const nomeMes = (i: number) => MESES[i];
export const nomeDia = (i: number) => DIAS[i];

export function dataPorExtenso(chave: string): string {
  const d = dataDeChave(chave);
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/* ── Consultas ao catálogo ───────────────────────────────────────────────── */

export const servicoPorId = (id: string): Servico | undefined =>
  SERVICOS.find((s) => s.id === id);

export const barbeiroPorId = (id: string): Barbeiro | undefined =>
  BARBEIROS.find((b) => b.id === id);

export const nomeBarbeiro = (id: string): string =>
  id === "qualquer" ? "Sem preferência" : (barbeiroPorId(id)?.nome ?? "—");

/* ── Horário ─────────────────────────────────────────────────────────────── */

export interface Expediente { abre: number; fecha: number; }

export function expedienteDe(chave: string): Expediente | null {
  const h = CASA.horario[dataDeChave(chave).getDay()];
  return h.aberto && h.abre && h.fecha
    ? { abre: paraMinutos(h.abre), fecha: paraMinutos(h.fecha) }
    : null;
}

export function estaAbertoAgora(agora: Date = new Date()) {
  const h = CASA.horario[agora.getDay()];
  if (!h.aberto || !h.abre || !h.fecha) return { aberto: false, motivo: "Encerrado ao domingo" };
  const min = agora.getHours() * 60 + agora.getMinutes();
  const abre = paraMinutos(h.abre), fecha = paraMinutos(h.fecha);
  if (min < abre) return { aberto: false, motivo: `Abre às ${h.abre}` };
  if (min >= fecha) return { aberto: false, motivo: "Já fechámos por hoje" };
  return { aberto: true, motivo: `Aberto até às ${h.fecha}` };
}

/* ── Armazenamento ───────────────────────────────────────────────────────── */

function ler(): Marcacao[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Marcacao[]) : [];
  } catch {
    return []; // localStorage indisponível (servidor, modo privado)
  }
}

function gravar(lista: Marcacao[]): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch { /* sem persistência: a sessão continua a funcionar em memória */ }
}

let cache: Marcacao[] | null = null;

export function todasAsMarcacoes(): Marcacao[] {
  if (cache === null) cache = ler();
  return cache;
}

/** Volta a ler do armazenamento. Necessário depois da hidratação no cliente. */
export function recarregar(): Marcacao[] {
  cache = ler();
  return cache;
}

export function marcacoesDoCliente(): Marcacao[] {
  return todasAsMarcacoes()
    .filter((m) => m.minha)
    .sort((a, b) => (a.data === b.data ? a.inicio - b.inicio : a.data.localeCompare(b.data)));
}

/* ── Disponibilidade ─────────────────────────────────────────────────────── */

const sobrepoe = (i1: number, d1: number, i2: number, d2: number) =>
  i1 < i2 + d2 && i2 < i1 + d1;

/** Barbeiros sem conflito para o intervalo pedido. */
export function barbeirosLivres(chave: string, inicio: number, duracao: number): Barbeiro[] {
  const doDia = todasAsMarcacoes().filter((m) => m.data === chave);
  return BARBEIROS.filter((b) =>
    !doDia.some((m) => m.barbeiroId === b.id && sobrepoe(inicio, duracao, m.inicio, m.minutos))
  );
}

export function estaLivre(chave: string, inicio: number, duracao: number, barbeiroId: string): boolean {
  if (barbeiroId === "qualquer") return barbeirosLivres(chave, inicio, duracao).length > 0;
  return barbeirosLivres(chave, inicio, duracao).some((b) => b.id === barbeiroId);
}

export interface Slot { inicio: number; etiqueta: string; livre: boolean; }

/**
 * Horas propostas para um dia. Devolve sempre a grelha completa, marcando cada
 * slot como livre ou não — mostrar as horas esgotadas é mais informativo do que
 * escondê-las.
 */
export function horasDoDia(
  chave: string, servico: Servico, barbeiroId: string, agora: Date = new Date()
): Slot[] {
  const exp = expedienteDe(chave);
  if (!exp) return [];

  const duracao = servico.minutos;
  const ultimoInicio = exp.fecha - duracao;
  if (ultimoInicio < exp.abre) return []; // o serviço não cabe no dia

  const hoje = chaveData(agora);
  const minimoHoje = agora.getHours() * 60 + agora.getMinutes() + ANTECEDENCIA_MIN;

  const slots: Slot[] = [];
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

export function diaTemVaga(
  chave: string, servico: Servico, barbeiroId: string, agora: Date = new Date()
): boolean {
  return horasDoDia(chave, servico, barbeiroId, agora).some((s) => s.livre);
}

/* ── Criar e anular ──────────────────────────────────────────────────────── */

export interface PedidoMarcacao {
  servicoId: string;
  barbeiroId: string;
  data: string;
  inicio: number;
  nome: string;
  telemovel: string;
  notas?: string;
}

export function criarMarcacao(
  { servicoId, barbeiroId, data, inicio, nome, telemovel, notas }: PedidoMarcacao
): { marcacao: Marcacao; erro?: undefined } | { erro: string; marcacao?: undefined } {
  const servico = servicoPorId(servicoId);
  if (!servico) return { erro: "Serviço desconhecido." };

  // Revalidação no momento de gravar: o slot pode ter sido ocupado entretanto
  if (!estaLivre(data, inicio, servico.minutos, barbeiroId)) {
    return { erro: "Essa hora acabou de ficar ocupada. Escolha outra, por favor." };
  }

  const atribuido = barbeiroId === "qualquer"
    ? barbeirosLivres(data, inicio, servico.minutos)[0].id
    : barbeiroId;

  const marcacao: Marcacao = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    servicoId, minutos: servico.minutos, preco: servico.preco,
    barbeiroId: atribuido,
    escolhaBarbeiro: barbeiroId,
    data, inicio,
    nome: nome.trim(), telemovel: telemovel.trim(), notas: (notas ?? "").trim(),
    estado: "agendada",
    minha: true,
    criadoEm: Date.now()
  };

  cache = [...todasAsMarcacoes(), marcacao];
  gravar(cache);
  return { marcacao };
}

export function anularMarcacao(id: string): void {
  cache = todasAsMarcacoes().filter((m) => m.id !== id);
  gravar(cache);
}

export function jaPassou(m: Marcacao, agora: Date = new Date()): boolean {
  const d = dataDeChave(m.data);
  d.setMinutes(m.inicio + m.minutos);
  return d < agora;
}

/* ── Painel: consultas e estados ─────────────────────────────────────────── */

export const ESTADOS: Record<EstadoMarcacao, { rotulo: string }> = {
  agendada:  { rotulo: "Agendada" },
  concluida: { rotulo: "Concluída" },
  falta:     { rotulo: "Faltou" }
};

/** Marcações de um dia, ordenadas por hora. `barbeiroId` vazio devolve todas. */
export function marcacoesDe(chave: string, barbeiroId = ""): Marcacao[] {
  return todasAsMarcacoes()
    .filter((m) => m.data === chave && (!barbeiroId || m.barbeiroId === barbeiroId))
    .sort((a, b) => a.inicio - b.inicio);
}

export function definirEstado(id: string, estado: EstadoMarcacao): boolean {
  if (!ESTADOS[estado]) return false;
  const lista = todasAsMarcacoes();
  const alvo = lista.find((m) => m.id === id);
  if (!alvo) return false;
  alvo.estado = estado;
  cache = [...lista];
  gravar(cache);
  return true;
}

export interface ResumoDia {
  total: number; concluidas: number; faltas: number; minutos: number; receita: number;
}

/** Contagem, minutos ocupados e receita prevista de um dia. */
export function resumoDoDia(chave: string, barbeiroId = ""): ResumoDia {
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

export function diasComMarcacoes(): string[] {
  return [...new Set(todasAsMarcacoes().map((m) => m.data))].sort();
}

export function limparTudo(): void {
  cache = [];
  gravar(cache);
  try { localStorage.removeItem(CHAVE_SEED); } catch { /* ignorado */ }
}

/* ── Calendário ──────────────────────────────────────────────────────────── */

export function instanteDe(chave: string, minutos: number): Date {
  const d = dataDeChave(chave);
  d.setMinutes(minutos);
  return d;
}

/** Carimbo UTC no formato iCalendar: 20260812T090000Z */
const carimboUTC = (d: Date): string =>
  d.getUTCFullYear() +
  String(d.getUTCMonth() + 1).padStart(2, "0") +
  String(d.getUTCDate()).padStart(2, "0") + "T" +
  String(d.getUTCHours()).padStart(2, "0") +
  String(d.getUTCMinutes()).padStart(2, "0") +
  String(d.getUTCSeconds()).padStart(2, "0") + "Z";

/** RFC 5545: barra, ponto-e-vírgula, vírgula e quebra de linha são especiais. */
const escaparICS = (t: string): string => String(t)
  .replace(/\\/g, "\\\\")
  .replace(/;/g, "\;")
  .replace(/,/g, "\\,")
  .replace(/\r?\n/g, "\\n");

/**
 * Gera o ficheiro .ics de uma marcação.
 * A norma exige CRLF — com LF simples o Outlook recusa o ficheiro.
 */
export function paraICS(marcacao: Marcacao, servico: Servico): string {
  const inicio = instanteDe(marcacao.data, marcacao.inicio);
  const fim = instanteDe(marcacao.data, marcacao.inicio + marcacao.minutos);
  const titulo = `${servico.nome} — ${CASA.nome}`;
  const local = `${CASA.morada}, ${CASA.codigoPostal} ${CASA.localidade}`;
  const detalhe = [
    `Barbeiro: ${nomeBarbeiro(marcacao.barbeiroId)}`,
    `Serviço: ${servico.nome} (${marcacao.minutos} min)`,
    marcacao.preco ? `Valor: ${marcacao.preco} EUR` : null,
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
export function ligacaoGoogleAgenda(marcacao: Marcacao, servico: Servico): string {
  const inicio = instanteDe(marcacao.data, marcacao.inicio);
  const fim = instanteDe(marcacao.data, marcacao.inicio + marcacao.minutos);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${servico.nome} — ${CASA.nome}`,
    dates: `${carimboUTC(inicio)}/${carimboUTC(fim)}`,
    details: `Barbeiro: ${nomeBarbeiro(marcacao.barbeiroId)}`,
    location: `${CASA.morada}, ${CASA.codigoPostal} ${CASA.localidade}`
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

/* ── Agenda de exemplo ───────────────────────────────────────────────────────
   Sem isto o calendário aparece vazio e a demonstração não mostra o que
   acontece quando uma hora já está tomada. Gerada uma vez por navegador, a
   partir de uma semente fixa, para se manter estável entre visitas.
   ------------------------------------------------------------------------ */

function aleatorioSemente(semente: number): () => number {
  let x = semente;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

export function semearAgenda(agora: Date = new Date()): void {
  let semente: number;
  try {
    semente = Number(localStorage.getItem(CHAVE_SEED));
    if (!semente) {
      semente = Math.floor(Math.random() * 1e9);
      localStorage.setItem(CHAVE_SEED, String(semente));
    }
  } catch {
    semente = 20250807;
  }

  if (todasAsMarcacoes().some((m) => !m.minha)) return;

  const rnd = aleatorioSemente(semente);
  const populares = SERVICOS.filter((s) => s.grupo === "Barbearia" && s.minutos <= 60);
  const inventadas: Marcacao[] = [];

  for (let i = 0; i < 21; i++) {
    const d = new Date(agora);
    d.setDate(d.getDate() + i);
    const chave = chaveData(d);
    const exp = expedienteDe(chave);
    if (!exp) continue;

    // Mais movimento ao sábado
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

export function validarNome(v: string): string | null {
  const t = (v || "").trim();
  if (!t) return "Diga-nos como se chama.";
  if (t.length < 2) return "O nome parece curto demais.";
  return null;
}

/** Telemóvel português: 9 dígitos começados por 9, com ou sem indicativo. */
export function validarTelemovel(v: string): string | null {
  const limpo = (v || "").replace(/[\s.-]/g, "").replace(/^(\+351|00351)/, "");
  if (!limpo) return "Precisamos de um contacto.";
  if (!/^9\d{8}$/.test(limpo)) return "Indique um telemóvel português válido (9XX XXX XXX).";
  return null;
}
