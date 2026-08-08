import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import EstadoLoja from "../EstadoLoja";
import { CASA } from "@/lib/dados";
import { cores } from "@/app/design";

const ORDEM = [1, 2, 3, 4, 5, 6, 0];

function LinhaContacto({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <Box component="li" sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "7rem 1fr" },
      gap: { xs: 0.5, sm: 2.5 },
      alignItems: "baseline",
      py: 2, borderBottom: `1px solid ${cores.fundo3}`
    }}>
      <Typography variant="overline" sx={{ color: cores.texto3 }}>{rotulo}</Typography>
      <Box sx={{ "& a": { color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } } }}>
        {children}
      </Box>
    </Box>
  );
}

export default function Visitar() {
  return (
    <Box component="section" id="visitar" sx={{ py: { xs: 8, md: 12 } }}>
      <Envolve sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
        gap: { xs: 5, md: 7 }
      }}>
        <Box>
          <Sobrescrita>Visitar</Sobrescrita>
          <TituloSeccao destaque="encontra">Onde nos</TituloSeccao>
          <Typography color="text.secondary" sx={{ maxWidth: "56ch" }}>
            Em Moreira, a dois passos do aeroporto. Estacionamento à porta.
          </Typography>

          <Box component="ul" sx={{ listStyle: "none", m: 0, mt: 3, p: 0 }}>
            <LinhaContacto rotulo="Morada">
              <a href={CASA.mapa} target="_blank" rel="noopener">
                {CASA.morada}<br />{CASA.codigoPostal} {CASA.localidade}
              </a>
            </LinhaContacto>
            <LinhaContacto rotulo="Telefone">
              <a href={`tel:${CASA.telefoneRaw}`}>914 230 669</a>
            </LinhaContacto>
            <LinhaContacto rotulo="Marcações">
              <Link href="/marcar">Marcar online</Link>
            </LinhaContacto>
          </Box>
        </Box>

        <Box>
          <Sobrescrita>Horário</Sobrescrita>
          <Box component="ul" sx={{ listStyle: "none", m: 0, mt: 3, p: 0 }}>
            {ORDEM.map((i) => {
              const h = CASA.horario[i];
              const hoje = new Date().getDay() === i;
              return (
                <Box component="li" key={h.dia} sx={{
                  display: "flex", justifyContent: "space-between", gap: 2,
                  py: 1.4, borderBottom: `1px solid ${cores.fundo3}`,
                  color: hoje ? "primary.main" : "text.primary",
                  fontWeight: hoje ? 500 : 400
                }}>
                  <span>{h.dia}</span>
                  {h.aberto
                    ? <span>{h.abre} – {h.fecha}</span>
                    : <Typography component="span" variant="overline" sx={{ color: cores.texto3 }}>Encerrado</Typography>}
                </Box>
              );
            })}
          </Box>
          <EstadoLoja />
        </Box>
      </Envolve>
    </Box>
  );
}
