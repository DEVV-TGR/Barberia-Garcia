import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import { cores, tituloFonte } from "@/app/design";

export default function Casa() {
  return (
    <Box component="section" id="casa" sx={{ py: { xs: 6, md: 12 } }}>
      <Envolve sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: { xs: 5, md: 7 },
        alignItems: "center"
      }}>
        <Box sx={{ order: { xs: 2, md: 1 } }}>
          <Sobrescrita>A Casa</Sobrescrita>
          <TituloSeccao destaque="não teve pressa">Onde o tempo</TituloSeccao>
          <Typography color="text.secondary" sx={{ maxWidth: "56ch", mb: 2 }}>
            Abrimos portas em 1997 e ficámos. A cadeira é de ferro e pele, o
            espelho é grande e o café está sempre feito. Aqui não se corta cabelo
            à pressa — corta-se bem.
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: "56ch" }}>
            Ao corte clássico juntámos o degradé, a barba a vapor e, na sala ao
            lado, o estúdio de tatuagem. O ofício é o mesmo de sempre: mão firme,
            atenção ao pormenor e tempo para conversar.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography sx={{
              fontFamily: tituloFonte.style.fontFamily, fontSize: "1.4rem", fontWeight: 500,
              textTransform: "uppercase", color: "primary.main", lineHeight: 1.1
            }}>
              Ary Garcia
            </Typography>
            <Typography variant="overline" sx={{ color: cores.texto3, display: "block", mt: 0.5 }}>
              Mestre barbeiro · Fundador
            </Typography>
          </Box>
        </Box>

        <Box sx={{
          order: { xs: 1, md: 2 },
          position: "relative",
          maxWidth: { xs: "24rem", md: "none" },
          width: "100%",
          // A moldura deslocada dá profundidade sem sombra; em ecrãs médios
          // encolhe, para não empurrar a página para fora (transbordava no iPad).
          "&::before": {
            content: '""', position: "absolute",
            inset: {
              xs: "1rem -1rem -1rem 1rem",
              md: "1rem -0.75rem -1rem 1rem",
              lg: "1.4rem -1.4rem -1.4rem 1.4rem"
            },
            border: `2px solid ${cores.acento3}`, borderRadius: "14px", zIndex: -1
          }
        }}>
          <Box sx={{ position: "relative", aspectRatio: "4 / 5", borderRadius: "14px", overflow: "hidden" }}>
            <Image
              src="/img/cover-5.jpg"
              alt="Cadeiras de barbeiro em ferro e pele no salão da Barbearia Garcia"
              fill
              sizes="(max-width: 900px) 90vw, 45vw"
              style={{ objectFit: "cover" }}
            />
          </Box>

          <Box sx={{
            // O emblema sai da moldura de propósito, mas nunca do ecrã: a
            // 1024px o deslocamento antigo empurrava a página para fora.
            position: "absolute",
            right: { xs: "-0.5rem", md: "-0.75rem", lg: "-2rem" },
            bottom: { xs: "-1.5rem", md: "-1.5rem", lg: "-2rem" },
            width: "clamp(6rem, 13vw, 9rem)",
            aspectRatio: "1",
            bgcolor: "secondary.main",
            borderRadius: "50%",
            p: 1.2,
            boxShadow: "0 18px 40px -18px rgba(0,0,0,0.75)"
          }}>
            <Box sx={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden" }}>
              <Image
                src="/img/logo.jpg"
                alt="Emblema da Barbearia Garcia: Tradição e Qualidade, desde 1997"
                fill
                sizes="9rem"
                style={{ objectFit: "contain" }}
              />
            </Box>
          </Box>
        </Box>
      </Envolve>
    </Box>
  );
}
