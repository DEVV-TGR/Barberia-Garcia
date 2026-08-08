"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Envolve from "./Envolve";
import { cores, tituloFonte } from "@/app/design";

const PAGINAS = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Serviços", href: "/#servicos" },
  { rotulo: "Equipa", href: "/#equipa" },
  { rotulo: "Visitar", href: "/#visitar" }
];

function Marca() {
  return (
    <Box
      component={Link}
      href="/"
      sx={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 0.3 }}
    >
      <Typography component="span" sx={{
        fontFamily: tituloFonte.style.fontFamily, fontWeight: 600, fontSize: "1.3rem",
        textTransform: "uppercase", lineHeight: 1
      }}>
        Barbearia Garcia
      </Typography>
      <Typography component="span" variant="caption" sx={{
        color: "primary.main", fontWeight: 700, letterSpacing: "0.28em", fontSize: 12, lineHeight: 1
      }}>
        Desde 1997
      </Typography>
    </Box>
  );
}

export default function Cabecalho() {
  const [rolado, setRolado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const tema = useTheme();
  const largo = useMediaQuery(tema.breakpoints.up("md"));
  const caminho = usePathname();

  useEffect(() => {
    const aoRolar = () => setRolado(window.scrollY > 50);
    aoRolar();
    addEventListener("scroll", aoRolar, { passive: true });
    return () => removeEventListener("scroll", aoRolar);
  }, []);

  // Ao passar para ecrã largo o cartão deixa de fazer sentido
  useEffect(() => { if (largo) setAberto(false); }, [largo]);

  const actual = (href: string) => href === "/" ? caminho === "/" : caminho.startsWith(href.replace("/#", "/"));

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          // Opaco a sério quando rolado. Antes era 92 % com backdrop-filter, e
          // o Safari no iOS não aplica o desfoque de forma fiável num AppBar
          // fixo: o que passava por baixo lia-se através do cabeçalho.
          bgcolor: rolado ? cores.fundo : "transparent",
          boxShadow: rolado ? `0 1px 0 ${cores.fundo3}` : "none",
          transition: "background 420ms, box-shadow 420ms, padding 420ms",
          py: rolado ? 0.5 : 1.2,
          backgroundImage: "none"
        }}
      >
        <Envolve>
          <Toolbar disableGutters sx={{ justifyContent: "space-between", gap: 2, minHeight: "auto !important" }}>
            <Marca />

            {largo ? (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                {PAGINAS.map((p) => (
                  <Button
                    key={p.href}
                    component={Link}
                    href={p.href}
                    sx={{
                      color: actual(p.href) ? "primary.main" : "text.secondary",
                      fontSize: 14, px: 2, py: 1,
                      "&:hover": { color: "text.primary", bgcolor: cores.fundo3, transform: "none" }
                    }}
                  >
                    {p.rotulo}
                  </Button>
                ))}
                <Button component={Link} href="/marcar" variant="contained" size="small" sx={{ ml: 1 }}>
                  Marcar vez
                </Button>
              </Stack>
            ) : (
              <IconButton
                onClick={() => setAberto(true)}
                aria-label="Abrir menu"
                aria-expanded={aberto}
                sx={{ color: "text.primary", width: 44, height: 44 }}
              >
                <Box sx={{ display: "grid", gap: "5px" }}>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} sx={{ width: 22, height: 2, bgcolor: "currentColor", borderRadius: 1 }} />
                  ))}
                </Box>
              </IconButton>
            )}
          </Toolbar>
        </Envolve>
      </AppBar>

      {/* Menu em cartão: o Dialog do MUI já traz o foco preso, o Escape e o
          bloqueio do scroll — não é preciso reimplementar nada disso. */}
      <Dialog
        open={aberto && !largo}
        onClose={() => setAberto(false)}
        aria-label="Navegação"
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(6, 21, 15, 0.72)", backdropFilter: "blur(3px)" } },
          paper: {
            sx: {
              bgcolor: "primary.main",
              border: "none",
              borderRadius: "25px",
              width: "min(88vw, 22rem)",
              m: 0,
              p: 2.2,
              boxShadow: "0 32px 70px -18px rgba(0,0,0,0.7)"
            }
          }
        }}
      >
        <Stack spacing={0.5}>
          {PAGINAS.map((p) => (
            <Button
              key={p.href}
              component={Link}
              href={p.href}
              onClick={() => setAberto(false)}
              fullWidth
              sx={{
                color: cores.fundo,
                fontSize: 16, py: 1.4,
                bgcolor: actual(p.href) ? "rgba(13,42,31,0.14)" : "transparent",
                "&:hover": { bgcolor: "rgba(13,42,31,0.1)", transform: "none" }
              }}
            >
              {p.rotulo}
            </Button>
          ))}
          <Button
            component={Link}
            href="/marcar"
            onClick={() => setAberto(false)}
            fullWidth
            sx={{
              mt: 1.2, py: 1.6,
              bgcolor: cores.fundo, color: "primary.main",
              "&:hover": { bgcolor: cores.fundo3, color: cores.acento2, transform: "none" }
            }}
          >
            Marcar vez
          </Button>
        </Stack>
      </Dialog>
    </>
  );
}
