"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Resumo from "./Resumo";
import type { Servico } from "@/lib/dados";

export interface CamposDados { nome: string; telemovel: string; notas: string; }
export interface ErrosDados { nome?: string | null; telemovel?: string | null; }

export default function PassoDados({
  campos, erros, aoMudar, servico, barbeiroId, data, inicio
}: {
  campos: CamposDados;
  erros: ErrosDados;
  aoMudar: (c: Partial<CamposDados>) => void;
  servico: Servico; barbeiroId: string; data: string; inicio: number;
}) {
  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", mb: 0.5 }}>
        Só falta saber quem é.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Guardamos isto apenas para o reconhecer à chegada.
      </Typography>

      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 3, md: 5 },
        alignItems: "start"
      }}>
        <Stack spacing={2.5}>
          <TextField
            label="Nome" required
            value={campos.nome}
            onChange={(e) => aoMudar({ nome: e.target.value })}
            error={Boolean(erros.nome)}
            helperText={erros.nome ?? " "}
            slotProps={{ htmlInput: { autoComplete: "name", "data-campo": "nome" } }}
            placeholder="Como se chama?"
          />
          <TextField
            label="Telemóvel" required type="tel"
            value={campos.telemovel}
            onChange={(e) => aoMudar({ telemovel: e.target.value })}
            error={Boolean(erros.telemovel)}
            helperText={erros.telemovel ?? " "}
            slotProps={{ htmlInput: { autoComplete: "tel", inputMode: "numeric", "data-campo": "telemovel" } }}
            placeholder="9XX XXX XXX"
          />
          <TextField
            label="Alguma observação" multiline minRows={3}
            value={campos.notas}
            onChange={(e) => aoMudar({ notas: e.target.value })}
            helperText="Opcional."
            placeholder="Por exemplo: máquina 2 nos lados, tesoura em cima."
          />
        </Stack>

        <Resumo servico={servico} barbeiroId={barbeiroId} data={data} inicio={inicio} />
      </Box>
    </Box>
  );
}
