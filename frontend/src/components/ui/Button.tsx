import Link from "next/link";
import { shade } from "@/lib/color";

type Variant = "primary" | "secondary" | "danger" | "gold" | "outline" | "ghost" | "white";

// Colours reference the theme tokens in globals.css, so buttons follow light/dark
// mode exactly like Duolingo (e.g. lime fill with dark text in dark mode).
const VARIANTS: Record<Variant, { bg: string; shadow: string; text: string; border?: boolean }> = {
  primary: { bg: "var(--owl)", shadow: "var(--tree-frog)", text: "var(--on-color)" },
  secondary: { bg: "var(--macaw)", shadow: "var(--whale)", text: "var(--on-color)" },
  danger: { bg: "var(--cardinal)", shadow: "var(--fire-ant)", text: "var(--on-color)" },
  gold: { bg: "var(--bee)", shadow: "var(--bee-shadow)", text: "#fff" },
  outline: { bg: "var(--snow)", shadow: "var(--swan)", text: "var(--macaw)", border: true },
  white: { bg: "#fff", shadow: "rgba(255,255,255,0.7)", text: "#4B4B4B" },
  ghost: { bg: "transparent", shadow: "transparent", text: "var(--macaw)" },
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Custom fill colour (e.g. a unit colour); the 3D shadow is derived from it. */
  color?: string;
  textColor?: string;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  href?: string;
}

const SIZES = {
  sm: "h-10 px-4 text-sm rounded-xl",
  md: "h-[50px] px-4 text-[15px] rounded-2xl",
  lg: "h-[54px] px-6 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  color,
  textColor,
  size = "md",
  full,
  href,
  className = "",
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant];
  const palette = disabled
    ? { bg: "var(--swan)", shadow: "transparent", text: "var(--hare)" }
    : { bg: color ?? v.bg, shadow: color ? shade(color, -0.22) : v.shadow, text: textColor ?? v.text };

  const classes = [
    "btn-3d inline-flex select-none items-center justify-center gap-2 font-extrabold uppercase tracking-[0.8px]",
    SIZES[size],
    full ? "w-full" : "",
    v.border && !disabled ? "border-2 border-line" : "",
    disabled ? "cursor-not-allowed" : "cursor-pointer",
    className,
  ].join(" ");

  const vars = {
    "--btn-bg": palette.bg,
    "--btn-shadow": palette.shadow,
    "--btn-text": palette.text,
    ...style,
  } as React.CSSProperties;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} style={vars}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} style={vars} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
