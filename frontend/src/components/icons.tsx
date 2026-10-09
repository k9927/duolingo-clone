// Icons: official Duolingo artwork where available (via DuoImg), SVG otherwise.
import { DuoImg } from "./ui/DuoImg";
import { DUO } from "@/lib/duoAssets";

type IconProps = { className?: string; size?: number };

export function FlameIcon({ className, size = 24, active = true }: IconProps & { active?: boolean }) {
  return <DuoImg src={active ? DUO.streakActive : DUO.streakInactive} width={Math.round(size * 0.82)} height={size} className={className} />;
}

export function HeartIcon({ className, size = 24, empty = false }: IconProps & { empty?: boolean }) {
  return <DuoImg src={DUO.heart} width={size} className={`${empty ? "opacity-30 grayscale" : ""} ${className ?? ""}`} />;
}

export function GemIcon({ className, size = 24 }: IconProps) {
  return <DuoImg src={DUO.gem} width={Math.round(size * 0.8)} height={size} className={className} />;
}

export function XpIcon({ className, size = 24 }: IconProps) {
  return <DuoImg src={DUO.questXp} width={size} className={className} />;
}

export function LockIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4.5" y="10" width="15" height="11.5" rx="3" fill={color} />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke={color} strokeWidth="2.6" fill="none" />
    </svg>
  );
}

export function StarIcon({ className, size = 24, color = "#fff" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="m12 2.6 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.6Z"
        fill={color}
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className, size = 24, color = "currentColor", strokeWidth = 3.4 }: IconProps & { color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function CloseIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function TrophyIcon({ className, size = 24, color = "#FFC800", shadow = "#E5A000" }: IconProps & { color?: string; shadow?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M6 4h12v4.5a6 6 0 0 1-12 0V4Z" fill={color} />
      <path d="M6 6H3.5v1.5A3.5 3.5 0 0 0 7 11M18 6h2.5v1.5A3.5 3.5 0 0 1 17 11" stroke={color} strokeWidth="2" fill="none" />
      <path d="M10.5 14h3v3.5h-3z" fill={shadow} />
      <rect x="7" y="17.5" width="10" height="3.5" rx="1.2" fill={color} />
      <path d="M9 5.5v3.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export function ChestIcon({ className, size = 24, open = false, locked = false }: IconProps & { open?: boolean; locked?: boolean }) {
  const body = locked ? "var(--swan)" : "#CD7900";
  const lid = locked ? "color-mix(in srgb, var(--swan) 80%, black)" : "#FF9600";
  const band = locked ? "var(--hare)" : "#FFC800";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {open ? (
        <path d="M3.5 6.5 6 2.5h12l2.5 4H3.5Z" fill={lid} />
      ) : (
        <path d="M3 10V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2H3Z" fill={lid} />
      )}
      <rect x="3" y="10" width="18" height="10.5" rx="2" fill={body} />
      <rect x="10" y="8.5" width="4" height="5" rx="1" fill={band} />
      {open && <path d="M6 9.5h12" stroke="#FFC800" strokeWidth="2" />}
    </svg>
  );
}

export function DumbbellIcon({ className, size = 24, color = "#fff" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="8" width="4" height="8" rx="1.5" fill={color} />
      <rect x="18" y="8" width="4" height="8" rx="1.5" fill={color} />
      <rect x="5" y="6" width="3.5" height="12" rx="1.5" fill={color} />
      <rect x="15.5" y="6" width="3.5" height="12" rx="1.5" fill={color} />
      <rect x="8" y="10.8" width="8" height="2.4" fill={color} />
    </svg>
  );
}

export function BookIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 5.5c3-1.3 6-1.3 9 .7v14c-3-2-6-2-9-.7v-14ZM21 5.5c-3-1.3-6-1.3-9 .7v14c3-2 6-2 9-.7v-14Z" fill={color} />
    </svg>
  );
}

