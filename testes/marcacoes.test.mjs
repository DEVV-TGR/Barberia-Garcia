/* Testes do motor de marcações — sem dependências.
   Correr com:  node testes/marcacoes.test.mjs                          */
const loja = new Map();
globalThis.localStorage = {
  getItem: (k) => (loja.has(k) ? loja.get(k) : null),
  setItem: (k, v) => loja.set(k, String(v)),
  removeItem: (k) => loja.delete(k)
};

const raiz = new URL("../assets/js/", import.meta.url);
const M = await import(new URL("marcacoes.js", raiz));
const { SERVICOS, BARBEIROS } = await import(new URL("dados.js", raiz));

let passou = 0, falhou = 0;
const ok = (cond, msg) => { cond ? (passou++, console.log("  ✓", msg)) : (falhou++, console.log("  ✗ FALHOU:", msg)); };

// Uma segunda-feira futura, para não depender do dia em que os testes correm
const seg = new Date(); seg.setDate(seg.getDate() + 7);
while (seg.getDay() !== 1) seg.setDate(seg.getDate() + 1);
const KSEG = M.chaveData(seg);
const dom = new Date(seg); dom.setDate(dom.getDate() + 6);
const KDOM = M.chaveData(dom);

console.log("\n── Horário ──");
ok(M.expedienteDe(KSEG)?.abre === 600,  "segunda abre às 10:00 (600 min)");
ok(M.expedienteDe(KSEG)?.fecha === 1200, "segunda fecha às 20:00 (1200 min)");
ok(M.expedienteDe(KDOM) === null, "domingo está encerrado");

console.log("\n── Conversões de tempo ──");
ok(M.paraMinutos("10:00") === 600, "paraMinutos('10:00') = 600");
ok(M.paraHoras(1035) === "17:15", "paraHoras(1035) = '17:15'");
ok(M.chaveData(new Date(2026, 0, 5)) === "2026-01-05", "chaveData usa hora local, não UTC");

console.log("\n── Duração vs hora de fecho ──");
const corte = SERVICOS.find(s => s.id === "corte-classico-maquina-e-tesoura"); // 30 min
const madeixas = SERVICOS.find(s => s.id === "madeixas");                      // 165 min
const sCorte = M.horasDoDia(KSEG, corte, "qualquer");
const sMad   = M.horasDoDia(KSEG, madeixas, "qualquer");
ok(sCorte.at(-1).etiqueta === "19:30", `corte de 30min: último início 19:30 (obtido ${sCorte.at(-1).etiqueta})`);
ok(sMad.at(-1).etiqueta === "17:15",   `madeixas de 165min: último início 17:15 (obtido ${sMad.at(-1).etiqueta})`);
ok(M.horasDoDia(KDOM, corte, "qualquer").length === 0, "domingo não gera horas");
ok(sCorte[0].etiqueta === "10:00" && sCorte[1].etiqueta === "10:15", "slots de 15 em 15 minutos");

console.log("\n── Conflitos de barbeiro ──");
const r1 = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG, inicio: 660,
  nome: "Cliente Um", telemovel: "912345678", notas: "" });
ok(r1.marcacao && !r1.erro, "primeira marcação às 11:00 com o Ary é aceite");
ok(typeof r1.marcacao.id === "string" && r1.marcacao.id.length > 5, "recebe identificador próprio");
ok(!("codigo" in r1.marcacao), "já não existe código de reserva");

ok(!M.estaLivre(KSEG, 660, 30, "ary"), "Ary já não está livre às 11:00");
ok(M.estaLivre(KSEG, 660, 30, "jonatas"), "Jónatas continua livre às 11:00");
ok(M.estaLivre(KSEG, 660, 30, "qualquer"), "'qualquer' continua livre (restam 2 barbeiros)");

// Sobreposição parcial: 10:45 + 30min = 11:15, choca com 11:00–11:30
ok(!M.estaLivre(KSEG, 645, 30, "ary"), "sobreposição parcial (10:45–11:15) é detectada");
ok(M.estaLivre(KSEG, 630, 30, "ary"), "10:30–11:00 encosta sem sobrepor: permitido");

const r2 = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "ary", data: KSEG, inicio: 660,
  nome: "Cliente Dois", telemovel: "913333333", notas: "" });
