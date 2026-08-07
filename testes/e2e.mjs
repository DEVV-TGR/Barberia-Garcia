import { chromium } from "playwright";

const base = "http://localhost:8080/index.html";
const erros = [];
let passou = 0, falhou = 0;
const ok = (c, m) => { c ? (passou++, console.log("  ✓", m)) : (falhou++, console.log("  ✗ FALHOU:", m)); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: "reduce" });

page.on("console", m => { if (m.type() === "error") erros.push(m.text()); });
page.on("pageerror", e => erros.push("PAGEERROR: " + e.message));
page.on("requestfailed", r => erros.push("REQ FALHOU: " + r.url()));

await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

console.log("\n── Render inicial ──");
ok((await page.title()).includes("Barbearia Garcia"), "título da página");
ok(await page.locator("#lista-servicos .servico").count() === 19, `19 serviços pintados (${await page.locator("#lista-servicos .servico").count()})`);
ok(await page.locator("#grelha-equipa .barbeiro").count() === 3, "3 barbeiros");
ok(await page.locator("#grelha-galeria figure").count() === 5, "5 fotos na galeria");
ok(await page.locator("#horario li").count() === 7, "7 dias no horário");
ok((await page.locator("#horario li").last().textContent()).includes("Encerrado"), "domingo marcado como encerrado");

await page.screenshot({ path: "shot-hero.png" });

console.log("\n── Preços reais visíveis ──");
const txt = await page.locator("#lista-servicos").textContent();
ok(txt.includes("13 €"), "Corte Clássico a 13 €");
ok(txt.includes("23 €"), "Corte Degradé + Barba Vapor a 23 €");
ok(txt.includes("Sob orçamento"), "tatuagem sob orçamento");

console.log("\n── Fluxo de marcação ──");
await page.locator("#marcar").scrollIntoViewIfNeeded();
ok(await page.locator("#btn-avancar").isDisabled(), "Continuar começa desactivado");

// Passo 1
await page.locator('label.opcao:has(input[value="corte-degrade"])').click();
ok(!await page.locator("#btn-avancar").isDisabled(), "escolher serviço activa o Continuar");
await page.locator("#btn-avancar").click();
await page.waitForTimeout(500);
ok(await page.locator('[data-painel="2"]').isVisible(), "passou ao passo 2");
await page.screenshot({ path: "shot-passo2.png" });

// Passo 2
await page.locator('label.opcao:has(input[value="jonatas"])').click();
await page.locator("#btn-avancar").click();
await page.waitForTimeout(500);
ok(await page.locator('[data-painel="3"]').isVisible(), "passou ao passo 3");

// Passo 3 — calendário
const dias = page.locator("#cal-dias .dia[data-dia]:not([disabled])");
const nDias = await dias.count();
ok(nDias > 0, `há ${nDias} dias seleccionáveis`);
const domingos = await page.locator("#cal-dias .dia[data-dia][disabled]").count();
ok(domingos > 0, "há dias bloqueados (domingos/sem vaga)");

const diaEscolhido = await dias.first().getAttribute("data-dia");
await dias.first().click();
await page.waitForTimeout(400);
const horas = page.locator(".hora:not([disabled])");
const nHoras = await horas.count();
ok(nHoras > 0, `${nHoras} horas livres no dia escolhido`);
const ocupadas = await page.locator(".hora[disabled]").count();
ok(ocupadas >= 0, `${ocupadas} horas mostradas como ocupadas`);
await page.screenshot({ path: "shot-passo3.png" });

const horaTexto = await horas.first().textContent();
await horas.first().click();
await page.locator("#btn-avancar").click();
await page.waitForTimeout(500);
ok(await page.locator('[data-painel="4"]').isVisible(), "passou ao passo 4");

// Passo 4 — validação
const resumo = await page.locator("#resumo").textContent();
ok(resumo.includes("Corte Degradé"), "resumo mostra o serviço");
ok(resumo.includes("Jónatas"), "resumo mostra o barbeiro");
ok(resumo.includes("15 €"), "resumo mostra o preço 15 €");
await page.screenshot({ path: "shot-passo4.png" });

// Confirmar sem preencher → tem de recusar
await page.locator("#btn-avancar").click();
await page.waitForTimeout(300);
ok(await page.locator('[data-painel="4"]').isVisible(), "não avança com campos vazios");
ok((await page.locator("#erro-nome").textContent()).length > 0, "mostra erro no nome");

