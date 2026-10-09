"use client";

import { useState } from "react";
import { useToast } from "../providers/ToastProvider";
import { useUser } from "../providers/UserProvider";
import { Avatar, OwnAvatar } from "../ui/Avatar";
import { DuoImg } from "../ui/DuoImg";
import { api } from "@/lib/api";
import { DUO } from "@/lib/duoAssets";
import { STATUS_CODES, type StatusCode } from "@/lib/types";

/** The two Duo faces sit on green tiles in Duolingo's picker. */
const GREEN_TILES = new Set<StatusCode>(["sunglasses", "angry"]);

export function StatusEmoji({ status, size }: { status: StatusCode; size: number }) {
  const { me } = useUser();
  const src = status === "flag" ? (DUO.flags[me?.course?.learning_language ?? "es"] ?? DUO.flags.es) : DUO.status[status];
  return <DuoImg src={src} width={size} height={size} className="object-contain" alt={status} />;
}

/** Avatar with the learner's status emoji pinned to its top-right corner. */
export function StatusAvatar({ name, color, status, size, own = false }: { name: string; color: string; status: StatusCode | null; size: number; own?: boolean }) {
  return (
    <div className="relative shrink-0">
      {own ? <OwnAvatar name={name} size={size} /> : <Avatar name={name} color={color} size={size} />}
      {status && (
        <span className="absolute -right-2 -top-2">
          <StatusEmoji status={status} size={Math.round(size * 0.55)} />
        </span>
      )}
    </div>
  );
}

/** "Set your status" card shown beside the leaderboard. */
export function StatusCard() {
  const { me, setMe } = useUser();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  if (!me) return null;

  const save = async (status: StatusCode | null) => {
    if (saving) return;
    setSaving(true);
    try {
      setMe(await api.setStatus(status));
    } catch {
      toast({ title: "Couldn't update your status", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-line p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[19px] font-bold">Set your status</h3>
        <button
          onClick={() => void save(null)}
          disabled={!me.status}
          className="text-[15px] font-bold uppercase tracking-[0.8px] text-macaw transition hover:brightness-110 disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <div className="relative mx-auto my-6 w-fit">
        <OwnAvatar name={me.display_name} size={96} />
        {/* Online dot sits on the dashed ring at 4:30. */}
        <span className="absolute bottom-[7px] right-[7px] h-[14px] w-[14px] translate-x-1/2 translate-y-1/2 rounded-full bg-feather" />
        {me.status && (
          <span className="absolute -right-[30px] -top-[14px] flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white">
            {/* Speech-bubble tail pointing back at the avatar. */}
            <span className="absolute -bottom-[3px] left-[4px] h-4 w-4 rotate-[25deg] rounded-[3px] bg-white" />
            <span className="relative">
              <StatusEmoji status={me.status} size={36} />
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {STATUS_CODES.map((code) => {
          const selected = me.status === code;
          return (
            <button
              key={code}
              onClick={() => void save(code)}
              aria-label={`Set status ${code}`}
              aria-pressed={selected}
              className={`tile flex aspect-square items-center justify-center rounded-xl ${
                selected ? "!border-sel-line bg-sel" : GREEN_TILES.has(code) ? "!border-feather-dark bg-feather" : "bg-bg hover:bg-surface-2"
              }`}
            >
              <StatusEmoji status={code} size={30} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
