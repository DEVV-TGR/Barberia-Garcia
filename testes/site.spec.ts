import { test, expect, type Page } from "@playwright/test";

/* Percurso completo das três páginas. */

const escolherServico = async (p: Page, id: string) => {
  await p.locator(`[data-servico="${id}"]`).first().click();
};

test.describe("página inicial", () => {
  test("mostra a carta, a equipa e liga a marcar", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Barbearia Garcia/);

    // 19 serviços, com botão próprio cada um
    const marcar = page.locator('a[href^="/marcar?servico="]');
    await expect(marcar).toHaveCount(19);

    await expect(page.getByText("13 €").first()).toBeVisible();
    await expect(page.getByText("Sob orçamento").first()).toBeVisible();
    await expect(page.locator("article")).toHaveCount(3); // barbeiros

    const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(fundo).toBe("rgb(13, 42, 31)");
  });

  test("os grupos da carta abrem e fecham", async ({ page }) => {
    await page.goto("/#servicos");
    const barbearia = page.locator(".MuiAccordion-root").first();
    const primeiro = barbearia.locator('a[href^="/marcar?servico="]').first();
    await expect(primeiro).toBeVisible();

    await barbearia.locator(".MuiAccordionSummary-root").click();
    await expect(primeiro).toBeHidden();

    await barbearia.locator(".MuiAccordionSummary-root").click();
    await expect(primeiro).toBeVisible();
  });
});

test.describe("marcações", () => {
  test("ligação directa abre com o serviço escolhido", async ({ page }) => {
    await page.goto("/marcar?servico=corte-degrade");
    await expect(page.getByRole("heading", { name: "Com quem?" })).toBeVisible();
    // O passo do serviço já não está no ecrã: a prova é a barra de acção
    await expect(page.getByTestId("barra-accao")).toContainText("Corte Degradé");

    // E ao voltar atrás, o atalho aparece assinalado
    await page.getByLabel("Voltar atrás").click();
    await expect(page.locator('[data-atalho="corte-degrade"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("a faixa de acção é amarela e mostra a escolha", async ({ page }) => {
    await page.goto("/marcar");
    await escolherServico(page, "corte-degrade");

    const barra = page.getByTestId("barra-accao");
    await expect(barra).toBeVisible();
    await expect(barra).toContainText("Corte Degradé");
    await expect(barra).toContainText("15 €");

    const estilo = await barra.evaluate((e) => {
      const c = getComputedStyle(e);
      return { fundo: c.backgroundColor, posicao: c.position };
    });
    expect(estilo.fundo).toBe("rgb(242, 183, 5)");
    expect(estilo.posicao).toBe("fixed");

    // Sobre amarelo, o texto tem de ser verde escuro
    const cor = await barra.locator("p").first().evaluate((e) => getComputedStyle(e).color);
    expect(cor).toBe("rgb(13, 42, 31)");

    // A barra só sobe depois de haver escolha, por isso Avançar já está activo
    await expect(page.getByRole("button", { name: "Avançar" })).toBeEnabled();
  });

  test("percurso completo até ao calendário e à confirmação", async ({ page }) => {
    await page.goto("/marcar");
    await escolherServico(page, "corte-degrade");
    await page.getByRole("button", { name: "Avançar" }).click();

    await page.locator('[data-barbeiro="jonatas"]').click();
    await page.getByRole("button", { name: "Avançar" }).click();

    // Passo do dia: o calendário do MUI com as regras da casa
    await expect(page.getByText("Escolha primeiro um dia")).toBeVisible();
    const dia = page.locator(".MuiPickerDay-root:not(.Mui-disabled):not([disabled])").first();
    await dia.click();

    const horas = page.locator("[data-hora]:not(.Mui-disabled)");
    expect(await horas.count()).toBeGreaterThan(0);
    const hora = (await horas.first().textContent())!.trim();
    await horas.first().click();
    await page.getByRole("button", { name: "Avançar" }).click();

    // Validação antes de gravar
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText("Diga-nos como se chama.")).toBeVisible();

    await page.locator('[data-campo="nome"]').fill("Gonçalo Silva");
    await page.locator('[data-campo="telemovel"]').fill("212345678");
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByText(/telemóvel português válido/)).toBeVisible();

    await page.locator('[data-campo="telemovel"]').fill("914230669");
    await page.getByRole("button", { name: "Confirmar" }).click();

    const confirmacao = page.getByTestId("confirmacao");
    await expect(confirmacao).toBeVisible();
    await expect(confirmacao).toContainText("Gonçalo");
    await expect(confirmacao).toContainText("Jónatas");
    await expect(confirmacao).toContainText(hora);
    await expect(page.getByTestId("barra-accao")).toBeHidden();

    // A marcação fica guardada e sobrevive ao recarregar
    await expect(page.getByTestId("reserva")).toHaveCount(1);
    await page.reload();
    await expect(page.getByTestId("reserva")).toHaveCount(1);
  });

  test("guarda no calendário em .ics", async ({ page }) => {
    await page.goto("/marcar?servico=barba-a-vapor");
    await page.locator('[data-barbeiro="ary"]').click();
    await page.getByRole("button", { name: "Avançar" }).click();
    await page.locator(".MuiPickerDay-root:not(.Mui-disabled):not([disabled])").first().click();
    await page.locator("[data-hora]:not(.Mui-disabled)").first().click();
    await page.getByRole("button", { name: "Avançar" }).click();
    await page.locator('[data-campo="nome"]').fill("Ana Costa");
    await page.locator('[data-campo="telemovel"]').fill("915555555");
    await page.getByRole("button", { name: "Confirmar" }).click();

    const [descarga] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Guardar no calendário/ }).click()
    ]);
    expect(descarga.suggestedFilename()).toMatch(/^barbearia-garcia-.*\.ics$/);

    const fs = await import("fs");
    const conteudo = fs.readFileSync((await descarga.path())!, "utf8");
    expect(conteudo.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(conteudo).toContain("\r\n");
    expect(conteudo).toContain("Barba a Vapor");

    const gcal = await page.getByTestId("google-agenda").getAttribute("href");
    expect(gcal).toContain("calendar.google.com");
  });
});

