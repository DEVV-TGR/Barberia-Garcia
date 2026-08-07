"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Entrada from "./Entrada";
import Agenda from "./Agenda";
import { useMarcacoes } from "@/lib/useMarcacoes";
import { cores } from "@/app/design";

/* O código está no código-fonte: numa demonstração sem servidor não há forma
   de o esconder. Serve para separar o painel do site público, não para
   proteger dados. */
const CODIGO = "1997";
const CHAVE_SESSAO = "barbearia-garcia:painel:v1";

export default function Painel() {
  const { pronto } = useMarcacoes();
  const [dentro, setDentro] = useState(false);
  const [verificado, setVerificado] = useState(false);

  // A sessão sobrevive ao recarregar, mas não ao fechar o separador
  useEffect(() => {
    try { setDentro(sessionStorage.getItem(CHAVE_SESSAO) === "1"); }
    catch { /* ignorado */ }
    setVerificado(true);
  }, []);

  const entrar = () => {
    try { sessionStorage.setItem(CHAVE_SESSAO, "1"); } catch { /* ignorado */ }
    setDentro(true);
  };

  const sair = () => {
    try { sessionStorage.removeItem(CHAVE_SESSAO); } catch { /* ignorado */ }
    setDentro(false);
  };

  return (
    <Box sx={{
      pt: { xs: 12, md: 16 }, pb: 8, minHeight: "100svh",
      background: `radial-gradient(ellipse at 50% 0%, rgba(242,183,5,0.05), transparent 50%), ${cores.fundo}`
    }}>
      {!verificado || !pronto ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 8 }}>
          A carregar…
        </Typography>
      ) : dentro ? (
        <Agenda aoSair={sair} />
      ) : (
        <Box sx={{ px: 2.5 }}>
          <Entrada codigo={CODIGO} aoEntrar={entrar} />
        </Box>
      )}
    </Box>
  );
}
