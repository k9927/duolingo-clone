"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useToast } from "../providers/ToastProvider";
import { useUser } from "../providers/UserProvider";
import { OwnAvatar } from "../ui/Avatar";
import { DuoImg } from "../ui/DuoImg";
import { DUO } from "@/lib/duoAssets";

export const NAV_ITEMS = [
  { href: "/learn", label: "Learn", icon: DUO.nav.learn },
  { href: "/sounds", label: "Sounds", icon: DUO.nav.sounds },
  { href: "/practice-hub", label: "Practice", icon: DUO.nav.practice },
  { href: "/leaderboard", label: "Leaderboards", icon: DUO.nav.leaderboards },
  { href: "/quests", label: "Quests", icon: DUO.nav.quests },
  { href: "/shop", label: "Shop", icon: DUO.nav.shop },
  { href: "/profile", label: "Profile", icon: DUO.nav.profile },
  { href: "/settings", label: "More", icon: DUO.nav.more },
] as const;

/** The guidebook is part of the Learn tab, as on Duolingo. */
function isActive(pathname: string, href: string) {
  return pathname.startsWith(href) || (href === "/learn" && pathname.startsWith("/guidebook"));
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return compact ? <DuoImg src={DUO.logoCompact} width={32} alt="duolingo" /> : <DuoImg src={DUO.logo} width={128} height={30} alt="duolingo" />;
}

function NavIcon({ item, size }: { item: (typeof NAV_ITEMS)[number]; size: number }) {
  const { me } = useUser();
  // Signed in, the Profile tab shows the learner's own avatar instead of the generic icon.
  if (item.href === "/profile" && me) return <OwnAvatar name={me.display_name} size={size} />;
  return <DuoImg src={item.icon} width={size} />;
}

// Duolingo's mobile tab bar keeps only the core five tabs.
const MOBILE_HIDDEN: string[] = ["/settings", "/sounds", "/practice-hub"];

/** "Want to learn chess?" promo at the bottom of the sidebar. */
function ChessPromo() {
  const toast = useToast();
  return (
    <div className="mt-6 hidden flex-col items-center rounded-2xl border-2 border-line px-4 py-5 text-center lg:flex">
      <DuoImg src={DUO.chessPromo} width={64} height={52} />
      <p className="mt-3 text-[19px] font-extrabold">Want to learn chess?</p>
      <p className="mt-1 text-[15px] font-semibold">Duolingo makes it easy!</p>
      <button
        onClick={() => toast({ title: "Chess is coming soon" })}
        className="mt-4 text-[15px] font-extrabold uppercase tracking-[0.8px] text-macaw hover:brightness-110"
      >
        Try chess
      </button>
    </div>
  );
}

// Signed-in learners see only the English Test here (the Podcast link is guest-only).
const MORE_FEATURED = [{ label: "Duolingo English Test", icon: DUO.more.englishTest, href: "https://englishtest.duolingo.com/" }];

/**
 * Duolingo's MORE item opens a hover menu to its right. The sidebar scrolls (and so
 * clips overflow), so the menu is positioned against the viewport instead.
 */
function MoreMenu({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const soon = (label: string) => toast({ title: `${label} is coming soon` });
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const place = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.top - 10, left: r.right - 8 });
  };
  const row = "flex w-full items-center pl-5 pr-10 text-left text-[15px] font-bold uppercase text-muted hover:bg-surface-2";
  return (
    <div className="group relative" onMouseEnter={place}>
      {children}
      <div
        className="invisible fixed z-50 pl-4 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
        style={pos ?? undefined}
      >
        <div className="w-[290px] overflow-hidden rounded-[15px] border-2 border-line bg-bg py-2">
          {MORE_FEATURED.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={`${row} h-[52px] gap-5 tracking-[0.8px]`}>
              <DuoImg src={item.icon} width={32} />
              {item.label}
            </a>
          ))}
          <div className="my-2 h-0.5 bg-line" />
          <Link href="/settings" className={`${row} h-10`}>
            Settings
          </Link>
          <Link href="/help" className={`${row} h-10`}>
            Help
          </Link>
          <button onClick={() => soon("Logging out")} className={`${row} h-10`}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-scrollbar sticky top-0 z-30 hidden h-screen shrink-0 flex-col overflow-y-auto border-r-2 border-line px-3 py-6 md:flex md:w-[88px] lg:w-[256px] lg:px-4">
      <Link href="/learn" className="mb-6 flex h-12 items-center justify-center lg:justify-start lg:px-4">
        <span className="hidden lg:inline">
          <Logo />
        </span>
        <span className="lg:hidden">
          <Logo compact />
        </span>
      </Link>
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const link = (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex h-[52px] items-center justify-center gap-5 rounded-xl border-2 px-3 text-[15px] font-extrabold uppercase leading-[25px] tracking-[0.8px] transition-colors lg:justify-start lg:px-4 ${
                active ? "border-sel-line bg-sel text-macaw" : "border-transparent text-muted hover:bg-surface-2"
              }`}
            >
              <NavIcon item={item} size={32} />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
          return item.href === "/settings" ? <MoreMenu key={item.href}>{link}</MoreMenu> : link;
        })}
      </nav>
      <ChessPromo />
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t-2 border-line bg-bg md:hidden">
      {/* Duolingo's mobile tab bar has no MORE tab (settings live under Profile). */}
      {NAV_ITEMS.filter((item) => !MOBILE_HIDDEN.includes(item.href)).map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${
              active ? "border-sel-line bg-sel" : "border-transparent"
            }`}
          >
            <NavIcon item={item} size={30} />
          </Link>
        );
      })}
    </nav>
  );
}
