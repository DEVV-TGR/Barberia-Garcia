"use client";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

const molduraEscolhida = (escolhido: boolean) => ({
  border: `1.5px solid ${escolhido ? cores.acento : cores.fundo3}`,
  bgcolor: escolhido ? "rgba(242,183,5,0.08)" : "background.default",
  borderRadius: "14px",
  transition: "border-color 200ms, background 200ms, transform 200ms",
  "&:hover": { borderColor: escolhido ? cores.acento : cores.fundo4, transform: "translateY(-2px)" }
});

function Cartao({ s, escolhido, aoEscolher }: {
  s: Servico; escolhido: boolean; aoEscolher: (id: string) => void;
}) {
  return (
    <ButtonBase
      onClick={() => aoEscolher(s.id)}
      aria-pressed={escolhido}
      data-servico={s.id}
      sx={{
        ...molduraEscolhida(escolhido),
        width: "100%", p: 2, textAlign: "left",
        display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 2
      }}
    >
      <Box>
        <Typography sx={{
          fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, fontSize: "1.08rem",
          textTransform: "uppercase", lineHeight: 1.15
        }}>
          {s.nome}
        </Typography>
        <Typography variant="overline" sx={{ color: cores.texto3, display: "block", mt: 0.3 }}>
          {duracao(s.minutos)}
        </Typography>
      </Box>
      <Typography sx={{
        fontFamily: tituloFonte.style.fontFamily, fontSize: s.preco ? "1.25rem" : "0.8rem",
        fontWeight: 600, color: s.preco ? "primary.main" : cores.texto3, whiteSpace: "nowrap"
      }}>
        {euros(s.preco)}
      </Typography>
    </ButtonBase>
  );
}

export default function PassoServico({ escolhido, aoEscolher }: {
  escolhido: string | null; aoEscolher: (id: string) => void;
}) {
  const destaques = SERVICOS.filter((s) => s.destaque);
  const grupos = [...new Set(SERVICOS.map((s) => s.grupo))];

  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", mb: 0.5 }}>
        O que vai ser?
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Escolha um serviço da carta.</Typography>

      {destaques.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: "primary.main", display: "block", mb: 1.5 }}>
            Os mais pedidos
          </Typography>
          {/* Atalhos, não opções à parte: escolhem a mesma entrada da carta */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: 1
          }}>
            {destaques.map((s) => (
              <ButtonBase
                key={s.id}
                onClick={() => aoEscolher(s.id)}
                aria-pressed={escolhido === s.id}
                data-atalho={s.id}
                sx={{
                  ...molduraEscolhida(escolhido === s.id),
                  p: 2, textAlign: "left", display: "grid", gap: 0.4,
                  justifyItems: "start", alignContent: "start", height: "100%"
                }}
              >
                <Chip label="Mais pedido" size="small" color="primary" sx={{ height: 22 }} />
                <Typography sx={{
                  fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, fontSize: "1.05rem",
                  textTransform: "uppercase", lineHeight: 1.15
                }}>
                  {s.nome}
                </Typography>
                <Typography variant="overline" sx={{ color: cores.texto3 }}>
                  {duracao(s.minutos)} · {euros(s.preco)}
                </Typography>
              </ButtonBase>
            ))}
          </Box>
        </Box>
      )}

      {grupos.map((g) => {
        const doGrupo = SERVICOS.filter((s) => s.grupo === g);
        return (
          <Accordion key={g} defaultExpanded data-grupo={g}>
            <AccordionSummary expandIcon={<Seta />} sx={{ px: 0 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: "100%", pr: 2 }}>
                <Typography variant="overline" sx={{ color: "primary.main" }}>{g}</Typography>
                <Chip label={doGrupo.length} size="small" color="primary" />
                <Box sx={{ flex: 1, height: "1px", bgcolor: cores.fundo3 }} />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
              <Stack spacing={0.8}>
                {doGrupo.map((s) => (
                  <Cartao key={s.id} s={s} escolhido={escolhido === s.id} aoEscolher={aoEscolher} />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
