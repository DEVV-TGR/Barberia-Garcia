import Box from "@mui/material/Box";
import BotaoLink from "../BotaoLink";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import TituloSeccao from "../TituloSeccao";
import { cores } from "@/app/design";

export default function Chamada() {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Envolve>
        <Box sx={{
          background: `linear-gradient(135deg, ${cores.fundo3}, ${cores.fundo2})`,
          border: `1px solid ${cores.fundo4}`,
          borderRadius: "28px",
          p: { xs: 3.5, md: 5 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 3
        }}>
          <Box>
            <TituloSeccao destaque="a sua vez" sx={{ mb: 1 }}>Pronto para</TituloSeccao>
            <Typography color="text.secondary" sx={{ m: 0 }}>
              Quatro passos. Sem chamadas, sem esperas.
            </Typography>
          </Box>
          <BotaoLink href="/marcar" variant="contained" size="large" sx={{ flex: "none" }}>
            Marcar agora
          </BotaoLink>
        </Box>
      </Envolve>
    </Box>
  );
}
