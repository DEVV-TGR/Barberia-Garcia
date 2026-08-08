"use client";

import Link from "next/link";
import Button, { type ButtonProps } from "@mui/material/Button";

/**
 * Botão que navega. Existe como componente cliente próprio por duas razões:
 * o `Button` do MUI é cliente e o Next não deixa passar-lhe `component={Link}`
 * a partir de um componente de servidor; e herdar `ButtonProps` inteiro traria
 * handlers tipados para `<button>`, que colidem com os de `<a>`.
 */
type Props = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  color?: ButtonProps["color"];
  fullWidth?: boolean;
  sx?: ButtonProps["sx"];
  onClick?: () => void;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

export default function BotaoLink({ href, children, ...resto }: Props) {
  return (
    <Button component={Link} href={href} {...resto}>
      {children}
    </Button>
  );
}
