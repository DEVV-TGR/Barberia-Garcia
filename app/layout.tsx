import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import tema from "./tema";
import { corpoFonte } from "./design";
import Cabecalho from "@/components/Cabecalho";
import Rodape from "@/components/Rodape";
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
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={tema}>
            <CssBaseline />
            <Cabecalho />
            <main id="principal">{children}</main>
            <Rodape />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
