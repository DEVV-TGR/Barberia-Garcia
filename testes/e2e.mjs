/* Percurso end-to-end das três páginas.
   Precisa de servidor em http://localhost:8080 e de playwright instalado.
   Correr com:  npm start  (noutro terminal)  &&  node testes/e2e.mjs      */
import { chromium } from "playwright";
const base = "http://localhost:8080";
const erros = [];
let passou = 0, falhou = 0;
const ok = (c,m) => { c ? (passou++, console.log("  ✓", m)) : (falhou++, console.log("  ✗ FALHOU:", m)); };

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });
p.on("console", m => { if (m.type()==="error") erros.push(m.text()); });
p.on("pageerror", e => erros.push("PAGEERROR: " + e.message));
p.on("requestfailed", r => { if (!r.url().includes("fonts.g")) erros.push("REQ: " + r.url()); });

console.log("\n── Página inicial ──");
await p.goto(base + "/index.html", { waitUntil: "networkidle" });
await p.waitForTimeout(900);
ok(await p.locator("#lista-servicos .servico").count() === 19, "19 serviços");
ok(await p.locator('#lista-servicos a[href^="marcar.html?servico="]').count() === 19, "cada serviço tem botão marcar");
ok(await p.locator("#grelha-equipa .barbeiro").count() === 3, "3 barbeiros");
ok(await p.locator('.menu a[href="marcar.html"]').count() === 1, "botão marcar no menu");
ok((await p.locator("#anos-casa").textContent()) === "Vinte e nove", "anos calculados");
const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
ok(bg === "rgb(13, 42, 31)", `fundo verde (${bg})`);
const raio = await p.locator(".hero__accoes .botao").first().evaluate(e => getComputedStyle(e).borderRadius);
ok(parseFloat(raio) > 100, `botões em pill (${raio})`);
await p.screenshot({ path: "/tmp/bg-inicio.png" });

console.log("\n── Ligação directa do serviço ──");
await p.locator('#lista-servicos a[href="marcar.html?servico=corte-degrade"]').first().click();
await p.waitForLoadState("networkidle");
await p.waitForTimeout(800);
ok(p.url().includes("servico=corte-degrade"), "navegou com o parâmetro");
ok(await p.locator('[data-painel="2"]').isVisible(), "abriu já no passo 2 (barbeiro)");
ok(await p.locator('input[value="corte-degrade"]').isChecked(), "serviço pré-seleccionado na carta");
ok(await p.locator('[data-atalho="corte-degrade"]').getAttribute("aria-pressed") === "true",
   "atalho dos mais pedidos também assinalado");

console.log("\n── Barra de acção ──");
const barra = p.locator("#barra-accao");
ok(await barra.isVisible(), "barra visível com o serviço escolhido");
const resumoBarra = await p.locator("#barra-resumo").textContent();
ok(resumoBarra.includes("Corte Degradé"), "barra mostra o serviço");
ok(resumoBarra.includes("15 €"), "barra mostra o preço");
const posBarra = await barra.evaluate(e => getComputedStyle(e).position);
ok(posBarra === "fixed", "barra é fixa ao ecrã");
ok(await p.locator("#btn-avancar").isDisabled(), "Avançar bloqueado sem barbeiro");
await p.screenshot({ path: "/tmp/bg-marcar-barra.png" });

console.log("\n── Fluxo completo ──");
await p.locator('label.opcao:has(input[value="jonatas"])').first().click();
ok(!await p.locator("#btn-avancar").isDisabled(), "Avançar activo após escolher barbeiro");
await p.locator("#btn-avancar").click(); await p.waitForTimeout(600);
ok(await p.locator('[data-painel="3"]').isVisible(), "passo 3");
ok((await p.locator("#zona-horas").textContent()).includes("Escolha primeiro um dia"), "pede o dia primeiro");

const dias = p.locator("#cal-dias .dia[data-dia]:not([disabled])");
const diaK = await dias.first().getAttribute("data-dia");
await dias.first().click(); await p.waitForTimeout(400);
const horas = p.locator(".hora:not([disabled])");
ok(await horas.count() > 0, `${await horas.count()} horas livres`);
const horaTxt = (await horas.first().textContent()).trim();
await horas.first().click(); await p.waitForTimeout(200);
await p.mouse.move(1350, 150); await p.waitForTimeout(150);
const corHora = await p.locator('.hora[aria-pressed="true"]').evaluate(e => {
  const c = getComputedStyle(e); return c.color + " sobre " + c.backgroundColor; });
ok(!corHora.startsWith("rgb(242, 183, 5) sobre rgb(242, 183, 5)"), `hora seleccionada legível (${corHora})`);
await p.screenshot({ path: "/tmp/bg-marcar-horas.png" });

await p.locator("#btn-avancar").click(); await p.waitForTimeout(500);
ok(await p.locator('[data-painel="4"]').isVisible(), "passo 4");
await p.locator("#btn-avancar").click(); await p.waitForTimeout(300);
ok((await p.locator("#erro-nome").textContent()).length > 0, "valida nome vazio");

await p.fill("#nome", "Gonçalo Silva");
await p.fill("#telemovel", "914230669");
await p.fill("#notas", "Máquina 2 nos lados.");
await p.screenshot({ path: "/tmp/bg-marcar-dados.png" });
await p.locator("#btn-avancar").click(); await p.waitForTimeout(900);

