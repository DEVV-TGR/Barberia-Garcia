"use client";

import { useState } from "react";
import Image from "next/image";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import CartaoMarcacao from "./CartaoMarcacao";
import ResumoDia from "./ResumoDia";
import * as M from "@/lib/marcacoes";
import { useMarcacoes } from "@/lib/useMarcacoes";
import { BARBEIROS } from "@/lib/dados";
import { cores, tituloFonte } from "@/app/design";

function Seta({ children, ...resto }: { children: React.ReactNode } & Record<string, unknown>) {
  return (
    <IconButton
      {...resto}
      sx={{
        width: 44, height: 44, flex: "none",
        border: `1.5px solid ${cores.fundo3}`, bgcolor: "background.paper",
        color: "text.secondary", fontSize: "1.2rem",
        "&:hover": { borderColor: cores.acento, color: cores.acento }
      }}
    >
      {children}
    </IconButton>
  );
}

export default function Agenda({ aoSair }: { aoSair: () => void }) {
  const { versao, mudarEstado, anular, semear, limpar } = useMarcacoes();
  const [dia, setDia] = useState(() => M.chaveData(new Date()));
  const [barbeiro, setBarbeiro] = useState("");

  const lista = M.marcacoesDe(dia, barbeiro);
  const resumo = M.resumoDoDia(dia, barbeiro);
  const hoje = M.chaveData(new Date());
  const extenso = M.dataPorExtenso(dia);
  const fechado = !M.expedienteDe(dia);

  const mover = (passos: number) => {
    const d = M.dataDeChave(dia);
    d.setDate(d.getDate() + passos);
    setDia(M.chaveData(d));
  };

  return (
    <Envolve>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" }, mb: 3 }}>
        <Box>
          <Sobrescrita>Agenda</Sobrescrita>
          <TituloSeccao component="h1" sx={{ mb: 0.5 }}>Marcações do dia</TituloSeccao>
          <Typography color="text.secondary" data-testid="dia-extenso">
            {dia === hoje ? `Hoje — ${extenso}` : extenso[0].toUpperCase() + extenso.slice(1)}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={aoSair} sx={{ flex: "none" }}>Sair</Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Seta onClick={() => mover(-1)} aria-label="Dia anterior">‹</Seta>
        <TextField
          type="date" size="small"
          fullWidth={false}   /* o tema põe fullWidth por omissão: aqui empurrava as setas para outra linha */
          value={dia}
          onChange={(e) => e.target.value && setDia(e.target.value)}
          slotProps={{ htmlInput: { "aria-label": "Escolher dia", "data-campo": "dia" } }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 999 }, width: 175 }}
        />
        <Seta onClick={() => mover(1)} aria-label="Dia seguinte">›</Seta>
        <Button variant="outlined" size="small" onClick={() => setDia(hoje)}>Hoje</Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 3 }} role="group"
        aria-label="Filtrar por barbeiro">
        <Chip
          label="Todos" onClick={() => setBarbeiro("")}
          data-filtro=""
          color={barbeiro === "" ? "primary" : "default"}
          variant={barbeiro === "" ? "filled" : "outlined"}
        />
        {BARBEIROS.map((b) => (
          <Chip
            key={b.id}
            label={b.nome.split(" ")[0]}
            data-filtro={b.id}
            onClick={() => setBarbeiro(b.id)}
            color={barbeiro === b.id ? "primary" : "default"}
            variant={barbeiro === b.id ? "filled" : "outlined"}
            avatar={
              <Box sx={{ position: "relative", width: 24, height: 24, borderRadius: "50%", overflow: "hidden" }}>
                <Image src={b.foto} alt="" fill sizes="24px" style={{ objectFit: "cover" }} />
              </Box>
            }
          />
        ))}
      </Stack>

      <ResumoDia resumo={resumo} />

      <Box data-testid="agenda" key={versao}>
        {lista.length === 0 ? (
          <Box sx={{
            border: `1.5px dashed ${cores.fundo4}`, borderRadius: "14px",
            p: 6, textAlign: "center", color: cores.texto3
          }}>
            <Typography sx={{
              fontFamily: tituloFonte.style.fontFamily, fontSize: "1.2rem",
              textTransform: "uppercase", color: "text.secondary", mb: 0.5
            }}>
              {fechado ? "Encerrado" : "Sem marcações"}
            </Typography>
            <Typography variant="body2">
              {fechado ? "A barbearia não abre ao domingo." : "Não há nada agendado para este dia."}
            </Typography>
          </Box>
        ) : (
          <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
            {lista.map((m) => (
              <CartaoMarcacao key={m.id} m={m} aoMudarEstado={mudarEstado} aoAnular={anular} />
            ))}
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={1} sx={{
        flexWrap: "wrap", gap: 1, mt: 3, pt: 2.5, borderTop: `1px solid ${cores.fundo3}`
      }}>
        <Button variant="outlined" size="small" onClick={semear} data-accao="exemplo">
          Carregar agenda de exemplo
        </Button>
        <Button variant="outlined" size="small" onClick={limpar} data-accao="limpar">
          Limpar tudo
        </Button>
      </Stack>

      <Alert
        severity="info" icon={false}
        sx={{
          mt: 3, borderRadius: "14px",
          border: `1px solid ${cores.acento3}`, bgcolor: "rgba(242,183,5,0.06)",
          color: "text.secondary"
        }}
      >
        <strong style={{ color: cores.acento }}>Só vê o que foi marcado neste navegador.</strong>{" "}
        Sem servidor, as marcações não viajam entre dispositivos: o que um cliente
        marcar no telemóvel dele não aparece aqui. Use o botão de exemplo para ver
        a agenda preenchida.
      </Alert>
    </Envolve>
  );
}
