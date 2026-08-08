"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Resumo from "./Resumo";
import * as M from "@/lib/marcacoes";
import { descarregar } from "@/lib/useMarcacoes";
import type { Marcacao, Servico } from "@/lib/dados";
import { cores } from "@/app/design";

export default function Confirmacao({ marcacao, servico, aoRecomecar }: {
  marcacao: Marcacao; servico: Servico; aoRecomecar: () => void;
}) {
  const primeiroNome = marcacao.nome.split(" ")[0];

  return (
    <Box sx={{ textAlign: "center", py: 2 }} data-testid="confirmacao">
      <Box sx={{
        width: 80, height: 80, mx: "auto", mb: 3,
        border: `2px solid ${cores.acento}`, borderRadius: "50%",
        display: "grid", placeItems: "center",
        animation: "selo 650ms cubic-bezier(0.22,1,0.36,1) both",
        "@keyframes selo": { from: { transform: "scale(0.6)", opacity: 0 }, to: { transform: "none", opacity: 1 } }
      }}>
        <Box component="svg" viewBox="0 0 24 24" width={30} height={30} fill="none"
          stroke={cores.acento} strokeWidth={2.5} aria-hidden>
          <path d="M4 12.5 9.5 18 20 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </Box>
      </Box>

      <Typography variant="h3" sx={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", mb: 1 }}>
        Está marcado.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {primeiroNome}, esperamos por si {M.dataPorExtenso(marcacao.data)} às{" "}
        {M.paraHoras(marcacao.inicio)}, com {M.nomeBarbeiro(marcacao.barbeiroId)}.
      </Typography>

      <Box sx={{ maxWidth: "26rem", mx: "auto", textAlign: "left" }}>
        <Resumo
          servico={servico} barbeiroId={marcacao.barbeiroId}
          data={marcacao.data} inicio={marcacao.inicio}
          titulo="A sua marcação"
        />
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}
        sx={{ justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={() => descarregar(
            `barbearia-garcia-${marcacao.data}-${M.paraHoras(marcacao.inicio).replace(":", "h")}.ics`,
            M.paraICS(marcacao, servico)
          )}
          startIcon={
            <Box component="svg" viewBox="0 0 24 24" width={17} height={17} fill="none"
              stroke="currentColor" strokeWidth={2} aria-hidden>
              <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 11h18" />
            </Box>
          }
        >
          Guardar no calendário
        </Button>
        <Button
          variant="outlined"
          href={M.ligacaoGoogleAgenda(marcacao, servico)}
          target="_blank" rel="noopener"
          data-testid="google-agenda"
        >
          Google Agenda
        </Button>
      </Stack>

      <Box sx={{ mt: 2.5 }}>
        <Button onClick={aoRecomecar} sx={{ color: "text.secondary" }}>Marcar outra vez</Button>
      </Box>
    </Box>
  );
}