console.log("\n── Confirmação e calendário ──");
ok(await p.locator('[data-painel="5"]').isVisible(), "chegou à confirmação");
const cod = (await p.locator("#codigo-reserva").textContent()).trim();
ok(/^BG-[A-Z2-9]{4}$/.test(cod), `código ${cod}`);
ok(await barra.isHidden(), "barra desaparece na confirmação");
const gcal = await p.locator("#google-agenda").getAttribute("href");
ok(gcal.startsWith("https://calendar.google.com/"), "ligação Google Agenda preenchida");

const [dl] = await Promise.all([
  p.waitForEvent("download"),
  p.locator("#guardar-ics").click()
]);
const nomeIcs = dl.suggestedFilename();
ok(nomeIcs.endsWith(".ics") && nomeIcs.includes(cod), `descarregou ${nomeIcs}`);
const caminho = await dl.path();
const conteudo = (await import("fs")).readFileSync(caminho, "utf8");
ok(conteudo.startsWith("BEGIN:VCALENDAR"), "ICS válido");
ok(conteudo.includes("\r\n"), "ICS com CRLF");
ok(conteudo.includes("Corte Degradé"), "ICS tem o serviço");
await p.screenshot({ path: "/tmp/bg-confirmado.png" });

console.log("\n── Painel ──");
await p.goto(base + "/painel.html", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
ok(await p.locator("#entrada-painel").isVisible(), "pede código");
ok(await p.locator("#painel-agenda").isHidden(), "agenda escondida antes de entrar");
await p.fill("#pin", "0000");
await p.locator('#form-pin button[type="submit"]').click(); await p.waitForTimeout(300);
ok((await p.locator("#erro-pin").textContent()).includes("errado"), "código errado é recusado");
await p.fill("#pin", "1997");
await p.locator('#form-pin button[type="submit"]').click(); await p.waitForTimeout(600);
ok(await p.locator("#painel-agenda").isVisible(), "entrou com 1997");

await p.fill("#selector-dia", diaK);
await p.dispatchEvent("#selector-dia", "change");
await p.waitForTimeout(500);
const agenda = await p.locator("#agenda").textContent();
ok(agenda.includes("Gonçalo Silva"), "a marcação aparece no painel");
ok(agenda.includes("Corte Degradé"), "mostra o serviço");
ok(agenda.includes("914230669"), "mostra o telefone");
ok(agenda.includes("Máquina 2 nos lados"), "mostra as observações");
ok(agenda.includes(horaTxt), `mostra a hora ${horaTxt}`);
ok((await p.locator("#resumo-dia").textContent()).includes("€"), "resumo com receita");
await p.screenshot({ path: "/tmp/bg-painel.png" });

console.log("\n── Estados e filtros ──");
const cartao = p.locator(".marcacao").filter({ hasText: "Gonçalo Silva" });
await cartao.locator('[data-estado="concluida"]').click(); await p.waitForTimeout(400);
ok(await p.locator(".marcacao.concluida").count() >= 1, "marcada como concluída");
ok((await p.locator(".selo--concluida").first().textContent()).includes("Concluída"), "selo actualizado");
await p.locator(".filtro[data-barbeiro='ary']").click(); await p.waitForTimeout(400);
const soAry = await p.locator("#agenda").textContent();
ok(!soAry.includes("Gonçalo Silva"), "filtro por Ary esconde a marcação do Jónatas");
await p.locator(".filtro[data-barbeiro='jonatas']").click(); await p.waitForTimeout(400);
ok((await p.locator("#agenda").textContent()).includes("Gonçalo Silva"), "filtro por Jónatas mostra-a");

console.log("\n── Responsivo ──");
for (const pag of ["index", "marcar", "painel"]) {
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(`${base}/${pag}.html`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const w = await p.evaluate(() => document.documentElement.scrollWidth);
  ok(w <= 391, `${pag}: sem scroll horizontal (${w}px)`);
}
await p.goto(base + "/marcar.html?servico=corte-degrade", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
await p.screenshot({ path: "/tmp/bg-mobile-marcar.png" });


console.log("\n── Texto invisível (cor igual ao fundo) ──");
for (const pag of ["index", "marcar", "painel"]) {
  await p.setViewportSize({ width: 1440, height: 950 });
  await p.goto(`${base}/${pag}.html`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  const maus = await p.evaluate(() => {
    const fundoReal = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const bg = getComputedStyle(n).backgroundColor;
        const m = bg.match(/[\d.]+/g);
        if (m && (m.length < 4 || parseFloat(m[3]) > 0.5)) return bg;
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    };
    const out = [];
    document.querySelectorAll("a,button,p,h1,h2,h3,h4,span,li,dd,dt,label").forEach(el => {
      if (!el.offsetParent && el.tagName !== "BODY") return;
      const t = el.textContent.trim();
      if (!t || el.children.length > 0) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.opacity === "0") return;
      if (cs.color === fundoReal(el)) {
        out.push(`${el.tagName}.${el.className}`.slice(0, 60) + ` "${t.slice(0,25)}"`);
      }
    });
    return out;
  });
  ok(maus.length === 0, maus.length ? `${pag}: ${maus.slice(0,3).join(" | ")}` : `${pag}: nenhum texto invisível`);
}

console.log("\n── Consola ──");
ok(erros.length === 0, erros.length ? `ERROS: ${erros.slice(0,4).join(" | ")}` : "sem erros");

await b.close();
console.log(`\n${"─".repeat(46)}\n  ${passou} passaram · ${falhou} falharam\n`);
process.exit(falhou ? 1 : 0);
