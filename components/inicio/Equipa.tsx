import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import { BARBEIROS } from "@/lib/dados";
import { cores } from "@/app/design";

export default function Equipa() {
  return (
    <Box component="section" id="equipa" sx={{ py: { xs: 6, md: 12 } }}>
      <Envolve>
        <Sobrescrita>Quem corta</Sobrescrita>
        <TituloSeccao destaque="um ofício">Três mãos,</TituloSeccao>
        <Typography color="text.secondary" sx={{ maxWidth: "56ch" }}>
          Escolha o seu barbeiro na marcação — ou deixe-nos escolher por si.
        </Typography>

        {/* Duas colunas já no telemóvel: numa coluna só, cada retrato ocupava
            467px — 55% do ecrã — e a secção passava dos dois ecrãs. */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: { xs: 1.5, md: 3 }, mt: { xs: 3.5, md: 5 }
        }}>
          {BARBEIROS.map((b, i) => (
            <Box component="article" key={b.id} sx={{ "&:hover img": { transform: "scale(1.04)" } }}>
              <Box sx={{
                position: "relative", aspectRatio: "3 / 4", borderRadius: "14px",
                overflow: "hidden", bgcolor: cores.fundo3
              }}>
                <Image
                  src={b.foto}
                  alt={`Retrato de ${b.nome}`}
                  fill
                  sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw"
                  style={{ objectFit: "cover", transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)" }}
                />
                <Box sx={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, transparent 45%, rgba(13,42,31,0.92))"
                }} />
                <Typography sx={{
                  position: "absolute", top: 14, left: 18, zIndex: 2,
                  color: "primary.main", fontWeight: 600, fontSize: 14
                }}>
                  0{i + 1}
                </Typography>
                {/* Em coluna estreita só o nome fica sobre a foto: o cargo,
                    com o espaçamento das maiúsculas, partia em três linhas e
                    tapava metade do retrato. */}
                <Box sx={{ position: "absolute", bottom: { xs: 12, md: 20 }, left: { xs: 12, md: 20 }, right: { xs: 12, md: 20 }, zIndex: 2 }}>
                  <Typography variant="h4" component="h3" sx={{ fontSize: { xs: "1rem", md: "1.4rem" }, lineHeight: 1.1 }}>{b.nome}</Typography>
                  <Typography variant="overline" sx={{
                    color: "primary.main", mt: 0.5,
                    display: { xs: "none", md: "block" }
                  }}>
                    {b.papel}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="overline" sx={{
                color: "primary.main", mt: 1.2, letterSpacing: "0.14em",
                display: { xs: "block", md: "none" }
              }}>
                {b.papel}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 0.6, md: 1.5 } }}>{b.bio}</Typography>
            </Box>
          ))}
        </Box>
      </Envolve>
    </Box>
  );
}
