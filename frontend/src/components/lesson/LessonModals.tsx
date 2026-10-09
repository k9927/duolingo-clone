"use client";

import { GemIcon, HeartIcon } from "../icons";
import { Owl } from "../mascot/Owl";
import { DuoImg } from "../ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export function QuitModal({ open, onStay, onQuit }: { open: boolean; onStay: () => void; onQuit: () => void }) {
  return (
    <Modal open={open} onClose={onStay} variant="sheet" width="sm:max-w-[400px]">
      <div className="flex flex-col items-center px-2 pt-4 text-center">
        <DuoImg src={DUO.quitDuo} width={100} height={100} />
        <h2 className="mt-8 text-2xl font-extrabold leading-snug">
          Wait, don&apos;t go! You&apos;ll lose your progress if you quit now
        </h2>
        <div className="mt-8 flex w-full flex-col gap-4">
          <Button variant="secondary" full onClick={onStay} autoFocus>
            Keep learning
          </Button>
          <Button variant="ghost" full textColor="var(--cardinal)" onClick={onQuit}>
            End session
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface OutOfHeartsProps {
  open: boolean;
  gems: number;
  refillCost: number;
  busy: boolean;
  onRefill: () => void;
  onPractice: () => void;
  onQuit: () => void;
}

export function OutOfHeartsModal({ open, gems, refillCost, busy, onRefill, onPractice, onQuit }: OutOfHeartsProps) {
  return (
    <Modal open={open} variant="sheet">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Owl size={110} mood="sad" />
          <HeartIcon size={48} empty className="absolute -right-6 bottom-0 animate-pop" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold">You ran out of hearts!</h2>
        <p className="mt-2 font-semibold text-muted">Refill your hearts or practice to earn them back.</p>
        <div className="mt-6 flex w-full flex-col gap-3">
          <Button variant="outline" full onClick={onRefill} disabled={busy || gems < refillCost} textColor="var(--eel)">
            <span className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2">
                <HeartIcon size={22} /> Refill hearts
              </span>
              <span className="flex items-center gap-1 text-macaw">
                <GemIcon size={18} /> {refillCost}
              </span>
            </span>
          </Button>
          <Button variant="secondary" full onClick={onPractice}>
            Practice to earn hearts
          </Button>
          <div className="rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#1CB0F6] p-3 text-sm font-bold text-white">
            Unlimited hearts with <span className="font-black">Super</span> · coming soon
          </div>
          <Button variant="ghost" full textColor="var(--hare)" onClick={onQuit}>
            No thanks
          </Button>
        </div>
      </div>
    </Modal>
  );
}
