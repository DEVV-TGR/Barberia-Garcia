/* Testes do motor de marcações — a mesma cobertura da versão anterior,
   agora em Vitest e contra o motor em TypeScript. */

import { describe, it, expect, beforeEach } from "vitest";
import * as M from "../lib/marcacoes";
import { SERVICOS, BARBEIROS, type Servico } from "../lib/dados";

const servico = (id: string): Servico => {
  const s = SERVICOS.find((x) => x.id === id);
  if (!s) throw new Error(`serviço ${id} não existe`);
  return s;
};

const corte = servico("corte-classico-maquina-e-tesoura"); // 30 min
const madeixas = servico("madeixas");                      // 165 min

/** Uma segunda-feira futura, para não depender do dia em que os testes correm. */
function proximaSegunda(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return M.chaveData(d);
}
const KSEG = proximaSegunda();
const KDOM = (() => {
  const d = M.dataDeChave(KSEG);
  d.setDate(d.getDate() + 6);
  return M.chaveData(d);
})();

beforeEach(() => M.recarregar());

describe("horário", () => {
  it("segunda abre às 10:00 e fecha às 20:00", () => {
    expect(M.expedienteDe(KSEG)).toEqual({ abre: 600, fecha: 1200 });
  });
  it("domingo está encerrado", () => {
    expect(M.expedienteDe(KDOM)).toBeNull();
  });
});

describe("conversões de tempo", () => {
  it("converte hh:mm em minutos", () => expect(M.paraMinutos("10:00")).toBe(600));
  it("converte minutos em hh:mm", () => expect(M.paraHoras(1035)).toBe("17:15"));
  it("usa hora local na chave, não UTC", () => {
    expect(M.chaveData(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
  it("escreve a data por extenso em PT-PT", () => {
    expect(M.dataPorExtenso("2026-03-09")).toBe("segunda-feira, 9 de março");
  });
});

describe("duração contra a hora de fecho", () => {
  it("um corte de 30 min tem último início às 19:30", () => {
    const s = M.horasDoDia(KSEG, corte, "qualquer");
    expect(s.at(-1)!.etiqueta).toBe("19:30");
  });
  it("madeixas de 165 min só até às 17:15", () => {
    const s = M.horasDoDia(KSEG, madeixas, "qualquer");
    expect(s.at(-1)!.etiqueta).toBe("17:15");
  });
  it("domingo não gera horas", () => {
    expect(M.horasDoDia(KDOM, corte, "qualquer")).toHaveLength(0);
  });
  it("propõe horas de 15 em 15 minutos", () => {
    const s = M.horasDoDia(KSEG, corte, "qualquer");
    expect([s[0].etiqueta, s[1].etiqueta]).toEqual(["10:00", "10:15"]);
  });
});

describe("conflitos de agenda", () => {
  it("aceita a primeira marcação", () => {
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG,
      inicio: 660, nome: "Cliente Um", telemovel: "912345678" });
    expect(r.marcacao).toBeDefined();
    expect(r.erro).toBeUndefined();
    expect(r.marcacao!.estado).toBe("agendada");
    expect(r.marcacao!.id).toEqual(expect.any(String));
  });

  it("não existe código de reserva", () => {
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG,
      inicio: 660, nome: "Cliente", telemovel: "912345678" });
    expect(r.marcacao).not.toHaveProperty("codigo");
  });

  it("ocupa o barbeiro escolhido e deixa os outros livres", () => {
    M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG, inicio: 660,
      nome: "Cliente", telemovel: "912345678" });
    expect(M.estaLivre(KSEG, 660, 30, "ary")).toBe(false);
    expect(M.estaLivre(KSEG, 660, 30, "jonatas")).toBe(true);
    expect(M.estaLivre(KSEG, 660, 30, "qualquer")).toBe(true);
  });

  it("detecta sobreposição parcial mas permite encostar", () => {
    M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG, inicio: 660,
      nome: "Cliente", telemovel: "912345678" });
    expect(M.estaLivre(KSEG, 645, 30, "ary")).toBe(false); // 10:45–11:15 cruza
    expect(M.estaLivre(KSEG, 630, 30, "ary")).toBe(true);  // 10:30–11:00 encosta
  });

  it("recusa marcação duplicada no mesmo barbeiro e hora", () => {
    M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG, inicio: 660,
      nome: "Cliente Um", telemovel: "912345678" });
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG,
      inicio: 660, nome: "Cliente Dois", telemovel: "913333333" });
    expect(r.erro).toBeTruthy();
    expect(r.marcacao).toBeUndefined();
  });

  it("fica sem vagas quando os três barbeiros estão ocupados", () => {
    for (const b of ["ary", "jonatas", "miguel"]) {
      M.criarMarcacao({ servicoId: corte.id, barbeiroId: b, data: KSEG, inicio: 660,
        nome: "C", telemovel: "914444444" });
    }
    expect(M.barbeirosLivres(KSEG, 660, 30)).toHaveLength(0);
    expect(M.estaLivre(KSEG, 660, 30, "qualquer")).toBe(false);

    const grelha = M.horasDoDia(KSEG, corte, "qualquer");
    expect(grelha.find((s) => s.etiqueta === "11:00")!.livre).toBe(false);
    expect(grelha.find((s) => s.etiqueta === "11:30")!.livre).toBe(true);
  });
});

