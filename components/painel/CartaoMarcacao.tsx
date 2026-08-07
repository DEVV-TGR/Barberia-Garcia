"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import * as M from "@/lib/marcacoes";
import type { EstadoMarcacao, Marcacao } from "@/lib/dados";
import { euros, duracao } from "@/lib/formatar";
import { cores, tituloFonte } from "@/app/design";

const CORES_ESTADO: Record<EstadoMarcacao, string> = {
  agendada: cores.acento,
  concluida: cores.ok,
  falta: cores.erro
};

export default function CartaoMarcacao({ m, aoMudarEstado, aoAnular }: {
  m: Marcacao;
  aoMudarEstado: (id: string, estado: EstadoMarcacao) => void;
  aoAnular: (id: string) => void;
}) {
  const s = M.servicoPorId(m.servicoId);
  const b = M.barbeiroPorId(m.barbeiroId);
  const cor = CORES_ESTADO[m.estado];

  return (
    <Paper
      component="li"
      data-testid="marcacao"
      data-estado={m.estado}
      sx={{
        p: { xs: 1.8, md: 2.2 }, borderRadius: "14px", borderLeft: `4px solid ${cor}`,
        opacity: m.estado === "agendada" ? 1 : 0.72,
        display: "grid",
        gridTemplateColumns: { xs: "5.6rem 1fr", md: "6rem 1fr auto" },
        gap: { xs: 1.4, md: 3 },
        alignItems: "start"
      }}
    >
      <Box>
        <Typography sx={{
          fontFamily: tituloFonte.style.fontFamily, fontSize: "1.35rem", fontWeight: 600, lineHeight: 1.1
        }}>
          {M.paraHoras(m.inicio)}
        </Typography>
        <Typography variant="caption" sx={{ color: cores.texto3, display: "block", mt: 0.2 }}>
          até {M.paraHoras(m.inicio + m.minutos)}
        </Typography>
        {/* O selo acompanha a hora: em telemóvel poupa uma linha inteira.
            O label do Chip corta com reticências por omissão — aqui não pode,
            senão "Agendada" fica "Agend…". */}
        <Chip label={M.ESTADOS[m.estado].rotulo} size="small" data-selo
          sx={{
            mt: 0.8, bgcolor: `${cor}22`, color: cor, fontWeight: 700, height: 22,
            maxWidth: "100%",
            "& .MuiChip-label": { px: 0.9, overflow: "visible", textOverflow: "clip" }
          }} />
      </Box>

      <Box>
        <Typography sx={{
          fontFamily: tituloFonte.style.fontFamily, fontSize: "1.15rem", fontWeight: 500,
          textTransform: "uppercase"
        }}>
          {m.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          {s?.nome ?? "—"} · {duracao(m.minutos)} · {euros(m.preco)}
        </Typography>
        {m.telemovel && (
          <Typography variant="body2" sx={{ mt: 0.3 }}>
            <Box component="a" href={`tel:${m.telemovel}`}
              sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              {m.telemovel}
            </Box>
          </Typography>
        )}
        {m.notas && (
          <Typography variant="body2" sx={{
            mt: 1, p: 1.2, bgcolor: "background.default", borderRadius: "9px",
            borderLeft: `2px solid ${cores.fundo4}`, color: "text.secondary"
          }}>
            {m.notas}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1 }}>
          {b && (
            <Box sx={{ position: "relative", width: 22, height: 22, borderRadius: "50%", overflow: "hidden" }}>
              <Image src={b.foto} alt="" fill sizes="22px" style={{ objectFit: "cover" }} />
            </Box>
          )}
          <Typography variant="overline" sx={{ color: cores.texto3 }}>
            {M.nomeBarbeiro(m.barbeiroId)}
          </Typography>
        </Box>
      </Box>

      {/* Acções numa linha compacta: em telemóvel estavam empilhadas e cada
          cartão passava dos 260px de altura. */}
      <Box
        sx={{
          gridColumn: { xs: "1 / -1", md: "auto" },
          display: "flex", flexWrap: "wrap", gap: 0.7,
          justifyContent: { xs: "flex-start", md: "flex-end" },
          alignItems: "flex-start",
          "& .MuiButton-root": {
            minWidth: 0, px: 1.4, py: 0.5, fontSize: 12,
            borderColor: cores.fundo4, color: "text.secondary", flex: "none"
          }
        }}
      >
        {m.estado !== "concluida" && (
          <Button size="small" variant="outlined" data-accao="concluida"
            onClick={() => aoMudarEstado(m.id, "concluida")}
            sx={{ "&:hover": { borderColor: cores.ok, color: cores.ok } }}>
            Concluída
          </Button>
        )}
        {m.estado !== "falta" && (
          <Button size="small" variant="outlined" data-accao="falta"
            onClick={() => aoMudarEstado(m.id, "falta")}
            sx={{ "&:hover": { borderColor: cores.erro, color: cores.erro } }}>
            Faltou
          </Button>
        )}
        {m.estado !== "agendada" && (
          <Button size="small" variant="outlined" data-accao="agendada"
            onClick={() => aoMudarEstado(m.id, "agendada")}>
            Reabrir
          </Button>
        )}
        <Button size="small" variant="outlined" data-accao="anular"
          onClick={() => aoAnular(m.id)}
          sx={{ "&:hover": { borderColor: cores.erro, color: cores.erro } }}>
          Anular
        </Button>
      </Box>
    </Paper>
  );
}
