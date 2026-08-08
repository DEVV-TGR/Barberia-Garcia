import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import tema from "./tema";
import { corpoFonte } from "./design";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
import TransicaoPagina from "@/components/TransicaoPagina";
import { CASA } from "@/lib/dados";

export const metadata: Metadata = {
  metadataBase: new URL("https://barbearia-garcia.vercel.app"),
  title: "Barbearia Garcia & Tatuagem — Moreira, Maia · Desde 1997",
  description:
    "Barbearia clássica em Moreira, Maia, desde 1997. Corte à tesoura, degradés e barba a vapor. Marque a sua vez online.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    title: "Barbearia Garcia & Tatuagem — Desde 1997",
    description: `Tradição e qualidade em ${CASA.localidade}. Marcações online.`,
    images: ["/img/cover-1.jpg"]
  },
  icons: { icon: "/img/logo.jpg" }
};

export const viewport: Viewport = {
  themeColor: "#0d2a1f",
  viewportFit: "cover"
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={corpoFonte.className} suppressHydrationWarning>
      <body>
        {/* Sem JavaScript não há quem tire o loader do caminho nem quem revele
            as secções: o site tem de continuar a ler-se à mesma. */}
        <noscript>
          <style>{
            "[data-carregamento]{display:none!important}" +
            "[data-revela]{opacity:1!important;transform:none!important}" +
            "[data-pagina]{animation:none!important}"
          }</style>
        </noscript>

        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={tema}>
            <CssBaseline />
            <Cabecalho />
            <main id="principal">
              <TransicaoPagina>{children}</TransicaoPagina>
            </main>
            <Rodape />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