describe("sem preferência de barbeiro", () => {
  it("atribui um barbeiro concreto e guarda a escolha original", () => {
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "qualquer", data: KSEG,
      inicio: 780, nome: "Cliente", telemovel: "916666666" });
    expect(BARBEIROS.map((b) => b.id)).toContain(r.marcacao!.barbeiroId);
    expect(r.marcacao!.escolhaBarbeiro).toBe("qualquer");
  });
});

describe("antecedência mínima", () => {
  it("bloqueia as horas dentro dos próximos 30 minutos", () => {
    const agora = new Date();
    agora.setHours(14, 0, 0, 0);
    const hoje = M.chaveData(agora);
    if (!M.expedienteDe(hoje)) return; // domingo: nada a testar

    const horas = M.horasDoDia(hoje, corte, "qualquer", agora);
    const cedo = horas.filter((s) => s.inicio < 14 * 60 + M.ANTECEDENCIA_MIN);
    expect(cedo.every((s) => !s.livre)).toBe(true);
    expect(horas.find((s) => s.inicio >= 14 * 60 + 30)?.livre).toBe(true);
  });
});

describe("anular", () => {
  it("liberta a hora", () => {
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG,
      inicio: 660, nome: "Cliente", telemovel: "912345678" });
    expect(M.marcacoesDoCliente()).toHaveLength(1);
    M.anularMarcacao(r.marcacao!.id);
    expect(M.marcacoesDoCliente()).toHaveLength(0);
    expect(M.estaLivre(KSEG, 660, 30, "ary")).toBe(true);
  });
});

describe("estados", () => {
  it("nasce agendada e aceita mudança de estado", () => {
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "miguel", data: KSEG,
      inicio: 900, nome: "Estado", telemovel: "917777777" });
    expect(r.marcacao!.estado).toBe("agendada");
    expect(M.definirEstado(r.marcacao!.id, "concluida")).toBe(true);
    expect(M.marcacoesDe(KSEG).find((m) => m.id === r.marcacao!.id)!.estado).toBe("concluida");
  });

  it("recusa estado inválido e id inexistente", () => {
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "miguel", data: KSEG,
      inicio: 900, nome: "Estado", telemovel: "917777777" });
    // @ts-expect-error estado inválido de propósito
    expect(M.definirEstado(r.marcacao!.id, "inventado")).toBe(false);
    expect(M.definirEstado("nao-existe", "falta")).toBe(false);
  });
});

describe("consultas do painel", () => {
  beforeEach(() => {
    M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG, inicio: 660,
      nome: "A", telemovel: "912345678" });
    M.criarMarcacao({ servicoId: corte.id, barbeiroId: "miguel", data: KSEG, inicio: 600,
      nome: "B", telemovel: "913345678" });
  });

  it("devolve o dia ordenado por hora", () => {
    const dia = M.marcacoesDe(KSEG);
    expect(dia).toHaveLength(2);
    expect(dia[0].inicio).toBeLessThan(dia[1].inicio);
  });

  it("filtra por barbeiro", () => {
    const so = M.marcacoesDe(KSEG, "miguel");
    expect(so).toHaveLength(1);
    expect(so[0].barbeiroId).toBe("miguel");
  });

  it("resume contagem, ocupação e receita", () => {
    const r = M.resumoDoDia(KSEG);
    expect(r.total).toBe(2);
    expect(r.minutos).toBe(60);
    expect(r.receita).toBe(corte.preco * 2);
  });

  it("uma falta não conta para a receita", () => {
    const antes = M.resumoDoDia(KSEG).receita;
    M.definirEstado(M.marcacoesDe(KSEG)[0].id, "falta");
    const depois = M.resumoDoDia(KSEG);
    expect(depois.faltas).toBe(1);
    expect(depois.receita).toBe(antes - corte.preco);
  });
});

