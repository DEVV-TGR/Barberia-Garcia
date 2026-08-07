# Barbearia Garcia & Tatuagem — site de demonstração

Site demo para a [Barbearia Garcia & Tatuagem](https://noona.pt/barbeariagarcia),
em Moreira, Maia. Next.js, React e MUI.

> **Isto é uma demonstração.** Não é o site oficial da barbearia. As marcações
> ficam guardadas apenas no navegador de quem visita e não chegam à loja.

## Páginas

| Rota | O que é |
|---|---|
| `/` | Início — a casa, a carta com preços, a equipa, o salão, contactos |
| `/marcar` | Assistente de marcações em quatro passos |
| `/painel` | Painel interno com a agenda dos barbeiros (código `1997`) |

## O que tem

- **Marcações funcionais**: serviço → barbeiro → dia e hora → dados.
- **Faixa de acção fixa**, amarela, ao fundo do ecrã: sobe assim que há uma
  escolha, para não ser preciso rolar até ao fim para continuar.
- **Marcar a partir de um serviço**: cada linha da carta liga a
  `/marcar?servico=<id>`, que abre já com o serviço escolhido.
- **Guardar no calendário**: ficheiro `.ics` ou ligação para o Google Agenda.
- **Painel**: agenda por dia, filtro por barbeiro, resumo de ocupação e receita,
  e estados (agendada / concluída / faltou).
- **Menu em cartão** no telemóvel, ao centro do ecrã.

## Arranque

```bash
npm install
npm run dev      # http://localhost:3000
```

## Como as marcações funcionam

O motor está em [`lib/marcacoes.ts`](lib/marcacoes.ts) e é a única porta de
acesso aos dados — nem o assistente nem o painel falam com o `localStorage`
directamente. Não tem uma linha de DOM nem de React: é lógica pura, e por isso
testável sem browser.

| Regra | Comportamento |
|---|---|
| Horário | Seg–Sáb 10:00–20:00. Domingo não gera horas. |
| Duração | A marcação tem de caber antes do fecho. Madeixas (165 min) só até às 17:15. |
| Sobreposição | Um barbeiro não pode ter duas marcações que se cruzem. |
| Sem preferência | Só oferece a hora se houver alguém livre; atribui ao confirmar. |
| Antecedência | Mínimo 30 minutos, máximo 60 dias. |
| Corrida | O slot é revalidado ao gravar; se foi ocupado entretanto, recusa. |

O calendário é o `DateCalendar` do MUI X, ligado a estas regras por
`shouldDisableDate`: o componente trata da mecânica e da acessibilidade, as
regras da casa continuam a mandar. As horas ocupadas aparecem riscadas em vez de
escondidas — é mais informativo do que fazer sumir metade da grelha.

### O que esta demonstração não faz

Não há servidor. As marcações vivem no `localStorage` do navegador de quem as
faz, por isso **um barbeiro que abra o painel no telemóvel dele não vê o que um
cliente marcou noutro dispositivo**. O painel tem um botão para carregar uma
agenda de exemplo, de modo a poder ser mostrado preenchido.

Pela mesma razão, o código de acesso ao painel (`1997`) está no código-fonte e
não é segurança — separa o painel do site público, nada mais.

## Testes

```bash
npm test           # 58 testes: motor de marcações e contraste da paleta
npm run test:e2e   # 39 testes × 2 motores (Chromium e WebKit/iPhone)
```

O `e2e` cobre o percurso completo de marcação, a ligação directa por serviço, a
faixa de acção, os grupos colapsáveis, o `.ics`, o painel com estados e filtros,
o menu em cartão — e, em **sete resoluções dos 375px aos 2560px**, verifica que
nada transborda e que **nenhum texto desce abaixo de 12px**. Esta última parte
existe porque a versão anterior tinha rótulos a 8.6px, ilegíveis no telemóvel.

Corre em **dois motores**: Chromium e WebKit em viewport de iPhone. O WebKit é o
motor do Safari, e foi lá que apareceram problemas que os testes só em Chromium
não apanhavam — cabeçalho translúcido a deixar ler o que passava por baixo,
cartões altos demais, selos cortados. Há um bloco de testes dedicado a isso.

Outro bloco trava a escala no telemóvel: a página inicial não pode passar de
10 500 px, nenhuma fotografia pode passar de 320 px de altura e nenhum botão pode
ficar abaixo dos 44 px de alvo de toque. A página chegou a ter 11 601 px — quase
14 ecrãs de scroll — porque cada fotografia ocupava 467 px numa coluna só.

## Estrutura

```
app/
  layout.tsx     providers, tema, cabeçalho, rodapé
  page.tsx       marcar/page.tsx   painel/page.tsx
  tema.ts        createTheme: MUI vestido à casa
  design.ts      fontes (next/font) + reexporta a paleta
components/      Cabecalho, Rodape e as peças de cada página
lib/
  dados.ts       serviços, preços, barbeiros, horário — e os tipos
  marcacoes.ts   motor: disponibilidade, conflitos, estados, ICS
  cores.ts       paleta, sem dependências (usada também nos testes)
  useMarcacoes.ts  ponte para o React, trata da hidratação
public/img/      fotografias e emblema da casa
testes/
```

## Sobre os dados

Serviços, preços, durações, barbeiros, horário, morada e telefone foram
recolhidos do perfil público da barbearia no Noona. As fotografias e o emblema
são da casa. Os textos descritivos foram escritos para a demonstração e ainda
não estão confirmados com a barbearia.

## Desenho

Verde-garrafa `#0d2a1f` de base com amarelo-açafrão `#f2b705` em acento — verde
e amarelo brasileiros, com o amarelo a pontuar em vez de dominar.
[Oswald](https://fonts.google.com/specimen/Oswald) condensada nos títulos, à
maneira dos letreiros de barbearia, e
[Figtree](https://fonts.google.com/specimen/Figtree) no texto corrido, ambas
carregadas com `next/font`.

O tema em `app/tema.ts` desfaz o aspecto Material de origem: botões em pill sem
elevação, cantos arredondados em todo o lado, e uma escala tipográfica com
mínimo de 12px. As fotografias ficam com a cor original — só o fundo do hero é
escurecido por uma cunha em diagonal, o suficiente para o título se ler por
cima. Todas as combinações de cor são verificadas contra o WCAG em
`testes/contraste.test.ts`.
