import { test, expect, type Page } from "@playwright/test";

/* O movimento do site: loader entre páginas, deslize nas âncoras, painéis da
   carta e secções a revelar-se.

   O que se verifica aqui não é "está animado" — é o que distingue uma animação
   de um corte: haver estados intermédios. Daí as medições a meio da transição,
   em vez de só no princípio e no fim. */

const ASSENTAR = 1400; // primeira carga: loader mínimo mais a entrada da página

const visibilidadeDoLoader = (p: Page) =>
  p.locator("[data-carregamento]").evaluate((e) => getComputedStyle(e).visibility);

test.describe("loader entre páginas", () => {
  test("cobre a primeira carga e sai do caminho", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForTimeout(250);
    expect(await visibilidadeDoLoader(page)).toBe("visible");

    await page.waitForTimeout(ASSENTAR);
    expect(await visibilidadeDoLoader(page)).toBe("hidden");
  });

  test("levanta-se ao mudar de página", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(ASSENTAR);

    await page.getByRole("link", { name: "Marcar vez" }).first().click();
    await page.waitForTimeout(300);
    expect(await visibilidadeDoLoader(page)).toBe("visible");

    await expect(page).toHaveURL(/\/marcar/);
    await page.waitForTimeout(ASSENTAR);
    expect(await visibilidadeDoLoader(page)).toBe("hidden");
  });

  test("não se levanta para um salto dentro da mesma página", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(ASSENTAR);

    // O botão do hero, e não o do cabeçalho: em telemóvel esse está escondido
    // dentro do menu. De caminho cobre o `href` relativo, sem caminho nenhum.
    await page.getByRole("link", { name: "Ver a carta" }).click();
    await page.waitForTimeout(300);
    expect(await visibilidadeDoLoader(page)).toBe("hidden");

    // E voltar atrás de uma âncora também não é mudar de página
    await page.goBack();
    await page.waitForTimeout(300);
    expect(await visibilidadeDoLoader(page)).toBe("hidden");
  });
});

test.describe("âncoras", () => {
  test("deslizam em vez de saltar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(ASSENTAR);
    expect(await page.evaluate(() => scrollY)).toBe(0);

    await page.locator("header").getByRole("link", { name: "Serviços", exact: true }).click();

    // A meio já andou mas ainda não chegou — é isto que um salto não faz
    await page.waitForTimeout(120);
    const aMeio = await page.evaluate(() => scrollY);

    await page.waitForTimeout(1500);
    const fim = await page.evaluate(() => scrollY);

    expect(aMeio).toBeGreaterThan(0);
    expect(aMeio).toBeLessThan(fim - 50);

    expect(page.url()).toContain("#servicos");
    // O `scroll-margin-top` do tema tira o título de debaixo do cabeçalho fixo
    const topo = await page.locator("#servicos").evaluate((e) => e.getBoundingClientRect().top);
    expect(Math.abs(topo)).toBeLessThan(120);
  });

  test("no telemóvel o menu fecha no mesmo clique", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto("/");
    await page.waitForTimeout(ASSENTAR);

    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();

    // O deslize trava o `next/link` com `preventDefault`; se travasse o evento
    // todo, o menu ficava aberto por trás da página a deslizar.
    await menu.getByRole("link", { name: "Equipa" }).click();
    await expect(menu).toBeHidden();

    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(page.url()).toContain("#equipa");
  });
});

test.describe("painéis da carta", () => {
  test("fecham por etapas, não de um golpe", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(ASSENTAR);
    await page.locator("#servicos").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);

    const painel = page.locator("#servicos .MuiCollapse-root").first();
    const aberto = (await painel.boundingBox())!.height;
    expect(aberto).toBeGreaterThan(500); // o grupo Barbearia tem 18 serviços

    await page.locator("#servicos .MuiAccordionSummary-root").first().click();
    await page.waitForTimeout(180);
    const aMeio = (await painel.boundingBox())!.height;

    await page.waitForTimeout(900);
    expect((await painel.boundingBox())!.height).toBe(0);

    // A meio do caminho ainda tem de restar boa parte da lista: com a curva de
    // abertura, um painel deste tamanho já ia em 3 % aqui, e lia-se como estalo.
    expect(aMeio).toBeGreaterThan(aberto * 0.15);
    expect(aMeio).toBeLessThan(aberto * 0.85);
  });
});

test.describe("secções", () => {
  test("revelam-se ao chegar ao ecrã", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(ASSENTAR);

    const seccoes = page.locator("[data-revela]");
    await expect(seccoes).toHaveCount(6);

    const equipa = seccoes.nth(2);
    const opacidade = (l: typeof equipa) => l.evaluate((e) => Number(getComputedStyle(e).opacity));
    expect(await opacidade(equipa)).toBeLessThan(1);

    await equipa.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    expect(await opacidade(equipa)).toBe(1);
    expect(await equipa.evaluate((e) => getComputedStyle(e).transform)).toBe("none");

    const ultima = seccoes.nth(5);
    await ultima.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    expect(await opacidade(ultima)).toBe(1);
  });
});