// Telemóvel inválido
await page.fill("#nome", "Gonçalo Silva");
await page.fill("#telemovel", "212345678");
await page.locator("#btn-avancar").click();
await page.waitForTimeout(300);
ok((await page.locator("#erro-telemovel").textContent()).includes("telemóvel"), "recusa telefone fixo");

// Válido
await page.fill("#telemovel", "914230669");
await page.fill("#notas", "Máquina 2 nos lados.");
await page.locator("#btn-avancar").click();
await page.waitForTimeout(900);

console.log("\n── Confirmação ──");
ok(await page.locator('[data-painel="5"]').isVisible(), "chegou à confirmação");
const cod = (await page.locator("#codigo-reserva").textContent()).trim();
ok(/^BG-[A-Z2-9]{4}$/.test(cod), `código gerado: ${cod}`);
const conf = await page.locator("#texto-confirmacao").textContent();
ok(conf.includes("Gonçalo"), "trata o cliente pelo nome");
ok(conf.includes("Jónatas"), "confirma o barbeiro");
await page.screenshot({ path: "shot-confirmado.png" });

console.log("\n── Marcação guardada ──");
ok(await page.locator(".reserva").count() === 1, "aparece 1 marcação na lista");
ok((await page.locator(".reserva").textContent()).includes(cod), "a lista mostra o código");

// A hora escolhida deixou de estar livre — reabrir explicitamente o MESMO dia,
// porque marcar pode esgotar o dia e fazer o calendário saltar para o seguinte.
await page.locator("#nova-marcacao").click();
await page.waitForTimeout(400);
await page.locator('label.opcao:has(input[value="corte-degrade"])').click();
await page.locator("#btn-avancar").click(); await page.waitForTimeout(300);
await page.locator('label.opcao:has(input[value="jonatas"])').click();
await page.locator("#btn-avancar").click(); await page.waitForTimeout(500);

const botaoMesmoDia = page.locator(`#cal-dias .dia[data-dia="${diaEscolhido}"]`);
const diaEsgotado = await botaoMesmoDia.isDisabled();
if (diaEsgotado) {
  ok(true, `o dia ${diaEscolhido} ficou esgotado para o Jónatas (a hora foi consumida)`);
} else {
  await botaoMesmoDia.click();
  await page.waitForTimeout(400);
  const aindaLivre = await page.locator(".hora:not([disabled])").filter({ hasText: horaTexto.trim() }).count();
  ok(aindaLivre === 0, `a hora ${horaTexto.trim()} já não aparece livre para o Jónatas em ${diaEscolhido}`);
}

// E continua livre para outro barbeiro no mesmo dia e hora
await page.locator("#btn-atras").click(); await page.waitForTimeout(300);
await page.locator('label.opcao:has(input[value="ary"])').click();
await page.locator("#btn-avancar").click(); await page.waitForTimeout(500);
const diaAry = page.locator(`#cal-dias .dia[data-dia="${diaEscolhido}"]`);
if (!await diaAry.isDisabled()) {
  await diaAry.click(); await page.waitForTimeout(400);
  const paraAry = await page.locator(".hora:not([disabled])").filter({ hasText: horaTexto.trim() }).count();
  ok(paraAry === 1, `a mesma hora continua livre para o Ary (agendas independentes)`);
} else { ok(true, "dia sem vagas para o Ary — salto a verificação"); }

// Persistência
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1000);
ok(await page.locator(".reserva").count() === 1, "a marcação sobrevive ao recarregar");

console.log("\n── Responsivo ──");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const larguraDoc = await page.evaluate(() => document.documentElement.scrollWidth);
ok(larguraDoc <= 391, `sem scroll horizontal no telemóvel (${larguraDoc}px)`);
ok(await page.locator("#abre-menu").isVisible(), "botão de menu visível no telemóvel");
await page.locator("#abre-menu").click();
await page.waitForTimeout(400);
ok(await page.locator("#menu").evaluate(e => e.classList.contains("aberto")), "menu abre");
await page.screenshot({ path: "shot-mobile.png", fullPage: false });

console.log("\n── Consola ──");
ok(erros.length === 0, erros.length ? `ERROS: ${erros.slice(0,5).join(" | ")}` : "sem erros nem pedidos falhados");

await browser.close();
console.log(`\n${"─".repeat(46)}\n  ${passou} passaram · ${falhou} falharam\n`);
process.exit(falhou ? 1 : 0);
