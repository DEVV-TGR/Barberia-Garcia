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

/**
 * Em ecrã largo é uma linha só. Em ecrã estreito são duas — nome em cima,
 * duração, preço e botão lado a lado em baixo — para não sobrar espaço morto
 * nem deixar o botão sozinho numa terceira linha.
 */
function Linha({ s }: { s: Servico }) {
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
        transition: "border-color 200ms, transform 200ms",
        "&:hover": { borderColor: cores.fundo4, transform: { md: "translateX(4px)" } },
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
