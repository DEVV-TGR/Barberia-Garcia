import Hero from "@/components/inicio/Hero";
import Casa from "@/components/inicio/Casa";
import Carta from "@/components/inicio/Carta";
import Equipa from "@/components/inicio/Equipa";
import Galeria from "@/components/inicio/Galeria";
import Chamada from "@/components/inicio/Chamada";
import Visitar from "@/components/inicio/Visitar";
import Revela from "@/components/Revela";

export default function Inicio() {
  return (
    <>
      {/* O hero já está no ecrã quando a página abre: revelá-lo seria escondê-lo
          a quem acabou de chegar. */}
      <Hero />

      <Revela><Casa /></Revela>
      <Revela><Carta /></Revela>
      <Revela><Equipa /></Revela>
      <Revela><Galeria /></Revela>
      <Revela><Chamada /></Revela>
      <Revela><Visitar /></Revela>
    </>
  );
}