ok(!!r2.erro && !r2.marcacao, "marcação duplicada no mesmo barbeiro/hora é recusada");

console.log("\n── Esgotar os três barbeiros ──");
M.criarMarcacao({ servicoId: corte.id, barbeiroId: "jonatas", data: KSEG, inicio: 660, nome: "C3", telemovel: "914444444" });
M.criarMarcacao({ servicoId: corte.id, barbeiroId: "miguel",  data: KSEG, inicio: 660, nome: "C4", telemovel: "915555555" });
ok(M.barbeirosLivres(KSEG, 660, 30).length === 0, "nenhum barbeiro livre às 11:00");
ok(!M.estaLivre(KSEG, 660, 30, "qualquer"), "'qualquer' fica indisponível quando todos estão ocupados");
const grelha = M.horasDoDia(KSEG, corte, "qualquer");
ok(grelha.find(s => s.etiqueta === "11:00").livre === false, "11:00 aparece marcado como ocupado na grelha");
ok(grelha.find(s => s.etiqueta === "11:30").livre === true,  "11:30 continua livre");

console.log("\n── Atribuição com 'sem preferência' ──");
const r3 = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "qualquer", data: KSEG, inicio: 780, nome: "C5", telemovel: "916666666" });
ok(r3.marcacao && BARBEIROS.some(b => b.id === r3.marcacao.barbeiroId), `'qualquer' recebeu um barbeiro concreto (${r3.marcacao?.barbeiroId})`);
ok(r3.marcacao.escolhaBarbeiro === "qualquer", "a escolha original fica registada");

console.log("\n── Antecedência mínima (hoje) ──");
const agora = new Date(); agora.setHours(14, 0, 0, 0);
const hojeK = M.chaveData(agora);
if (M.expedienteDe(hojeK)) {
  const hs = M.horasDoDia(hojeK, corte, "qualquer", agora);
  const antes = hs.filter(s => s.inicio < 14 * 60 + M.ANTECEDENCIA_MIN);
  ok(antes.every(s => !s.livre), "horas dentro dos próximos 30 min estão bloqueadas");
  const depois = hs.find(s => s.inicio >= 14 * 60 + 30);
  ok(depois ? depois.livre : true, "a partir dos 30 min já há vagas");
} else {
  console.log("  (hoje é domingo — salto este bloco)"); passou += 2;
}

console.log("\n── Anular ──");
const antesN = M.marcacoesDoCliente().length;
M.anularMarcacao(r1.marcacao.id);
ok(M.marcacoesDoCliente().length === antesN - 1, "anular remove a marcação");
ok(M.estaLivre(KSEG, 660, 30, "ary"), "a hora volta a ficar livre depois de anular");

console.log("\n── Validação ──");
ok(M.validarNome("") !== null, "nome vazio é recusado");
ok(M.validarNome("A") !== null, "nome de uma letra é recusado");
ok(M.validarNome("João Silva") === null, "nome normal é aceite");
ok(M.validarTelemovel("912345678") === null, "912345678 é aceite");
ok(M.validarTelemovel("+351 912 345 678") === null, "aceita indicativo e espaços");
ok(M.validarTelemovel("212345678") !== null, "fixo (21…) é recusado");
ok(M.validarTelemovel("91234567") !== null, "8 dígitos é recusado");
ok(M.validarTelemovel("abcdefghi") !== null, "letras são recusadas");

console.log("\n── Datas por extenso (PT-PT) ──");
const ex = M.dataPorExtenso("2026-03-09");
ok(ex === "segunda-feira, 9 de março", `dataPorExtenso: "${ex}"`);


console.log("\n── Estados ──");
const rE = M.criarMarcacao({ servicoId: corte.id, barbeiroId: "miguel", data: KSEG, inicio: 900,
  nome: "Estado Teste", telemovel: "917777777" });
ok(rE.marcacao.estado === "agendada", "nasce com estado 'agendada'");
ok(M.definirEstado(rE.marcacao.id, "concluida"), "definirEstado aceita 'concluida'");
ok(M.marcacoesDe(KSEG).find(m => m.id === rE.marcacao.id).estado === "concluida", "o estado persiste");
ok(!M.definirEstado(rE.marcacao.id, "inventado"), "estado inválido é recusado");
ok(!M.definirEstado("nao-existe", "falta"), "id inexistente é recusado");

