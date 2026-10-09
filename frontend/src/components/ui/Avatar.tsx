import { initials } from "@/lib/color";

/** Another learner without a photo: their initial on a coloured circle. */
export function Avatar({ name, color, size = 48 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/** The signed-in learner without a photo: Duolingo draws a dashed ring with a grey initial. */
export function OwnAvatar({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-dashed font-bold text-faint"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        borderWidth: Math.max(1.5, size / 48),
        borderColor: "var(--hare)",
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
