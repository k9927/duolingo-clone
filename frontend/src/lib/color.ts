/** Darken (amount < 0) or lighten (amount > 0) a hex colour by a fraction. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const channel = (shift: number) => {
    const c = (n >> shift) & 0xff;
    const v = amount < 0 ? c * (1 + amount) : c + (255 - c) * amount;
    return Math.round(Math.min(255, Math.max(0, v)));
  };
  return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("")}`;
}

export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
