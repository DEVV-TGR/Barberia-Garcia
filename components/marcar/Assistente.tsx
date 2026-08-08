"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import Envolve from "../Envolve";
import Sobrescrita from "../Sobrescrita";
import TituloSeccao from "../TituloSeccao";
import BarraAccao from "./BarraAccao";
import PassoServico from "./PassoServico";
import PassoBarbeiro from "./PassoBarbeiro";
import PassoDiaHora from "./PassoDiaHora";
import PassoDados, { type CamposDados, type ErrosDados } from "./PassoDados";
import Confirmacao from "./Confirmacao";
import MinhasMarcacoes from "./MinhasMarcacoes";
import * as M from "@/lib/marcacoes";
import { useMarcacoes, useCliente } from "@/lib/useMarcacoes";
import type { Marcacao } from "@/lib/dados";
import { euros, duracao } from "@/lib/formatar";
import { cores } from "@/app/design";

const PASSOS = ["Serviço", "Barbeiro", "Dia e hora", "Os seus dados"];

export default function Assistente() {
  const { pronto, versao, criar, anular } = useMarcacoes();
  const { cliente, guardar } = useCliente();
  const params = useSearchParams();

  const [passo, setPasso] = useState(0);
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [barbeiroId, setBarbeiroId] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [inicio, setInicio] = useState<number | null>(null);
  const [campos, setCampos] = useState<CamposDados>({ nome: "", telemovel: "", notas: "" });
  const [erros, setErros] = useState<ErrosDados>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [feita, setFeita] = useState<Marcacao | null>(null);

  // `/marcar?servico=…` entra já com o serviço escolhido, no passo do barbeiro
  useEffect(() => {
    const id = params.get("servico");
    if (id && M.servicoPorId(id)) {
      setServicoId(id);
      setPasso(1);
    }
  }, [params]);

  useEffect(() => {
    if (cliente.nome || cliente.telemovel) {
      setCampos((c) => ({ ...c, nome: cliente.nome, telemovel: cliente.telemovel }));
    }
  }, [cliente]);

  const servico = servicoId ? M.servicoPorId(servicoId) : undefined;

  const escolherServico = (id: string) => {
    setServicoId(id);
    setData(null); setInicio(null); // a duração mudou: a hora deixa de servir
  };

  const escolherBarbeiro = (id: string) => {
    setBarbeiroId(id);
    setData(null); setInicio(null); // a agenda depende do barbeiro
  };

  const completo = useMemo(() => {
    if (passo === 0) return Boolean(servicoId);
    if (passo === 1) return Boolean(barbeiroId);
    if (passo === 2) return Boolean(data) && inicio !== null;
    return true;
  }, [passo, servicoId, barbeiroId, data, inicio]);

  function confirmar() {
    const eNome = M.validarNome(campos.nome);
    const eTel = M.validarTelemovel(campos.telemovel);
    setErros({ nome: eNome, telemovel: eTel });
    if (eNome || eTel) return;

    const r = criar({
      servicoId: servicoId!, barbeiroId: barbeiroId!, data: data!, inicio: inicio!,
      nome: campos.nome, telemovel: campos.telemovel, notas: campos.notas
    });

    if (r.erro) {
      // O slot foi tomado entretanto: recuar para a escolha da hora
      setAviso(r.erro);
      setInicio(null);
      setPasso(2);
      subir();
      return;
    }

    guardar({ nome: campos.nome.trim(), telemovel: campos.telemovel.trim() });
    setFeita(r.marcacao!);
    setAviso(null);
    subir();
  }

  const subir = () => window.scrollTo({ top: 0, behavior: "smooth" });

  function avancar() {
    if (passo === PASSOS.length - 1) return confirmar();
    if (!completo) return;
    setPasso((p) => p + 1);
    subir();
  }

  function recomecar() {
    setFeita(null);
    setServicoId(null); setBarbeiroId(null); setData(null); setInicio(null);
    setCampos({ nome: cliente.nome, telemovel: cliente.telemovel, notas: "" });
    setErros({});
    setPasso(0);
    subir();
  }

  const detalheBarra = [
    servico ? `${duracao(servico.minutos)} · ${euros(servico.preco)}` : null,
    barbeiroId ? M.nomeBarbeiro(barbeiroId) : null,
    data && inicio !== null ? `${M.dataPorExtenso(data)}, ${M.paraHoras(inicio)}` : null
  ].filter(Boolean).join(" · ");

  return (
    <Box sx={{
      pt: { xs: 12, md: 16 },
      pb: "calc(9rem + env(safe-area-inset-bottom, 0px))",
      background: `radial-gradient(ellipse at 50% 0%, rgba(242,183,5,0.06), transparent 55%), ${cores.fundo}`,
      minHeight: "100svh"
    }}>
      <Envolve>
        <Sobrescrita>Marcações</Sobrescrita>
        <TituloSeccao destaque="sua vez" component="h1">Marque a</TituloSeccao>
        <Typography color="text.secondary" sx={{ maxWidth: "56ch", mb: 4 }}>
          Quatro passos e está feito. Sem chamadas, sem esperas.
        </Typography>

        {!feita && (
          <Stepper activeStep={passo} alternativeLabel sx={{
            mb: 4, p: 1, bgcolor: "background.paper", borderRadius: 999,
            "& .MuiStepLabel-label": { fontSize: 13, fontWeight: 600, mt: 0.5 },
            "& .MuiStepLabel-label.Mui-active": { color: "primary.main" }
          }}>
            {PASSOS.map((p) => (
              <Step key={p}><StepLabel>{p}</StepLabel></Step>
            ))}
          </Stepper>
        )}

        {aviso && (
          <Alert severity="warning" onClose={() => setAviso(null)} sx={{ mb: 3, borderRadius: "14px" }}>
            {aviso}
          </Alert>
        )}

        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: "22px" }}>
          {!pronto ? (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
              A carregar a agenda…
            </Typography>
          ) : feita && servico ? (
            <Confirmacao marcacao={feita} servico={servico} aoRecomecar={recomecar} />
          ) : (
            <>
              {passo === 0 && (
                <PassoServico escolhido={servicoId} aoEscolher={escolherServico} />
              )}
              {passo === 1 && (
                <PassoBarbeiro escolhido={barbeiroId} aoEscolher={escolherBarbeiro} />
              )}
              {passo === 2 && servico && barbeiroId && (
                <PassoDiaHora
                  key={versao}
                  servico={servico} barbeiroId={barbeiroId}
                  data={data} inicio={inicio}
                  aoEscolherDia={(c) => { setData(c); setInicio(null); }}
                  aoEscolherHora={setInicio}
                />
              )}
              {passo === 3 && servico && barbeiroId && data && inicio !== null && (
                <PassoDados
                  campos={campos} erros={erros}
                  aoMudar={(c) => setCampos((v) => ({ ...v, ...c }))}
                  servico={servico} barbeiroId={barbeiroId} data={data} inicio={inicio}
                />
              )}
            </>
          )}
        </Paper>

        <Alert
          severity="info" icon={false}
          sx={{
            mt: 3, borderRadius: "14px",
            border: `1px solid ${cores.acento3}`, bgcolor: "rgba(242,183,5,0.06)",
            color: "text.secondary"
          }}
        >
          <strong style={{ color: cores.acento }}>Isto é uma demonstração.</strong>{" "}
          As marcações ficam guardadas apenas neste navegador e não chegam à
          barbearia. Para marcar a sério, ligue{" "}
          <Box component="a" href="tel:+351914230669" sx={{ color: "primary.main" }}>914 230 669</Box>.
        </Alert>

        {pronto && <MinhasMarcacoes key={versao} aoAnular={anular} />}
      </Envolve>

      {pronto && !feita && (servicoId || passo > 0) && (
        <BarraAccao
          titulo={servico?.nome ?? "Escolha um serviço"}
          detalhe={detalheBarra || "Escolha um serviço para continuar"}
          podeAvancar={completo}
          rotulo={passo === PASSOS.length - 1 ? "Confirmar" : "Avançar"}
          aoAvancar={avancar}
          aoVoltar={() => { setPasso((p) => Math.max(0, p - 1)); subir(); }}
          mostrarVoltar={passo > 0}
        />
      )}
    </Box>
  );
}
