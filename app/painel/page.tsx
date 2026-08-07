import type { Metadata } from "next";
import Painel from "@/components/painel/Painel";

export const metadata: Metadata = {
  title: "Painel — Barbearia Garcia",
  description: "Painel interno da Barbearia Garcia: agenda do dia, marcações por barbeiro.",
  robots: { index: false, follow: false }
};

export default function PaginaPainel() {
  return <Painel />;
}
