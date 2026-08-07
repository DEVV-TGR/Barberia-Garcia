import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

/** Largura de leitura da casa, com margens que respiram nas pontas. */
export default function Envolve({
  children, sx
}: { children: React.ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box sx={{ width: "min(100% - 2.5rem, 1180px)", mx: "auto", ...sx }}>
      {children}
    </Box>
  );
}
