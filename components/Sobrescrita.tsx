import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/** Rótulo de secção: traço curto e maiúsculas espaçadas. */
export default function Sobrescrita({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.6, mb: 2 }}>
      <Box sx={{ width: "1.8rem", height: "2px", bgcolor: "primary.main", borderRadius: 1, flex: "none" }} />
      <Typography variant="overline" color="primary.main" component="p">
        {children}
      </Typography>
    </Box>
  );
}
