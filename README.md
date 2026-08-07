# Barbearia Garcia & Tatuagem — site de demonstração

Site demo para a [Barbearia Garcia & Tatuagem](https://noona.pt/barbeariagarcia),
em Moreira, Maia. Estático, sem build, sem dependências em produção.

> **Isto é uma demonstração.** Não é o site oficial da barbearia. As marcações
> ficam guardadas apenas no navegador de quem visita e não chegam à loja.

## O que tem

- **Marcações funcionais** em quatro passos: serviço → barbeiro → dia e hora → dados.
- Catálogo com os **19 serviços reais** e os preços praticados (4 € a 30 €).
- Os **três barbeiros** da casa, com agendas independentes.
- Calendário que respeita o horário real: segunda a sábado, 10:00–20:00, domingo encerrado.

## Como as marcações funcionam

O motor está em [`assets/js/marcacoes.js`](assets/js/marcacoes.js) e aplica estas regras:

| Regra | Comportamento |
|---|---|
| Horário | Seg–Sáb 10:00–20:00. Domingo não gera horas. |
| Duração | A marcação tem de caber inteira antes do fecho. Madeixas (165 min) só até às 17:15. |
| Sobreposição | Um barbeiro não pode ter duas marcações que se cruzem. |
| Sem preferência | Só oferece a hora se houver pelo menos um barbeiro livre; atribui um no momento de confirmar. |
| Antecedência | Mínimo 30 minutos, máximo 60 dias. |
| Corrida | O slot é revalidado ao gravar; se entretanto foi ocupado, recusa e devolve ao passo da hora. |

As horas ocupadas aparecem riscadas em vez de escondidas — é mais informativo
do que fazer desaparecer metade da grelha.

Os dados vivem em `localStorage`. Na primeira visita é gerada uma agenda de
exemplo (semente fixa, estável entre visitas) para o calendário não aparecer
vazio e para se ver o que acontece quando uma hora já está tomada.

## Correr localmente

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

Tem de ser servido por HTTP — os ficheiros usam módulos ES, que não carregam
via `file://`.

## Testes

```bash
node testes/marcacoes.test.mjs   # 37 testes do motor, sem dependências

# end-to-end (precisa de servidor na porta 8080 e de playwright instalado)
npm install playwright && npx playwright install chromium
node testes/e2e.mjs
```

## Estrutura

```
index.html
assets/
  css/estilo.css       sistema visual: paleta, tipografia, secções
  css/marcacoes.css    assistente de marcações
  js/dados.js          fonte única: serviços, preços, barbeiros, horário
  js/marcacoes.js      motor: disponibilidade, conflitos, persistência
  js/site.js           interface e render
  img/                 fotografias e emblema da casa
testes/
```

## Sobre os dados

Serviços, preços, durações, barbeiros, horário, morada e telefone foram
recolhidos do perfil público da barbearia no Noona. As fotografias e o emblema
são da casa. Os textos descritivos foram escritos para a demonstração.

## Desenho

A paleta sai do próprio emblema: dourado `#c9a24a`, preto e creme.
Tipografia [Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda) para
títulos (a didone do letreiro) e [Jost](https://fonts.google.com/specimen/Jost)
para texto corrido. As fotografias levam tratamento a preto e branco com um
toque de sépia para uniformizar material vindo de telemóveis diferentes.
