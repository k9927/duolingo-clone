"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "../providers/ToastProvider";

interface NavItem {
  label: string;
  href?: string;
}

// Duolingo's settings menu, card by card; items without a page show a "coming soon" toast.
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Account",
    items: [
      { label: "Preferences", href: "/settings" },
      { label: "Profile", href: "/settings/profile" },
      { label: "Notifications" },
      { label: "Courses" },
      { label: "Score on LinkedIn" },
      { label: "Duolingo for Schools" },
      { label: "Social accounts" },
      { label: "Privacy settings" },
    ],
  },
  { title: "Subscription", items: [{ label: "Choose a plan" }] },
  { title: "Support", items: [{ label: "Help Center", href: "/help" }] },
];

/** Settings menu shown in the right panel on /settings pages. */
export function SettingsNav() {
  const pathname = usePathname();
  const toast = useToast();
  const row = "block w-full rounded-xl px-[26px] py-2 text-left text-[17px] font-bold leading-6 transition hover:bg-line";
  return (
    <nav className="flex flex-col gap-[15px]" aria-label="Settings">
      {GROUPS.map((g) => (
        <section key={g.title} className="rounded-2xl border-2 border-line px-[14px] pb-[22px] pt-[18px]">
          <h2 className="px-[26px] pb-3 text-[21px] font-bold">{g.title}</h2>
          {g.items.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={row}>
                {item.label}
              </Link>
            ) : (
              <button key={item.label} onClick={() => toast({ title: `${item.label} is coming soon` })} className={row}>
                {item.label}
              </button>
            ),
          )}
        </section>
      ))}
    </nav>
  );
}
