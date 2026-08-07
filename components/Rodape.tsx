"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Envolve from "./Envolve";
import EstadoLoja from "./EstadoLoja";
import { CASA } from "@/lib/dados";
import { cores, tituloFonte } from "@/app/design";

const ORDEM = [1, 2, 3, 4, 5, 6, 0]; // a semana começa à segunda, como num postal

function Coluna({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" component="h2" sx={{ color: "primary.main", display: "block", mb: 1.5 }}>
        {titulo}
      </Typography>
      {children}
    </Box>
  );
}

export default function Rodape() {
  const hoje = new Date().getDay();

  return (
    <Box component="footer" sx={{ borderTop: `1px solid ${cores.fundo3}`, bgcolor: "background.paper", pt: 6, pb: 4 }}>
      <Envolve>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 1fr" },
          gap: { xs: 4, md: 5 },
          mb: 5
        }}>
          <Box>
            <Typography component="p" sx={{
              fontFamily: tituloFonte.style.fontFamily, fontWeight: 600, fontSize: "1.3rem",
              textTransform: "uppercase", lineHeight: 1, mb: 0.4
            }}>
              Barbearia Garcia
            </Typography>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.28em" }}>
              Tradição e Qualidade
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {CASA.morada}<br />{CASA.codigoPostal} {CASA.localidade}
            </Typography>
            <Typography sx={{ mt: 2 }}>
              <Box component="a" href={`tel:${CASA.telefoneRaw}`}
                sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none" }}>
                914 230 669
              </Box>
            </Typography>
          </Box>

          <Coluna titulo="Horário">
            <Stack component="ul" spacing={0.6} sx={{ listStyle: "none", m: 0, p: 0 }}>
              {ORDEM.map((i) => {
                const h = CASA.horario[i];
                return (
                  <Box component="li" key={h.dia} sx={{
                    display: "flex", justifyContent: "space-between", gap: 2,
                    fontSize: 15,
                    color: i === hoje ? "primary.main" : "text.secondary",
                    fontWeight: i === hoje ? 600 : 400
                  }}>
                    <span>{h.dia}</span>
                    <span>{h.aberto ? `${h.abre}–${h.fecha}` : "Encerrado"}</span>
                  </Box>
                );
              })}
            </Stack>
            <EstadoLoja />
          </Coluna>

          <Coluna titulo="Navegar">
            <Stack component="ul" spacing={0.8} sx={{ listStyle: "none", m: 0, p: 0 }}>
              {[
                { r: "Início", h: "/" },
                { r: "Serviços e preços", h: "/#servicos" },
                { r: "A equipa", h: "/#equipa" },
                { r: "Marcar a minha vez", h: "/marcar" }
              ].map((l) => (
                <Box component="li" key={l.h} sx={{ fontSize: 15 }}>
                  <Box component={Link} href={l.h}
                    sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}>
                    {l.r}
                  </Box>
                </Box>
              ))}
              <Box component="li" sx={{ fontSize: 15 }}>
                <Box component="a" href={CASA.mapa} target="_blank" rel="noopener"
                  sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}>
                  Como chegar
                </Box>
              </Box>
            </Stack>
          </Coluna>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}
          sx={{ justifyContent: "space-between", borderTop: `1px solid ${cores.fundo3}`, pt: 2.5 }}>
          <Typography variant="caption" sx={{ color: cores.texto3 }}>
            © {new Date().getFullYear()} Barbearia Garcia &amp; Tatuagem
          </Typography>
          <Typography variant="caption" sx={{ color: cores.acento3 }}>
            Site de demonstração — não é o site oficial da barbearia.
          </Typography>
        </Stack>
      </Envolve>
    </Box>
  );
}
