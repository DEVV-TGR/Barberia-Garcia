"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { BARBEIROS } from "@/lib/dados";
import { cores, tituloFonte } from "@/app/design";

function Opcao({ id, nome, papel, foto, escolhido, aoEscolher }: {
  id: string; nome: string; papel: string; foto?: string;
  escolhido: boolean; aoEscolher: (id: string) => void;
}) {
  return (
    <ButtonBase
      onClick={() => aoEscolher(id)}
      aria-pressed={escolhido}
      data-barbeiro={id}
      sx={{
        border: `1.5px solid ${escolhido ? cores.acento : cores.fundo3}`,
        bgcolor: escolhido ? "rgba(242,183,5,0.08)" : "background.default",
        borderRadius: "14px", p: 2, width: "100%", height: "100%",
        display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 2,
        textAlign: "left",
        transition: "border-color 200ms, background 200ms, transform 200ms",
        "&:hover": { borderColor: escolhido ? cores.acento : cores.fundo4, transform: "translateY(-2px)" }
      }}
    >
      <Box sx={{
        position: "relative", width: 48, height: 48, borderRadius: "50%", overflow: "hidden",
        border: `2px solid ${escolhido ? cores.acento : cores.fundo3}`,
        bgcolor: cores.fundo3, display: "grid", placeItems: "center", flex: "none"
      }}>
        {foto
          ? <Image src={foto} alt="" fill sizes="48px" style={{ objectFit: "cover" }} />
          : <Box component="span" sx={{ color: "primary.main", fontSize: 20 }} aria-hidden>✂</Box>}
      </Box>
      <Box>
        <Typography sx={{
          fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, fontSize: "1.05rem",
          textTransform: "uppercase", lineHeight: 1.15
        }}>
          {nome}
        </Typography>
        <Typography variant="overline" sx={{ color: cores.texto3, display: "block", mt: 0.2 }}>
          {papel}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

export default function PassoBarbeiro({ escolhido, aoEscolher }: {
  escolhido: string | null; aoEscolher: (id: string) => void;
}) {
  return (
    <Box>
      <Typography variant="h3" sx={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", mb: 0.5 }}>Com quem?</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Todos fazem o serviço. Se não tiver preferência, tratamos disso.
      </Typography>

      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        gap: 1
      }}>
        <Opcao
          id="qualquer" nome="Sem preferência" papel="O primeiro que estiver livre"
          escolhido={escolhido === "qualquer"} aoEscolher={aoEscolher}
        />
        {BARBEIROS.map((b) => (
          <Opcao
            key={b.id} id={b.id} nome={b.nome}
            papel={b.papel.split("·")[1]?.trim() ?? b.papel}
            foto={b.foto}
            escolhido={escolhido === b.id} aoEscolher={aoEscolher}
          />
        ))}
      </Box>
    </Box>
  );
}
