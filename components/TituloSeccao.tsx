import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

/**
 * Título de secção com uma parte em destaque.
 * `destaque` sai a amarelo, como "sua vez" em "Marque a sua vez".
 */
export default function TituloSeccao({
  children, destaque, component = "h2", sx
}: {
  children?: React.ReactNode;
  destaque?: React.ReactNode;
  component?: React.ElementType;
  sx?: object;
}) {
  return (
    <Typography
      variant="h2"
      component={component}
      sx={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", mb: 2, ...sx }}
    >
      {children}
      {destaque != null && (
        <>
          {children ? " " : null}
          <Box component="span" sx={{ color: "primary.main" }}>{destaque}</Box>
        </>
      )}
    </Typography>
  );
}
