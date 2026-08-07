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
    <Box component="section" id="equipa" sx={{ py: { xs: 8, md: 12 } }}>
      <Envolve>
        <Sobrescrita>Quem corta</Sobrescrita>
        <TituloSeccao destaque="um ofício">Três mãos,</TituloSeccao>
        <Typography color="text.secondary" sx={{ maxWidth: "56ch" }}>
          Escolha o seu barbeiro na marcação — ou deixe-nos escolher por si.
        </Typography>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 3, mt: 5,
          maxWidth: { xs: "22rem", sm: "none" }
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
                <Box sx={{ position: "absolute", bottom: 20, left: 20, right: 20, zIndex: 2 }}>
                  <Typography variant="h4" component="h3" sx={{ fontSize: "1.4rem" }}>{b.nome}</Typography>
                  <Typography variant="overline" sx={{ color: "primary.main", display: "block", mt: 0.5 }}>
                    {b.papel}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{b.bio}</Typography>
            </Box>
          ))}
        </Box>
      </Envolve>
    </Box>
  );
}
