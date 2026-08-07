"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import { cores } from "@/app/design";

export default function Entrada({ codigo, aoEntrar }: {
  codigo: string; aoEntrar: () => void;
}) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (valor.trim() !== codigo) {
      setErro("Código errado.");
      return;
    }
    setErro(null);
    aoEntrar();
  }

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "60svh" }}>
      <Paper sx={{ maxWidth: "30rem", width: "100%", p: { xs: 3, md: 4 }, borderRadius: "22px" }}>
        <Sobrescrita>Reservado à casa</Sobrescrita>
        <TituloSeccao destaque="barbearia" component="h1">Painel da</TituloSeccao>
        <Typography color="text.secondary">
          Introduza o código de acesso para ver a agenda.
        </Typography>

        <Stack component="form" onSubmit={submeter} spacing={2.5} sx={{ mt: 3 }}>
          <TextField
            label="Código" type="password" required
            value={valor}
            onChange={(e) => { setValor(e.target.value); setErro(null); }}
            error={Boolean(erro)}
            helperText={erro ?? " "}
            slotProps={{
              htmlInput: {
                inputMode: "numeric", autoComplete: "off", maxLength: 8,
                "data-campo": "pin",
                style: { letterSpacing: "0.4em", textAlign: "center", fontSize: "1.2rem" }
              }
            }}
            placeholder="••••"
          />
          <Button type="submit" variant="contained" size="large">Entrar</Button>
        </Stack>

        <Alert
          severity="info" icon={false}
          sx={{
            mt: 3, borderRadius: "14px",
            border: `1px solid ${cores.acento3}`, bgcolor: "rgba(242,183,5,0.06)",
            color: "text.secondary", fontSize: 14
          }}
        >
          <strong style={{ color: cores.acento }}>Demonstração.</strong> O código é{" "}
          <Box component="code" sx={{
            bgcolor: cores.fundo3, borderRadius: "5px", px: 0.6, color: "primary.main"
          }}>{codigo}</Box>{" "}
          e está escrito no código-fonte — não é segurança a sério, é encenação
          para se ver o painel. Num sistema verdadeiro isto seria validado num
          servidor.
        </Alert>
      </Paper>
    </Box>
  );
}