test.describe("painel", () => {
  test("pede código, mostra a agenda e muda estados", async ({ page }) => {
    // Marcar primeiro, para o painel ter o que mostrar
    await page.goto("/marcar?servico=corte-degrade");
    await page.locator('[data-barbeiro="jonatas"]').click();
    await page.getByRole("button", { name: "Avançar" }).click();
    const dia = page.locator(".MuiPickerDay-root:not(.Mui-disabled):not([disabled])").first();
    const numeroDia = (await dia.textContent())!.trim();
    await dia.click();
    await page.locator("[data-hora]:not(.Mui-disabled)").first().click();
    await page.getByRole("button", { name: "Avançar" }).click();
    await page.locator('[data-campo="nome"]').fill("Rui Pereira");
    await page.locator('[data-campo="telemovel"]').fill("916666666");
    await page.getByRole("button", { name: "Confirmar" }).click();
    await expect(page.getByTestId("confirmacao")).toBeVisible();

    await page.goto("/painel");
    await expect(page.locator('[data-campo="pin"]')).toBeVisible();

    await page.locator('[data-campo="pin"]').fill("0000");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Código errado.")).toBeVisible();

    await page.locator('[data-campo="pin"]').fill("1997");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByTestId("agenda")).toBeVisible();

    // Navegar até ao dia da marcação
    const hoje = new Date();
    for (let i = 0; i < 40; i++) {
      const texto = await page.getByTestId("agenda").textContent();
      if (texto?.includes("Rui Pereira")) break;
      await page.getByLabel("Dia seguinte").click();
      await page.waitForTimeout(80);
    }
    expect(numeroDia).toBeTruthy();
    expect(hoje).toBeTruthy();

    const cartao = page.getByTestId("marcacao").filter({ hasText: "Rui Pereira" });
    await expect(cartao).toHaveCount(1);
    await expect(cartao).toContainText("Corte Degradé");
    await expect(cartao).toContainText("916666666");

    await cartao.locator('[data-accao="concluida"]').click();
    await expect(page.getByTestId("marcacao").filter({ hasText: "Rui Pereira" }))
      .toHaveAttribute("data-estado", "concluida");

    // Filtro por barbeiro
    await page.locator('[data-filtro="ary"]').click();
    await expect(page.getByTestId("agenda")).not.toContainText("Rui Pereira");
    await page.locator('[data-filtro="jonatas"]').click();
    await expect(page.getByTestId("agenda")).toContainText("Rui Pereira");
  });
});

