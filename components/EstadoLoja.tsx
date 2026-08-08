"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { estaAbertoAgora } from "@/lib/marcacoes";
import { cores } from "@/app/design";

/**
 * Depende da hora actual, que difere entre servidor e cliente — por isso só
 * aparece depois de montar, evitando o aviso de hidratação.
 */
export default function EstadoLoja() {
  const [estado, setEstado] = useState<{ aberto: boolean; motivo: string } | null>(null);

  useEffect(() => {
    const ver = () => setEstado(estaAbertoAgora());
    ver();
    const t = setInterval(ver, 60_000);
    return () => clearInterval(t);
  }, []);

  if (!estado) return null;

  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.8, mt: 2,
      px: 1.6, py: 0.7, borderRadius: 999, fontSize: 13, fontWeight: 600,
      letterSpacing: "0.1em", textTransform: "uppercase",
      border: `1px solid ${estado.aberto ? cores.acento3 : cores.fundo4}`,
      color: estado.aberto ? "primary.main" : cores.texto3
    }}>
      <Box sx={{
        width: 8, height: 8, borderRadius: "50%",
        bgcolor: estado.aberto ? cores.ok : cores.texto3,
        animation: estado.aberto ? "pulsar 2.4s infinite" : "none",
        "@keyframes pulsar": {
          "0%":   { boxShadow: "0 0 0 0 rgba(134,217,154,0.7)" },
          "70%":  { boxShadow: "0 0 0 8px rgba(134,217,154,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(134,217,154,0)" }
        }
      }} />
      {estado.aberto ? estado.motivo : `Fechado · ${estado.motivo}`}
    </Box>
  );
}
