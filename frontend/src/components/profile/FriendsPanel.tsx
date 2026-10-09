"use client";

import { useState } from "react";
import { useToast } from "../providers/ToastProvider";
import { DuoImg } from "../ui/DuoImg";
import { DUO } from "@/lib/duoAssets";

/** Following / Followers tabs shown beside the profile (empty until friends exist). */
export function FollowCard() {
  const [tab, setTab] = useState<"following" | "followers">("following");
  return (
    <section className="overflow-hidden rounded-2xl border-2 border-line">
      <div className="flex border-b-2 border-line">
        {(["following", "followers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-0.5 flex-1 border-b-2 py-4 text-[15px] font-bold uppercase tracking-[0.8px] ${
              tab === t ? "border-macaw text-macaw" : "border-transparent text-faint hover:text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 px-6 py-6 text-center">
        <DuoImg src={DUO.profile.friends} width={260} height={120} className="object-contain" />
        <p className="text-[17px] font-medium text-muted">
          {tab === "following" ? "Learning is more fun and effective when you connect with others." : "No followers yet."}
        </p>
      </div>
    </section>
  );
}

/** "Add friends" card with Find friends / Invite friends rows. */
export function AddFriendsCard() {
  const toast = useToast();
  const rows = [
    { label: "Find friends", icon: DUO.profile.findFriends },
    { label: "Invite friends", icon: DUO.profile.inviteFriends },
  ];
  return (
    <section className="rounded-2xl border-2 border-line">
      <h3 className="px-5 pb-2 pt-5 text-[19px] font-bold">Add friends</h3>
      {rows.map((r) => (
        <button
          key={r.label}
          onClick={() => toast({ title: `${r.label} is coming soon` })}
          className="flex w-full items-center gap-4 border-t-2 border-line px-5 py-4 text-left first-of-type:border-t-0 hover:bg-surface-2"
        >
          <DuoImg src={r.icon} width={40} height={40} className="object-contain" />
          <span className="flex-1 text-[17px] font-bold">{r.label}</span>
          <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden>
            <path d="M2 2l6 6-6 6" stroke="var(--hare)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      ))}
    </section>
  );
}