test.describe("menu em cartão no telemóvel", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("abre ao centro, é amarelo e fecha como deve", async ({ page }) => {
    await page.goto("/");
    const abrir = page.getByLabel("Abrir menu");
    await expect(abrir).toBeVisible();
    await abrir.click();

    const cartao = page.locator(".MuiDialog-paper");
    await expect(cartao).toBeVisible();

    const info = await cartao.evaluate((e) => {
      const c = getComputedStyle(e), r = e.getBoundingClientRect();
      return {
        fundo: c.backgroundColor, sombra: c.boxShadow,
        cx: Math.round(r.left + r.width / 2), largura: Math.round(r.width)
      };
    });
    expect(info.fundo).toBe("rgb(242, 183, 5)");
    expect(info.sombra).not.toBe("none");
    expect(Math.abs(info.cx - 195)).toBeLessThanOrEqual(3); // centrado
    expect(info.largura).toBeLessThan(390);

    const corLink = await cartao.getByRole("link", { name: "Início" })
      .evaluate((e) => getComputedStyle(e).color);
    expect(corLink).toBe("rgb(13, 42, 31)");

    // Escape fecha (o Dialog do MUI trata disto de origem)
    await page.keyboard.press("Escape");
    await expect(cartao).toBeHidden();

    // Navegar a partir do cartão
    await abrir.click();
    await cartao.getByRole("link", { name: "Marcar vez" }).click();
    await expect(page).toHaveURL(/\/marcar/);
  });
});

/* ── O pedido: adaptar-se às resoluções ──────────────────────────────────────
   Não basta não transbordar: o texto tem de ser legível. A versão anterior
   tinha rótulos a 8.6px. Isto falha se algum voltar abaixo de 12px.
   ------------------------------------------------------------------------ */

const RESOLUCOES = [
  { nome: "iPhone SE", w: 375, h: 667 },
  { nome: "iPhone 15", w: 393, h: 852 },
  { nome: "iPad mini", w: 744, h: 1133 },
  { nome: "iPad Pro", w: 1024, h: 1366 },
  { nome: "Portátil", w: 1440, h: 900 },
  { nome: "Desktop", w: 1920, h: 1080 },
  { nome: "Ultrawide", w: 2560, h: 1080 }
];

for (const r of RESOLUCOES) {
  test.describe(`${r.nome} (${r.w}px)`, () => {
    test.use({ viewport: { width: r.w, height: r.h } });

    for (const caminho of ["/", "/marcar", "/painel"]) {
      test(`${caminho} adapta-se`, async ({ page }) => {
        await page.goto(caminho);
        await page.waitForLoadState("networkidle");

        const medida = await page.evaluate(() => {
          const largura = document.documentElement.clientWidth;
          const transbordos: string[] = [];
          const pequenos: string[] = [];

          document.querySelectorAll("*").forEach((el) => {
            const caixa = el.getBoundingClientRect();
            if (caixa.width > 0 && caixa.right > largura + 1) {
              transbordos.push(`${el.tagName}.${String(el.className).slice(0, 30)}`);
            }
            if (el.children.length === 0 && el.textContent?.trim()) {
              const tamanho = parseFloat(getComputedStyle(el).fontSize);
              if (tamanho < 12) pequenos.push(`${el.tagName} @${tamanho.toFixed(1)}px "${el.textContent.trim().slice(0, 20)}"`);
            }
          });

          return {
            scrollW: document.documentElement.scrollWidth,
            largura,
            transbordos: transbordos.slice(0, 3),
            pequenos: [...new Set(pequenos)].slice(0, 3)
          };
        });

        expect(medida.transbordos, `elementos a transbordar em ${caminho}`).toEqual([]);
        expect(medida.scrollW, "sem scroll horizontal").toBeLessThanOrEqual(medida.largura + 1);
        expect(medida.pequenos, `texto abaixo de 12px em ${caminho}`).toEqual([]);
      });
    }
  });
}

