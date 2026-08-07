"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ResumoDia as Resumo } from "@/lib/marcacoes";
import { cores, tituloFonte } from "@/app/design";

function Celula({ rotulo, valor, sufixo }: { rotulo: string; valor: React.ReactNode; sufixo?: string }) {
  return (
    <Box sx={{ bgcolor: "background.paper", p: 2.2 }}>
      <Typography component="dt" variant="overline" sx={{ color: cores.texto3, display: "block", mb: 0.5 }}>
        {rotulo}
      </Typography>
      <Typography component="dd" sx={{
        m: 0, fontFamily: tituloFonte.style.fontFamily, fontSize: "1.7rem",
        fontWeight: 600, color: "primary.main", lineHeight: 1
      }}>
        {valor}
        {sufixo && (
          <Box component="small" sx={{
            fontFamily: "inherit", fontSize: 13, color: "text.secondary", fontWeight: 400, ml: 0.5
          }}>
            {sufixo}
          </Box>
        )}
      </Typography>
    </Box>
  );
}

export default function ResumoDia({ resumo }: { resumo: Resumo }) {
  return (
    <Box component="dl" sx={{
      display: "grid",
      gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
      gap: "1px", bgcolor: cores.fundo3,
      border: `1px solid ${cores.fundo3}`, borderRadius: "14px",
      overflow: "hidden", m: 0, mb: 3
    }}>
      <Celula rotulo="Marcações" valor={resumo.total} />
      <Celula rotulo="Ocupação" valor={Math.floor(resumo.minutos / 60)} sufixo={`h ${resumo.minutos % 60} min`} />
      <Celula rotulo="Receita prevista" valor={resumo.receita} sufixo="€" />
      <Celula rotulo="Concluídas" valor={resumo.concluidas} sufixo={`de ${resumo.total}`} />
    </Box>
  );
}
