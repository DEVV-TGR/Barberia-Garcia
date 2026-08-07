import Image from "next/image";
import Box from "@mui/material/Box";
import BotaoLink from "../BotaoLink";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import { CASA } from "@/lib/dados";
import { anosPorExtenso } from "@/lib/formatar";
import { cores } from "@/app/design";

const FACTOS = [
  { r: "Desde", v: "1997" },
  { r: "Barbeiros", v: "3" },
  { r: "Avaliações", v: "59" },
  { r: "A partir de", v: "4 €" }
];

export default function Hero() {
  const anos = anosPorExtenso(new Date().getFullYear() - CASA.desde);

  return (
    <Box component="section" sx={{
      minHeight: "100svh", display: "grid", alignItems: "center",
      position: "relative", pt: { xs: 14, md: 16 }, pb: 6, overflow: "hidden"
    }}>
      <Box sx={{ position: "absolute", inset: 0, zIndex: -2 }}>
        <Image
          src="/img/cover-1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", filter: "brightness(0.92) saturate(1.08)" }}
        />
        {/* Cunha escura à esquerda, onde assenta o texto; a direita fica limpa
            para o salão se ver. Medido: 9.5:1 sob o título. */}
        <Box sx={{
          position: "absolute", inset: 0,
          background: `
            linear-gradient(100deg, rgba(9,30,22,0.92) 0%, rgba(9,30,22,0.72) 34%,
                            rgba(9,30,22,0.22) 62%, rgba(9,30,22,0.08) 100%),
            linear-gradient(180deg, rgba(13,42,31,0.72) 0%, rgba(13,42,31,0.1) 26%,
                            rgba(13,42,31,0.55) 82%, ${cores.fundo} 99%)`
        }} />
      </Box>

      <Envolve>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 1,
          border: `1.5px solid ${cores.acento3}`, bgcolor: "rgba(242,183,5,0.06)",
          borderRadius: 999, px: 2.2, py: 0.9, mb: 3.5
        }}>
          <Typography variant="overline" sx={{ color: "primary.main", lineHeight: 1 }}>
            {CASA.localidade} · Desde {CASA.desde}
          </Typography>
        </Box>

        <Typography variant="h1" sx={{
          fontSize: "clamp(3.4rem, 13vw, 10rem)", lineHeight: 0.86, mb: 3,
          textShadow: "0 2px 24px rgba(6,21,15,0.55)"
        }}>
          <Box component="span" sx={{ display: "block" }}>Barbearia</Box>
          <Box component="span" sx={{ display: "block", color: "primary.main" }}>Garcia</Box>
        </Typography>

        <Typography sx={{
          fontSize: "clamp(1.02rem, 2vw, 1.2rem)", maxWidth: "42ch", mb: 4,
          textShadow: "0 1px 14px rgba(6,21,15,0.7)"
        }}>
          {anos} anos a cortar cabelo em Moreira. Tesoura, navalha e toalha
          quente — do jeito que sempre se fez.
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
          <BotaoLink href="/marcar" variant="contained" size="large">
            Marcar a minha vez
          </BotaoLink>
          <BotaoLink href="#servicos" variant="outlined" size="large">
            Ver a carta
          </BotaoLink>
        </Stack>

        {/* Em telemóvel, grelha 2×2: com flex-wrap os quatro factos partiam
            3 + 1 e o último ficava sozinho numa linha. */}
        <Box component="dl" sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, auto)" },
          justifyContent: { sm: "start" },
          gap: { xs: "1.4rem 1rem", sm: "2.5rem" },
          mt: { xs: 5, md: 7 }, pt: 4, mb: 0,
          borderTop: "1px solid rgba(240,236,226,0.12)"
        }}>
          {FACTOS.map((f) => (
            <Box key={f.r}>
              <Typography component="dt" variant="overline" sx={{ color: cores.texto3, display: "block" }}>
                {f.r}
              </Typography>
              <Typography component="dd" variant="h4" sx={{ m: 0, color: "primary.main", fontSize: "1.7rem" }}>
                {f.v}
              </Typography>
            </Box>
          ))}
        </Box>
      </Envolve>
    </Box>
  );
}
