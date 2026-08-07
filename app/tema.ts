"use client";

/* ==========================================================================
   Tema — traduz o sistema visual da casa para o MUI.
   O MUI traz consigo o aspecto Material; aqui ele é desfeito de propósito:
   cantos em pill, sem sombras de elevação, tipografia condensada nos títulos.
   ========================================================================== */

import { createTheme } from "@mui/material/styles";
import { cores, corpoFonte, tituloFonte, TEXTO_MINIMO as MINIMO } from "./design";

const tema = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary:   { main: cores.acento, light: cores.acento2, dark: cores.acento3, contrastText: cores.fundo },
    secondary: { main: cores.texto, contrastText: cores.fundo },
    background: { default: cores.fundo, paper: cores.fundo2 },
    text:      { primary: cores.texto, secondary: cores.texto2, disabled: cores.texto3 },
    error:     { main: cores.erro },
    success:   { main: cores.ok },
    divider:   cores.fundo3
  },

  shape: { borderRadius: 14 },

  typography: {
    fontFamily: corpoFonte.style.fontFamily,
    htmlFontSize: 16,
    fontSize: 16,
    h1: { fontFamily: tituloFonte.style.fontFamily, fontWeight: 600, lineHeight: 0.9,
          textTransform: "uppercase", letterSpacing: "-0.02em" },
    h2: { fontFamily: tituloFonte.style.fontFamily, fontWeight: 600, lineHeight: 1.02,
          textTransform: "uppercase" },
    h3: { fontFamily: tituloFonte.style.fontFamily, fontWeight: 600, lineHeight: 1.05,
          textTransform: "uppercase" },
    h4: { fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, lineHeight: 1.1,
          textTransform: "uppercase" },
    h5: { fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, textTransform: "uppercase" },
    h6: { fontFamily: tituloFonte.style.fontFamily, fontWeight: 500, textTransform: "uppercase" },
    body1: { fontSize: 17, fontWeight: 350, lineHeight: 1.65 },
    body2: { fontSize: 15, fontWeight: 350, lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 14 },
    // Rótulos: pequenos, mas nunca abaixo do mínimo
    overline: { fontSize: MINIMO + 1, fontWeight: 700, letterSpacing: "0.24em",
                textTransform: "uppercase", lineHeight: 1.6 },
    caption: { fontSize: MINIMO + 1, fontWeight: 500, lineHeight: 1.5 }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body": { overflowX: "clip" },
        // Grão sobre tudo, para as superfícies grandes não ficarem lisas demais
        "body::after": {
          content: '""',
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")"
        },
        "::selection": { background: cores.acento, color: cores.fundo }
      }
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: "0.85rem 2rem",
          borderWidth: 2,
          "&:hover": { borderWidth: 2, transform: "translateY(-2px)" },
          "&:active": { transform: "translateY(0)" },
          transition: "background 200ms, color 200ms, border-color 200ms, transform 200ms"
        },
        sizeSmall: { padding: "0.5rem 1.15rem", fontSize: 13 }
      },
      // Desactivado tem de continuar a ler-se: 5.0:1, não uma opacidade cega
      variants: [
        {
          props: { variant: "contained" as const },
          style: { "&.Mui-disabled": { background: cores.fundo3, color: cores.texto2 } }
        },
        {
          props: { variant: "outlined" as const },
          style: { "&.Mui-disabled": { borderColor: cores.fundo4, color: cores.texto2 } }
        }
      ]
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none", border: `1px solid ${cores.fundo3}` }
      }
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 700, letterSpacing: "0.1em" },
        label: { fontSize: MINIMO + 1 }
      }
    },

    MuiTextField: { defaultProps: { variant: "outlined", fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12, background: cores.fundo },
        input: { fontSize: 16 } // abaixo de 16px o iOS dá zoom ao focar
      }
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: 14, fontWeight: 600, letterSpacing: "0.08em" } }
    },

    MuiTooltip: { styleOverrides: { tooltip: { fontSize: MINIMO + 1 } } },
    MuiAccordion: {
      defaultProps: { disableGutters: true },
      styleOverrides: { root: { background: "transparent", "&:before": { display: "none" } } }
    }
  }
});

export default tema;
