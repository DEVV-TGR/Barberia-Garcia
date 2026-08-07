"use client";

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

function Seta() {
  return (
    <Box component="svg" viewBox="0 0 24 24" width={18} height={18} fill="none"
      stroke="currentColor" strokeWidth={2.5} aria-hidden sx={{ color: "primary.main" }}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </Box>
  );
}

function Linha({ s }: { s: Servico }) {
  return (
    <Box
      component="li"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr auto", sm: "1fr auto auto auto" },
        alignItems: "center",
        columnGap: 2.5, rowGap: 0.8,
        p: 2, bgcolor: "background.default",
        border: "1px solid transparent", borderRadius: "14px",
        transition: "border-color 200ms, transform 200ms",
        "&:hover": { borderColor: cores.fundo4, transform: "translateX(4px)" }
      }}
    >
      <Typography sx={{
        fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, fontSize: "1.15rem",
        textTransform: "uppercase", gridColumn: { xs: "1 / -1", sm: "auto" }
      }}>
        {s.nome}
      </Typography>

      <Typography variant="overline" sx={{ color: cores.texto3, whiteSpace: "nowrap" }}>
        {duracao(s.minutos)}
      </Typography>

      <Typography sx={{
        fontFamily: tituloFonte.style.fontFamily, fontSize: s.preco ? "1.4rem" : "0.85rem",
        fontWeight: 600, color: s.preco ? "primary.main" : cores.texto3,
        whiteSpace: "nowrap", textAlign: "right", minWidth: "3.4rem",
        textTransform: s.preco ? "none" : "uppercase"
      }}>
        {euros(s.preco)}
      </Typography>

      <BotaoLink
        href={`/marcar?servico=${encodeURIComponent(s.id)}`}
        variant="outlined"
        size="small"
        aria-label={`Marcar ${s.nome}`}
        sx={{ justifySelf: "end" }}
      >
        Marcar
      </BotaoLink>
    </Box>
  );
}

export default function Carta() {
  const grupos = [...new Set(SERVICOS.map((s) => s.grupo))];

  return (
    <Box component="section" id="servicos" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
      <Envolve>
        <Sobrescrita>A Carta</Sobrescrita>
        <TituloSeccao destaque="& preços">Serviços</TituloSeccao>
        <Typography color="text.secondary" sx={{ maxWidth: "56ch", mb: 5 }}>
          Clique em marcar e vai direito ao passo seguinte, já com o serviço escolhido.
        </Typography>

        {grupos.map((g) => {
          const doGrupo = SERVICOS.filter((s) => s.grupo === g);
          return (
            <Accordion key={g} defaultExpanded sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<Seta />} sx={{ px: 0 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: "100%", pr: 2 }}>
                  <Typography variant="overline" sx={{ color: "primary.main" }}>{g}</Typography>
                  <Chip label={doGrupo.length} size="small" color="primary" />
                  <Box sx={{ flex: 1, height: "1px", bgcolor: cores.fundo3 }} />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Stack component="ul" spacing={0.8} sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {doGrupo.map((s) => <Linha key={s.id} s={s} />)}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Envolve>
    </Box>
  );
}