console.log("\n── Consultas do painel ──");
const doDia = M.marcacoesDe(KSEG);
ok(doDia.length > 0, `marcacoesDe devolve ${doDia.length} marcações`);
ok(doDia.every((m, i) => i === 0 || doDia[i-1].inicio <= m.inicio), "vêm ordenadas por hora");
const soMiguel = M.marcacoesDe(KSEG, "miguel");
ok(soMiguel.every(m => m.barbeiroId === "miguel"), "filtro por barbeiro funciona");
ok(soMiguel.length <= doDia.length, "o filtro reduz ou mantém");

const resumo = M.resumoDoDia(KSEG);
ok(resumo.total === doDia.length, `resumo conta ${resumo.total} marcações`);
ok(resumo.receita > 0, `receita prevista ${resumo.receita} €`);
ok(resumo.minutos > 0, `${resumo.minutos} minutos ocupados`);
M.definirEstado(rE.marcacao.id, "falta");
const resumo2 = M.resumoDoDia(KSEG);
ok(resumo2.faltas === 1, "as faltas são contadas");
ok(resumo2.receita === resumo.receita - corte.preco, "uma falta não conta para a receita");

console.log("\n── Ficheiro .ics ──");
const rI = M.criarMarcacao({ servicoId: madeixas.id, barbeiroId: "ary", data: KSEG, inicio: 615,
  nome: "Ana; Silva, Jr", telemovel: "918888888", notas: "Linha um\nlinha dois" });
const ics = M.paraICS(rI.marcacao, madeixas);
ok(ics.includes("\r\n"), "usa CRLF (o Outlook recusa só LF)");
ok(!/[^\r]\n/.test(ics), "não há nenhum LF sem CR antes");
ok(ics.startsWith("BEGIN:VCALENDAR\r\n"), "começa em BEGIN:VCALENDAR");
ok(ics.trimEnd().endsWith("END:VCALENDAR"), "termina em END:VCALENDAR");
ok(/^UID:.+@barbearia-garcia$/m.test(ics), "tem UID");
ok(/^DTSTART:\d{8}T\d{6}Z$/m.test(ics), "DTSTART em UTC");
ok(/^DTEND:\d{8}T\d{6}Z$/m.test(ics), "DTEND em UTC");
ok(ics.includes("SUMMARY:Madeixas"), "SUMMARY tem o serviço");
ok(ics.includes("BEGIN:VALARM"), "inclui lembrete");
ok(!/Código:/.test(ics), "o ICS não menciona código de reserva");

// Duração: 615 -> 615+165 = 780. Confirmar diferença de 165 min no ICS.
const gd = (t) => { const m = ics.match(new RegExp("^"+t+":(\\d{4})(\\d{2})(\\d{2})T(\\d{2})(\\d{2})", "m"));
  return Date.UTC(+m[1], +m[2]-1, +m[3], +m[4], +m[5]); };
ok((gd("DTEND") - gd("DTSTART")) / 60000 === madeixas.minutos,
   `duração no ICS = ${madeixas.minutos} min`);

const linhaSum = ics.split("\r\n").find(l => l.startsWith("DESCRIPTION:"));
ok(!/(?<!\\),/.test(linhaSum.slice(12)), "vírgulas escapadas na descrição");
ok(!ics.includes("Linha um\nlinha dois"), "quebras de linha não passam em bruto");

console.log("\n── Ligação Google Agenda ──");
const url = M.ligacaoGoogleAgenda(rI.marcacao, madeixas);
ok(url.startsWith("https://calendar.google.com/calendar/render?"), "URL do Google Agenda");
ok(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/.test(url), "intervalo de datas codificado");
ok(url.includes("action=TEMPLATE"), "action=TEMPLATE");

console.log("\n── Limpar ──");
M.limparTudo();
ok(M.todasAsMarcacoes().length === 0, "limparTudo esvazia o armazenamento");

console.log(`\n${"─".repeat(46)}\n  ${passou} passaram · ${falhou} falharam\n`);
process.exit(falhou ? 1 : 0);
