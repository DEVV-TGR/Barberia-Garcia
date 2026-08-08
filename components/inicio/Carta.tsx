"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import BotaoLink from "../BotaoLink";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import { SERVICOS, type Servico } from "@/lib/dados";
import { euros, duracao } from "@/lib/formatar";
import { cores, tituloFonte } from "@/app/design";
import { CURVA, TEMPO, escada, tempoPainel } from "@/lib/movimento";

/** Os grupos não mudam entre renders: calculados uma vez, fora do componente. */
const GRUPOS = [...new Set(SERVICOS.map((s) => s.grupo))];

function Seta() {
  return (
    <Box component="svg" viewBox="0 0 24 24" width={18} height={18} fill="none"
      stroke="currentColor" strokeWidth={2.5} aria-hidden sx={{ color: "primary.main" }}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
}

/**
 * Em ecrã largo é uma linha só. Em ecrã estreito são duas — nome em cima,
 * duração, preço e botão lado a lado em baixo — para não sobrar espaço morto
 * nem deixar o botão sozinho numa terceira linha.
 */
function Linha({ s, aberto, ordem }: { s: Servico; aberto: boolean; ordem: number }) {
  const preco = (
    <Typography sx={{
      fontFamily: tituloFonte.style.fontFamily, fontSize: s.preco ? "1.4rem" : "0.85rem",
      fontWeight: 600, color: s.preco ? "primary.main" : cores.texto3,
      whiteSpace: "nowrap", lineHeight: 1,
      textTransform: s.preco ? "none" : "uppercase"
    }}>
      {euros(s.preco)}
    </Typography>
  );

  return (
    <Box
      component="li"
      data-servico-linha
      sx={{
        p: 2, bgcolor: "background.default",
        border: "1px solid transparent", borderRadius: "14px",

        /* A abrir, as linhas sobem em escada, atrás do painel a crescer; a
           fechar caem todas ao mesmo tempo e depressa, senão a última ainda se
           via depois de o painel já ter encolhido. */
        opacity: aberto ? 1 : 0,
        transform: aberto ? "none" : "translate3d(0, 10px, 0)",
        transition: [
          `opacity ${aberto ? TEMPO.medio : TEMPO.micro}ms ${CURVA.entrada} ${aberto ? escada(ordem, 26, 10) : "0ms"}`,
          `transform ${aberto ? TEMPO.medio : TEMPO.micro}ms ${CURVA.entrada} ${aberto ? escada(ordem, 26, 10) : "0ms"}`,
          `border-color ${TEMPO.curto}ms ${CURVA.suave}`,
          `background-color ${TEMPO.curto}ms ${CURVA.suave}`
        ].join(", "),

        "&:hover": {
          borderColor: cores.fundo4,
          transform: { md: "translate3d(4px, 0, 0)" }
        },
        display: "grid",
        gap: 1.2,
        gridTemplateColumns: { xs: "1fr", md: "1fr auto auto auto" },
        alignItems: { md: "center" },
        columnGap: { md: 2.5 }
      }}
    >
      <Typography sx={{
        fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, fontSize: "1.15rem",
        textTransform: "uppercase", lineHeight: 1.15
      }}>
        {s.nome}
      </Typography>

      {/* Segunda linha em telemóvel; em ecrã largo dissolve-se na grelha */}
      <Box sx={{
        display: { xs: "flex", md: "contents" },
        alignItems: "center", justifyContent: "space-between", gap: 1.5
      }}>
        <Typography variant="overline" sx={{ color: cores.texto3, whiteSpace: "nowrap" }}>
          {duracao(s.minutos)}
        </Typography>

        <Box sx={{ display: { xs: "flex", md: "contents" }, alignItems: "center", gap: 2 }}>
          {preco}
          <BotaoLink
            href={`/marcar?servico=${encodeURIComponent(s.id)}`}
            variant="outlined"
            size="small"
            aria-label={`Marcar ${s.nome}`}
          >
            Marcar
          </BotaoLink>
        </Box>
      </Box>
    </Box>
  );
}

export default function Carta() {
  /* Controlado, e não `defaultExpanded`, porque as linhas precisam de saber se
     o grupo está aberto para entrarem em escada. Guardam-se os fechados: assim
     a carta abre inteira, que é como se lê melhor. */
  const [fechados, setFechados] = useState<readonly string[]>([]);

  const alternar = (grupo: string) => (_e: React.SyntheticEvent, aAbrir: boolean) =>
    setFechados((anteriores) =>
      aAbrir ? anteriores.filter((g) => g !== grupo) : [...anteriores, grupo]
    );

  return (
    <Box component="section" id="servicos" sx={{ py: { xs: 6, md: 12 }, bgcolor: "background.paper" }}>
      <Envolve>
        <Sobrescrita>A Carta</Sobrescrita>
        <TituloSeccao destaque="& preços">Serviços</TituloSeccao>
        <Typography color="text.secondary" sx={{ maxWidth: "56ch", mb: 5 }}>
          Clique em marcar e vai direito ao passo seguinte, já com o serviço escolhido.
        </Typography>

        {GRUPOS.map((g) => {
          const doGrupo = SERVICOS.filter((s) => s.grupo === g);
          const aberto = !fechados.includes(g);

          return (
            <Accordion
              key={g}
              expanded={aberto}
              onChange={alternar(g)}
              slotProps={{
                transition: {
                  timeout: tempoPainel(doGrupo.length),
                  unmountOnExit: false,
                  easing: { enter: CURVA.painel, exit: CURVA.dobrar }
                }
              }}
              sx={{ mb: 3 }}
            >
              <AccordionSummary expandIcon={<Seta />} sx={{ px: 0 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: "100%", pr: 2 }}>
                  <Typography variant="overline" sx={{ color: "primary.main" }}>{g}</Typography>
                  <Chip label={doGrupo.length} size="small" color="primary" />
                  {/* O traço recolhe-se para o lado do título quando o grupo
                      fecha — dá ao fecho um segundo sinal, além da seta. */}
                  <Box sx={{
                    flex: 1, height: "1px", bgcolor: cores.fundo3,
                    transformOrigin: "left",
                    transform: aberto ? "scaleX(1)" : "scaleX(0.35)",
                    opacity: aberto ? 1 : 0.5,
                    transition: `transform ${TEMPO.painel}ms ${CURVA.painel}, opacity ${TEMPO.painel}ms ${CURVA.painel}`
                  }} />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Stack component="ul" spacing={0.8} sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {doGrupo.map((s, i) => <Linha key={s.id} s={s} aberto={aberto} ordem={i} />)}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Envolve>
    </Box>
  );
}
