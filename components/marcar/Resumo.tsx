"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import * as M from "@/lib/marcacoes";
import type { Servico } from "@/lib/dados";
import { euros } from "@/lib/formatar";
import { cores, tituloFonte } from "@/app/design";

function Linha({ rotulo, valor, total }: { rotulo: string; valor: React.ReactNode; total?: boolean }) {
  return (
    <Box sx={{
      display: "flex", justifyContent: "space-between", gap: 2, pb: 1.2,
      borderBottom: total ? "none" : `1px solid ${cores.fundo3}`
    }}>
      <Typography component="dt" variant="body2" sx={{ color: cores.texto3 }}>{rotulo}</Typography>
      <Box component="dd" sx={{ m: 0, textAlign: "right" }}>
        {total
          ? <Typography sx={{
              fontFamily: tituloFonte.style.fontFamily, fontSize: "1.4rem",
              fontWeight: 600, color: "primary.main"
            }}>{valor}</Typography>
          : <Typography variant="body2">{valor}</Typography>}
      </Box>
    </Box>
  );
}

export default function Resumo({ servico, barbeiroId, data, inicio, titulo = "Resumo" }: {
  servico: Servico; barbeiroId: string; data: string; inicio: number; titulo?: string;
}) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: "14px", bgcolor: "background.default" }}>
      <Typography variant="overline" component="h4" sx={{ color: "primary.main", display: "block", mb: 1.5 }}>
        {titulo}
      </Typography>
      <Box component="dl" sx={{ m: 0, display: "grid", gap: 1.2 }}>
        <Linha rotulo="Serviço" valor={servico.nome} />
        <Linha rotulo="Barbeiro" valor={M.nomeBarbeiro(barbeiroId)} />
        <Linha rotulo="Dia" valor={M.dataPorExtenso(data)} />
        <Linha rotulo="Hora" valor={`${M.paraHoras(inicio)} – ${M.paraHoras(inicio + servico.minutos)}`} />
        <Linha rotulo="A pagar no balcão" valor={euros(servico.preco)} total />
      </Box>
    </Paper>
  );
}
