"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as M from "@/lib/marcacoes";
import { euros } from "@/lib/formatar";
import { cores, tituloFonte } from "@/app/design";

export default function MinhasMarcacoes({ aoAnular }: { aoAnular: (id: string) => void }) {
  const lista = M.marcacoesDoCliente();

  return (
    <Box sx={{ mt: 7 }}>
      <Typography variant="h3" sx={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", mb: 2 }}>
        As suas marcações
      </Typography>

      {lista.length === 0 ? (
        <Box sx={{
          border: `1.5px dashed ${cores.fundo4}`, borderRadius: "14px",
          p: 3, textAlign: "center", color: cores.texto3
        }}>
          <Typography variant="body2">
            Ainda não marcou nada. As suas marcações aparecem aqui.
          </Typography>
        </Box>
      ) : (
        <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {lista.map((m) => {
            const s = M.servicoPorId(m.servicoId);
            const passada = M.jaPassou(m);
            return (
              <Paper
                component="li"
                key={m.id}
                data-testid="reserva"
                sx={{
                  p: 2, borderRadius: "14px",
                  borderLeft: `4px solid ${passada ? cores.fundo4 : cores.acento}`,
                  opacity: passada ? 0.55 : 1,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                  gap: 2, alignItems: "center"
                }}
              >
                <Box>
                  <Typography sx={{
                    fontFamily: tituloFonte.style.fontFamily, fontWeight: 500,
                    fontSize: "1.05rem", textTransform: "uppercase"
                  }}>
                    {M.dataPorExtenso(m.data)} · {M.paraHoras(m.inicio)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                    {s?.nome ?? "—"} · {M.nomeBarbeiro(m.barbeiroId)} · {euros(m.preco)}
                  </Typography>
                  {passada && (
                    <Typography variant="overline" sx={{ color: cores.texto3, display: "block", mt: 0.4 }}>
                      Já passou
                    </Typography>
                  )}
                </Box>
                {!passada && (
                  <Button
                    size="small" variant="outlined"
                    onClick={() => aoAnular(m.id)}
                    sx={{
                      justifySelf: "start",
                      borderColor: cores.fundo4, color: "text.secondary",
                      "&:hover": { borderColor: cores.erro, color: cores.erro, bgcolor: "transparent" }
                    }}
                  >
                    Anular
                  </Button>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
