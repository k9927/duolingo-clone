"use client";

import { useCallback, useState } from "react";
import { useToast } from "../providers/ToastProvider";
import { useUser } from "../providers/UserProvider";
import { ApiError } from "@/lib/api";
import type { Me } from "@/lib/types";

export function SettingsTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[26px] font-bold">{children}</h1>;
}

/** Section heading with Duolingo's rule underneath. */
export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="border-b-2 border-line pb-3 text-[21px] font-bold">{title}</h2>
      <div className="pt-3">{children}</div>
    </section>
  );
}

/** Duolingo's switch: a blue pill with a square knob that slides right when on. */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-[60px] shrink-0 rounded-[10px] transition-colors ${checked ? "bg-macaw" : "bg-line"}`}
    >
      <span
        className={`absolute top-0 h-8 w-8 rounded-[10px] border-2 bg-bg transition-all ${checked ? "left-[28px] border-macaw" : "left-0 border-line"}`}
      />
    </button>
  );
}

export function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-[19px] font-bold">{label}</span>
      <Toggle label={label} checked={checked} onChange={onChange} />
    </div>
  );
}

/** Full-width dropdown styled like Duolingo's (uppercase value, chevron, 3D bottom edge). */
export function SettingsSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block py-3">
      <span className="text-[19px] font-bold">{label}</span>
      <span className="relative mt-3 block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-[52px] w-full cursor-pointer appearance-none rounded-2xl border-2 border-b-4 border-line bg-bg px-4 text-[15px] font-bold uppercase tracking-[0.8px] outline-none focus:border-sel-line"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2" width="16" height="10" viewBox="0 0 16 10" aria-hidden>
          <path d="M2 2l6 6 6-6" stroke="var(--hare)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
    </label>
  );
}

/** Runs a settings/API action, stores the updated learner and reports errors as toasts. */
export function useSettingsAction() {
  const { setMe, refresh } = useUser();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (action: () => Promise<Me | void>, success?: string) => {
      setBusy(true);
      try {
        const updated = await action();
        if (updated) setMe(updated);
        else await refresh();
        if (success) toast({ title: success, tone: "success" });
      } catch (e) {
        toast({ title: e instanceof ApiError ? e.message : "Something went wrong", tone: "error" });
      } finally {
        setBusy(false);
      }
    },
    [setMe, refresh, toast],
  );
  return { run, busy };
}
