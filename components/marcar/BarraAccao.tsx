"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { cores, tituloFonte } from "@/app/design";

/**
 * Faixa fixa ao fundo do ecrã, amarela por inteiro. Sobe assim que há uma
 * escolha, para não ser preciso rolar até ao fim do painel para continuar.
 * Sobre amarelo, todo o texto passa a verde escuro.
 */
export default function BarraAccao({
  titulo, detalhe, podeAvancar, rotulo, aoAvancar, aoVoltar, mostrarVoltar
}: {
  titulo: string;
  detalhe: React.ReactNode;
  podeAvancar: boolean;
  rotulo: string;
  aoAvancar: () => void;
  aoVoltar: () => void;
  mostrarVoltar: boolean;
}) {
  return (
    <Box
      data-testid="barra-accao"
      sx={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 80,
        bgcolor: "primary.main",
        px: { xs: 2, md: 3 },
        pt: 1.6,
        pb: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        boxShadow: "0 -14px 34px -18px rgba(0,0,0,0.85)",
        animation: "subir 320ms cubic-bezier(0.22,1,0.36,1)",
        "@keyframes subir": {
          from: { transform: "translateY(100%)", opacity: 0 },
          to: { transform: "none", opacity: 1 }
        }
      }}
    >
      <Box sx={{
        width: "min(100%, 1180px)", mx: "auto",
        display: "flex", alignItems: "center", gap: 2
      }}>
        {mostrarVoltar && (
          <IconButton
            onClick={aoVoltar}
            aria-label="Voltar atrás"
            sx={{
              flex: "none", width: 46, height: 46,
              border: "2px solid rgba(13,42,31,0.35)", color: cores.fundo,
              "&:hover": { borderColor: cores.fundo, bgcolor: "rgba(13,42,31,0.1)" }
            }}
          >
            <Box component="svg" viewBox="0 0 24 24" width={20} height={20} fill="none"
              stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </Box>
          </IconButton>
        )}

        <Box sx={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
          <Typography sx={{
            fontFamily: tituloFonte.style.fontFamily, fontWeight: 600, fontSize: "1.05rem",
            color: cores.fundo, textTransform: "uppercase",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {titulo}
          </Typography>
          <Typography sx={{
            fontSize: 13, color: "rgba(13,42,31,0.72)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {detalhe}
          </Typography>
        </Box>

        <Button
          onClick={aoAvancar}
          disabled={!podeAvancar}
          sx={{
            flex: "none",
            bgcolor: cores.fundo, color: "primary.main",
            "&:hover": { bgcolor: cores.fundo3, color: cores.acento2 },
            "&.Mui-disabled": { bgcolor: "rgba(13,42,31,0.18)", color: "rgba(13,42,31,0.55)" }
          }}
        >
          {rotulo}
        </Button>
      </Box>
    </Box>
  );
}
