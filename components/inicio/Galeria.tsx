import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import { GALERIA } from "@/lib/dados";
import { cores } from "@/app/design";

export default function Galeria() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
      <Envolve>
        <Sobrescrita>Por dentro</Sobrescrita>
        <TituloSeccao destaque="salão">O</TituloSeccao>

        {/* Mosaico por colunas: das cinco fotos da casa uma é paisagem e quatro
            são retrato. Uma grelha de altura fixa cortava-as a meio. */}
        <Box sx={{
          columnCount: { xs: 1, sm: 2, md: 3 },
          columnGap: "1rem",
          mt: 5
        }}>
          {GALERIA.map((g) => (
            <Box
              component="figure"
              key={g.src}
              sx={{
                m: 0, mb: 2, borderRadius: "14px", overflow: "hidden",
                breakInside: "avoid", position: "relative", bgcolor: cores.fundo3,
                "&:hover img": { transform: "scale(1.04)" },
                "&:hover figcaption": { opacity: 1, transform: "none" }
              }}
            >
              <Image
                src={g.src}
                alt={g.alt}
                width={1200}
                height={1600}
                sizes="(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw"
                style={{
                  width: "100%", height: "auto", display: "block",
                  transition: "transform 900ms cubic-bezier(0.22,1,0.36,1)"
                }}
              />
              <Typography
                component="figcaption"
                variant="body2"
                sx={{
                  position: "absolute", inset: "auto 0 0 0",
                  px: 2, pt: 5, pb: 2,
                  background: "linear-gradient(180deg, transparent, rgba(13,42,31,0.92))",
                  opacity: 0, transform: "translateY(8px)",
                  transition: "opacity 420ms, transform 420ms"
                }}
              >
                {g.alt}
              </Typography>
            </Box>
          ))}
        </Box>
      </Envolve>
    </Box>
  );
}