test("sem erros na consola", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });

  for (const caminho of ["/", "/marcar", "/painel"]) {
    await page.goto(caminho);
    await page.waitForLoadState("networkidle");
  }
  expect(erros).toEqual([]);
});

/* ── Correcções de telemóvel ─────────────────────────────────────────────────
   Cada um destes fixa um problema medido nas capturas do iPhone.
   ------------------------------------------------------------------------ */

test.describe("layout no telemóvel", () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test("o cabeçalho é opaco quando rolado", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(600);

    const fundo = await page.locator(".MuiAppBar-root")
      .evaluate((e) => getComputedStyle(e).backgroundColor);

    // Sem canal alfa, ou com alfa 1: nada do que está por baixo se lê através
    const alfa = fundo.startsWith("rgba") ? parseFloat(fundo.split(",")[3]) : 1;
    expect(alfa, `cabeçalho translúcido (${fundo})`).toBe(1);
  });

  test("saltar para uma âncora não esconde o título", async ({ page }) => {
    await page.goto("/#servicos");
    await page.waitForTimeout(1000);

    const medida = await page.evaluate(() => {
      const cab = document.querySelector(".MuiAppBar-root")!.getBoundingClientRect();
      const titulo = document.querySelector("#servicos h2")!.getBoundingClientRect();
      return { fundoCabecalho: cab.bottom, topoTitulo: titulo.top };
    });
    expect(medida.topoTitulo, "título por baixo do cabeçalho")
      .toBeGreaterThanOrEqual(medida.fundoCabecalho);
  });

  test("os cartões de serviço são compactos", async ({ page }) => {
    await page.goto("/#servicos");
    await page.waitForTimeout(800);
    const altura = await page.locator("[data-servico-linha]").first()
      .evaluate((e) => e.getBoundingClientRect().height);
    expect(altura, "cartão de serviço alto demais").toBeLessThan(120);
  });

  test("os cartões do painel são compactos", async ({ page }) => {
    await page.goto("/painel");
    await page.locator('[data-campo="pin"]').fill("1997");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: /Carregar agenda/ }).click();
    await page.waitForTimeout(800);

    const cartoes = page.getByTestId("marcacao");
    if (await cartoes.count() === 0) return; // domingo: nada agendado

    const altura = await cartoes.first().evaluate((e) => e.getBoundingClientRect().height);
    expect(altura, "cartão do painel alto demais").toBeLessThan(190);
  });

  test("os factos do hero ficam equilibrados", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    const linhas = await page.locator("dl").first().evaluate((dl) => {
      const tops = [...dl.children].map((e) => Math.round(e.getBoundingClientRect().top));
      const porLinha = new Map<number, number>();
      tops.forEach((t) => porLinha.set(t, (porLinha.get(t) ?? 0) + 1));
      return [...porLinha.values()];
    });
    expect(linhas.length, "mais de duas linhas de factos").toBeLessThanOrEqual(2);
    // 2+2, não 3+1
    expect(Math.max(...linhas) - Math.min(...linhas), "linhas desequilibradas").toBeLessThanOrEqual(1);
  });
});

test.describe("painel no telemóvel", () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test("o selo de estado não fica cortado", async ({ page }) => {
    await page.goto("/painel");
    await page.locator('[data-campo="pin"]').fill("1997");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: /Carregar agenda/ }).click();
    await page.waitForTimeout(800);

    const selos = page.locator("[data-selo]");
    if (await selos.count() === 0) return; // domingo

    const corte = await selos.first().evaluate((e) => {
      const rotulo = e.querySelector(".MuiChip-label") as HTMLElement;
      return { visivel: rotulo.scrollWidth <= rotulo.clientWidth + 1, texto: rotulo.textContent };
    });
    expect(corte.visivel, `selo truncado: "${corte.texto}"`).toBe(true);
  });
});
