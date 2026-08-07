"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { pt } from "date-fns/locale";
import * as M from "@/lib/marcacoes";
import type { Servico } from "@/lib/dados";
import { cores } from "@/app/design";

export default function PassoDiaHora({
  servico, barbeiroId, data, inicio, aoEscolherDia, aoEscolherHora
}: {
  servico: Servico;
  barbeiroId: string;
  data: string | null;
  inicio: number | null;
  aoEscolherDia: (chave: string) => void;
  aoEscolherHora: (min: number) => void;
}) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const limite = new Date(hoje); limite.setDate(limite.getDate() + M.HORIZONTE_DIAS);

  const slots = data ? M.horasDoDia(data, servico, barbeiroId) : [];
  const livres = slots.filter((s) => s.livre);

  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", mb: 0.5 }}>
        Quando lhe dá jeito?
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Fechamos ao domingo. Os dias sem vaga aparecem apagados.
      </Typography>

      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "auto 1fr" },
        gap: { xs: 3, md: 5 },
        alignItems: "start"
      }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pt}>
          <DateCalendar
            value={data ? M.dataDeChave(data) : null}
            onChange={(d) => d && aoEscolherDia(M.chaveData(d))}
            minDate={hoje}
            maxDate={limite}
            // As regras da casa continuam a mandar: domingo fechado, dias cheios
            // apagados. O componente só trata da mecânica do calendário.
            shouldDisableDate={(d: Date) => {
              const chave = M.chaveData(d);
              if (!M.expedienteDe(chave)) return true;
              return !M.diaTemVaga(chave, servico, barbeiroId);
            }}
            sx={{
              width: "100%", maxWidth: 340, m: 0,
              "& .MuiPickerDay-root": { fontSize: 15 },
              "& .MuiPickerDay-root.Mui-selected": {
                bgcolor: "primary.main", color: cores.fundo, fontWeight: 700,
                "&:hover, &:focus": { bgcolor: cores.acento2, color: cores.fundo }
              },
              "& .MuiPickersCalendarHeader-label": { textTransform: "capitalize" }
            }}
          />
        </LocalizationProvider>

        <Box aria-live="polite">
          {!data ? (
            <Box sx={{
              border: `1.5px dashed ${cores.fundo4}`, borderRadius: "14px",
              p: 5, textAlign: "center", color: cores.texto3
            }}>
              <Box sx={{
                width: 10, height: 10, borderRadius: "50%",
                border: `1.5px solid ${cores.acento3}`, mx: "auto", mb: 2
              }} />
              <Typography variant="body2">Escolha primeiro um dia no calendário.</Typography>
            </Box>
          ) : livres.length === 0 ? (
            <Box sx={{
              border: `1.5px dashed ${cores.fundo4}`, borderRadius: "14px",
              p: 5, textAlign: "center", color: cores.texto3
            }}>
              <Typography variant="body2">
                Não há vagas em {M.dataPorExtenso(data)}.<br />Escolha outro dia.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="overline" sx={{ color: "primary.main", display: "block", mb: 1.5 }}>
                {M.dataPorExtenso(data)} · {livres.length} {livres.length === 1 ? "vaga" : "vagas"}
              </Typography>
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(5.2rem, 1fr))",
                gap: 0.8
              }}>
                {/* As horas ocupadas aparecem riscadas em vez de escondidas:
                    é mais informativo do que fazer sumir metade da grelha. */}
                {slots.map((s) => (
                  <ButtonBase
                    key={s.inicio}
                    onClick={() => aoEscolherHora(s.inicio)}
                    disabled={!s.livre}
                    aria-pressed={inicio === s.inicio}
                    data-hora={s.etiqueta}
                    sx={{
                      py: 1.2, borderRadius: 999, fontSize: 15, fontWeight: 500,
                      border: `1.5px solid ${inicio === s.inicio ? cores.acento : cores.fundo3}`,
                      bgcolor: inicio === s.inicio ? "primary.main" : "background.default",
                      color: inicio === s.inicio ? cores.fundo : "text.secondary",
                      transition: "all 200ms",
                      "&:hover:not(:disabled)": {
                        borderColor: cores.acento,
                        color: inicio === s.inicio ? cores.fundo : cores.acento
                      },
                      "&.Mui-disabled": {
                        color: cores.texto3, opacity: 0.35,
                        textDecoration: "line-through",
                        borderColor: "transparent", bgcolor: "transparent"
                      }
                    }}
                  >
                    {s.etiqueta}
                  </ButtonBase>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