describe("ficheiro .ics", () => {
  const gerar = () => {
    const r = M.criarMarcacao({ servicoId: madeixas.id, barbeiroId: "ary", data: KSEG,
      inicio: 615, nome: "Ana; Silva, Jr", telemovel: "918888888",
      notas: "Linha um\nlinha dois" });
    return M.paraICS(r.marcacao!, madeixas);
  };

  it("usa CRLF, como a norma exige", () => {
    const ics = gerar();
    expect(ics).toContain("\r\n");
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it("tem a estrutura de um VCALENDAR", () => {
    const ics = gerar();
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toMatch(/^UID:.+@barbearia-garcia$/m);
    expect(ics).toMatch(/^DTSTART:\d{8}T\d{6}Z$/m);
    expect(ics).toMatch(/^DTEND:\d{8}T\d{6}Z$/m);
    expect(ics).toContain("BEGIN:VALARM");
  });

  it("respeita a duração do serviço", () => {
    const ics = gerar();
    const ler = (t: string) => {
      const m = ics.match(new RegExp(`^${t}:(\\d{4})(\\d{2})(\\d{2})T(\\d{2})(\\d{2})`, "m"))!;
      return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    };
    expect((ler("DTEND") - ler("DTSTART")) / 60000).toBe(madeixas.minutos);
  });

  it("escapa vírgulas e quebras de linha", () => {
    const ics = gerar();
    const desc = ics.split("\r\n").find((l) => l.startsWith("DESCRIPTION:"))!;
    expect(/(?<!\\),/.test(desc.slice(12))).toBe(false);
    expect(ics).not.toContain("Linha um\nlinha dois");
  });

  it("não menciona código de reserva", () => {
    expect(gerar()).not.toMatch(/Código:/);
  });
});

describe("ligação para o Google Agenda", () => {
  it("leva o intervalo e o modelo", () => {
    const r = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG,
      inicio: 660, nome: "Cliente", telemovel: "912345678" });
    const url = M.ligacaoGoogleAgenda(r.marcacao!, corte);
    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    expect(url).toMatch(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/);
    expect(url).toContain("action=TEMPLATE");
  });
});

describe("limpar", () => {
  it("esvazia o armazenamento", () => {
    M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG, inicio: 660,
      nome: "Cliente", telemovel: "912345678" });
    M.limparTudo();
    expect(M.todasAsMarcacoes()).toHaveLength(0);
  });
});

describe("validação", () => {
  it.each([
    ["", false], ["A", false], ["João Silva", true]
  ])("nome %j é aceite: %s", (v, valido) => {
    expect(M.validarNome(v as string) === null).toBe(valido);
  });

  it.each([
    ["912345678", true], ["+351 912 345 678", true], ["00351912345678", true],
    ["212345678", false], ["91234567", false], ["abcdefghi", false], ["", false]
  ])("telemóvel %j é aceite: %s", (v, valido) => {
    expect(M.validarTelemovel(v as string) === null).toBe(valido);
  });
});

describe("agenda de exemplo", () => {
  it("preenche dias e não se repete", () => {
    M.semearAgenda();
    const geradas = M.todasAsMarcacoes().filter((m) => !m.minha);
    expect(geradas.length).toBeGreaterThan(0);
    expect(M.diasComMarcacoes().length).toBeGreaterThan(3);

    const antes = M.todasAsMarcacoes().length;
    M.semearAgenda();
    expect(M.todasAsMarcacoes()).toHaveLength(antes);
  });

  it("nunca gera sobreposições no mesmo barbeiro", () => {
    M.semearAgenda();
    const porBarbeiroDia = new Map<string, { inicio: number; minutos: number }[]>();
    for (const m of M.todasAsMarcacoes()) {
      const k = `${m.data}|${m.barbeiroId}`;
      (porBarbeiroDia.get(k) ?? porBarbeiroDia.set(k, []).get(k)!).push(m);
    }
    for (const lista of porBarbeiroDia.values()) {
      lista.sort((a, b) => a.inicio - b.inicio);
      for (let i = 1; i < lista.length; i++) {
        expect(lista[i].inicio).toBeGreaterThanOrEqual(lista[i - 1].inicio + lista[i - 1].minutos);
      }
    }
  });

  it("respeita o horário: nada ao domingo nem depois do fecho", () => {
    M.semearAgenda();
    for (const m of M.todasAsMarcacoes()) {
      const exp = M.expedienteDe(m.data);
      expect(exp).not.toBeNull();
      expect(m.inicio).toBeGreaterThanOrEqual(exp!.abre);
      expect(m.inicio + m.minutos).toBeLessThanOrEqual(exp!.fecha);
    }
  });
});