export function SpeakerIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M3 9.5h4l5-4.5v14l-5-4.5H3v-5Z" fill={color} />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ShieldIcon({ className, size = 24, color = "#CD7F32", shadow = "#A0612A" }: IconProps & { color?: string; shadow?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2 20.5 5v6.5c0 5-3.7 9-8.5 10.5C7.2 20.5 3.5 16.5 3.5 11.5V5L12 2Z" fill={shadow} />
      <path d="M12 3.8 19 6.3v5.2c0 4.1-3 7.5-7 8.8-4-1.3-7-4.7-7-8.8V6.3l7-2.5Z" fill={color} />
      <path d="m12 7.5 1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4L12 7.5Z" fill="#fff" opacity=".85" />
    </svg>
  );
}

export function FreezeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#84D8FF" />
      <rect x="5" y="5" width="14" height="14" rx="3.5" fill="#DDF4FF" />
      <path d="M12 7v10M7.7 9.5l8.6 5M16.3 9.5l-8.6 5" stroke="#1CB0F6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TimerIcon({ className, size = 24, color = "currentColor" }: IconProps & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="13.5" r="8" fill="none" stroke={color} strokeWidth="2.4" />
      <path d="M12 9.5v4.5l3 2M9.5 2.5h5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function TargetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#FF4B4B" />
      <circle cx="12" cy="12" r="6.5" fill="#fff" />
      <circle cx="12" cy="12" r="3.2" fill="#FF4B4B" />
    </svg>
  );
}

/** Course flag drawn in SVG (Windows does not render flag emoji). */
export function CourseFlag({ code, size = 32 }: { code?: string; size?: number }) {
  const height = size * 0.75;
  if (code !== "es") return <span style={{ fontSize: height }}>🏳️</span>;
  return (
    <svg width={size} height={height} viewBox="0 0 32 24" aria-label="Spanish" className="shrink-0">
      <defs>
        <clipPath id="flag-clip">
          <rect width="32" height="24" rx="5" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-clip)">
        <rect width="32" height="24" fill="#FF4B4B" />
        <rect y="6" width="32" height="12" fill="#FFC800" />
      </g>
      <rect x="1" y="1" width="30" height="22" rx="4" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2" />
    </svg>
  );
}

// ---------------------------------------------------------------- navigation icons

export function HomeNavIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M4 15 16 4l12 11v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V15Z" fill="#FFC800" />
      <path d="M2.5 15.5 16 3.5l13.5 12" stroke="#FF4B4B" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="12.5" y="18" width="7" height="11" rx="1.5" fill="#CD7900" />
    </svg>
  );
}

export function LeaderboardNavIcon({ size = 32 }: IconProps) {
  return <ShieldIcon size={size} color="#FFC800" shadow="#E5A000" />;
}

export function QuestsNavIcon({ size = 32 }: IconProps) {
  return <ChestIcon size={size} />;
}

export function ShopNavIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect x="5" y="13" width="22" height="15" rx="2" fill="#FFF0D4" />
      <path d="M3.5 13 6 5h20l2.5 8H3.5Z" fill="#FF4B4B" />
      <path d="M9.5 5 8.5 13M16 5v8M22.5 5l1 8" stroke="#fff" strokeWidth="2" />
      <rect x="13" y="19" width="6" height="9" rx="1" fill="#1CB0F6" />
    </svg>
  );
}

export function ProfileNavIcon({ size = 32, color = "#1CB0F6", letter = "" }: IconProps & { color?: string; letter?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="14" fill={color} />
      {letter ? (
        <text x="16" y="21.5" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" fontFamily="inherit">
          {letter}
        </text>
      ) : (
        <>
          <circle cx="16" cy="13" r="5" fill="#fff" />
          <path d="M7.5 25a9 9 0 0 1 17 0" fill="#fff" />
        </>
      )}
    </svg>
  );
}

export function MoreNavIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="13" fill="#CE82FF" />
      {[10, 16, 22].map((x) => (
        <circle key={x} cx={x} cy="16" r="2.4" fill="#fff" />
      ))}
    </svg>
  );
}
