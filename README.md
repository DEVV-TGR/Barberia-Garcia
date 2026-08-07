# Barbearia Garcia & Tatuagem — site de demonstração

Site demo para a [Barbearia Garcia & Tatuagem](https://noona.pt/barbeariagarcia),
em Moreira, Maia. Estático, sem build, sem dependências em produção.

> **Isto é uma demonstração.** Não é o site oficial da barbearia. As marcações
> ficam guardadas apenas no navegador de quem visita e não chegam à loja.

## Páginas

| Página | O que é |
|---|---|
| `index.html` | Início — a casa, a carta com preços, a equipa, o salão, contactos |
| `marcar.html` | Assistente de marcações em quatro passos |
| `painel.html` | Painel interno com a agenda dos barbeiros (código `1997`) |

## O que tem

- **Marcações funcionais**: serviço → barbeiro → dia e hora → dados.
- **Barra de acção fixa**: assim que há uma escolha, sobe uma barra com o
  resumo e o botão de avançar. Não é preciso rolar até ao fim para continuar.
- **Marcar a partir de um serviço**: cada linha da carta liga a
  `marcar.html?servico=<id>`, que abre já com o serviço escolhido.
- **Guardar no calendário**: ficheiro `.ics` ou ligação para o Google Agenda.
- **Grupos colapsáveis**: a barbearia tem 18 serviços — fecha-se para chegar
  depressa à tatuagem.
- **Painel**: agenda por dia, filtro por barbeiro, resumo de ocupação e receita,
  e estados (agendada / concluída / faltou).
- Os 19 serviços reais com os preços praticados, os três barbeiros e o horário
  da casa.

## Como as marcações funcionam

O motor está em [`assets/js/marcacoes.js`](assets/js/marcacoes.js) e é a única
porta de acesso aos dados — nem o assistente nem o painel falam com o
`localStorage` directamente.

| Regra | Comportamento |
|---|---|
| Horário | Seg–Sáb 10:00–20:00. Domingo não gera horas. |
| Duração | A marcação tem de caber antes do fecho. Madeixas (165 min) só até às 17:15. |
| Sobreposição | Um barbeiro não pode ter duas marcações que se cruzem. |
| Sem preferência | Só oferece a hora se houver alguém livre; atribui ao confirmar. |
| Antecedência | Mínimo 30 minutos, máximo 60 dias. |
| Corrida | O slot é revalidado ao gravar; se foi ocupado entretanto, recusa. |

As horas ocupadas aparecem riscadas em vez de escondidas — é mais informativo
do que fazer desaparecer metade da grelha.

Na primeira visita é gerada uma agenda de exemplo (semente fixa, estável entre
visitas) para o calendário não aparecer vazio.

### O que esta demonstração não faz

Não há servidor. As marcações vivem no `localStorage` do navegador de quem as
faz, por isso **um barbeiro que abra o painel no telemóvel dele não vê o que um
cliente marcou noutro dispositivo**. O painel tem um botão para carregar uma
agenda de exemplo, de modo a poder ser mostrado preenchido.

Pela mesma razão, o código de acesso ao painel (`1997`) está no código-fonte e
não é segurança — separa o painel do site público, nada mais. Num sistema a
sério isto seria validado num servidor.

## Correr localmente

```bash
npm start          # python3 -m http.server 8080
# abrir http://localhost:8080
```

Tem de ser servido por HTTP — os ficheiros usam módulos ES, que não carregam
via `file://`.

## Testes

```bash
npm test           # 69 testes do motor + contraste da paleta, sem dependências

# end-to-end: precisa do servidor a correr e de playwright
npm install playwright && npx playwright install chromium
npm run test:e2e   # 92 verificações nas três páginas
```

O `e2e` cobre navegação, ligação directa por serviço, a barra de acção, os
grupos colapsáveis, o menu em cartão no telemóvel (foco, teclado, fecho), o fluxo
completo de marcação, o ficheiro `.ics`, o painel com estados e filtros, o
comportamento a 390px e a ausência de texto invisível ou erros na consola.

## Estrutura

```
index.html  marcar.html  painel.html
assets/
  css/base.css     tokens, tipografia, botões, navegação, rodapé
  css/inicio.css   secções da página inicial
  css/marcar.css   assistente e barra de acção
  css/painel.css   agenda do painel
  js/dados.js      fonte única: serviços, preços, barbeiros, horário
  js/marcacoes.js  motor: disponibilidade, conflitos, estados, ICS
  js/nucleo.js     utilidades partilhadas
  js/inicio.js  js/marcar.js  js/painel.js
  img/             fotografias e emblema da casa
testes/
```

## Sobre os dados

Serviços, preços, durações, barbeiros, horário, morada e telefone foram
recolhidos do perfil público da barbearia no Noona. As fotografias e o emblema
são da casa. Os textos descritivos foram escritos para a demonstração e ainda
não estão confirmados com a barbearia.

## Desenho

Verde-garrafa `#0d2a1f` de base com amarelo-açafrão `#f2b705` em acento — verde
e amarelo brasileiros, mas com o amarelo a pontuar em vez de dominar.
[Oswald](https://fonts.google.com/specimen/Oswald) condensada nos títulos, à
maneira dos letreiros de barbearia, e
[Figtree](https://fonts.google.com/specimen/Figtree) no texto corrido. Botões em
pill e cantos arredondados em todo o lado. As fotografias ficam com a cor
original — só o fundo do hero é escurecido, o suficiente para o título se ler por
cima. A galeria é um mosaico por colunas, porque as fotos da casa são umas em
paisagem e outras em retrato e uma grelha de altura fixa cortava-as a meio.

A barra de acção é uma faixa amarela: é o elemento que tem de saltar à vista, e
sobre amarelo todo o texto passa a verde escuro. No telemóvel a navegação abre
num cartão amarelo ao centro do ecrã, com véu por trás, foco preso lá dentro e
fecho por Escape ou toque fora. Todas as combinações de cor são
verificadas contra o WCAG em `testes/contraste.test.mjs`.
