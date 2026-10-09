"use client";

import { useCallback, useEffect, useState } from "react";
import { DuoImg } from "@/components/ui/DuoImg";
import { DUO } from "@/lib/duoAssets";
import { useToast } from "@/components/providers/ToastProvider";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { api, ApiError } from "@/lib/api";
import type { ShopItem } from "@/lib/types";

const ICONS: Record<string, React.ReactNode> = {
  heart: <DuoImg src={DUO.shopHeart} width={100} />,
  freeze: <DuoImg src={DUO.shopFreeze} width={100} />,
};

/** Duolingo's Super pink, used for "FREE TRIAL". */
const SUPER_PINK = "#E33CD9";

export default function ShopPage() {
  const { me, setMe } = useUser();
  const toast = useToast();
  const [items, setItems] = useState<ShopItem[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    api.shopItems().then(setItems).catch(() => setItems([]));
  }, []);
  useEffect(load, [load, me?.hearts, me?.streak_freezes]);

  const buy = async (item: ShopItem) => {
    setBusy(item.id);
    try {
      setMe(await api.purchase(item.id));
      toast({ title: `${item.title} purchased!`, icon: ICONS[item.icon], tone: "success" });
    } catch (e) {
      toast({ title: e instanceof ApiError ? e.message : "Purchase failed", tone: "error" });
    } finally {
      setBusy(null);
    }
  };
  const superSoon = () => toast({ title: "Super is coming soon", body: "Subscriptions aren't available in this demo." });

  if (!items || !me) return <LoadingScreen />;
  const item = (id: ShopItem["id"]) => items.find((i) => i.id === id);
  const refill = item("heart_refill");
  const freeze = item("streak_freeze");

  const action = (it: ShopItem) =>
    it.available ? (
      <Button
        variant="outline"
        textColor="var(--macaw)"
        disabled={busy === it.id || me.gems < it.price}
        onClick={() => buy(it)}
        className="w-full"
      >
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          Get for:
          <DuoImg src={DUO.gem} width={20} height={22} />
          {it.price}
        </span>
      </Button>
    ) : (
      // Duolingo keeps unavailable items outlined, with the label greyed out ("FULL", "EQUIPPED").
      <span className="flex h-[50px] w-full items-center justify-center rounded-2xl border-2 border-line text-[15px] font-bold uppercase tracking-[0.8px] text-[var(--swan)]">
        {it.reason}
      </span>
    );

  return (
    <div className="px-4 pt-6 min-[1100px]:!px-0">
      <SuperBanner onStart={superSoon} />

      <h2 className="mb-6 mt-10 text-2xl font-bold leading-[26px]">Hearts</h2>
      <ul>
        {refill && <ShopRow icon={ICONS.heart} title={refill.title} description={refill.description} action={action(refill)} />}
        <ShopRow
          icon={<DuoImg src={DUO.popover.heartUnlimited} width={84} />}
          title="Unlimited Hearts"
          description="Never run out of hearts with Super!"
          action={
            <Button variant="outline" textColor={SUPER_PINK} onClick={superSoon} className="w-full">
              Free trial
            </Button>
          }
        />
      </ul>

      <h2 className="mb-6 mt-10 text-2xl font-bold leading-[26px]">Power-Ups</h2>
      <ul>
        {freeze && (
          <ShopRow
            icon={ICONS.freeze}
            title={freeze.title}
            badge={freeze.owned !== null ? `${freeze.owned} / 2 equipped` : undefined}
            description={freeze.description}
            action={action(freeze)}
          />
        )}
      </ul>
    </div>
  );
}

function ShopRow({
  icon,
  title,
  badge,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-[10px] border-t-2 border-line py-5">
      <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center">{icon}</div>
      {/* As on Duolingo, the button sits beside the title and the description runs full width beneath. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1 py-2">
            <span className="text-[19px] font-bold leading-5">{title}</span>
            {badge && (
              <span className="rounded-2xl bg-surface-2 p-2 text-[15px] font-bold uppercase leading-none text-feather">{badge}</span>
            )}
          </div>
          <div className="w-[158px] shrink-0">{action}</div>
        </div>
        <p className="text-[17px] font-medium leading-[30px] text-muted">{description}</p>
      </div>
    </li>
  );
}

/** "Start a 1 week free trial" Super banner at the top of the shop. */
function SuperBanner({ onStart }: { onStart: () => void }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl px-5 pb-5 pt-4 text-white"
      style={{ background: "linear-gradient(170deg, #0d5560 0%, #13306f 50%, #4a2387 100%)" }}
    >
      <div className="absolute right-4 top-3">
        <DuoImg src={DUO.superBadge} width={75} height={20} alt="Super" />
      </div>
      <div className="flex items-center gap-5 pr-16">
        <DuoImg src={DUO.superDuo} width={92} height={86} />
        <p className="text-[22px] font-bold leading-[30px]">Start a 1 week free trial to enjoy exclusive Super benefits</p>
      </div>
      <Button variant="white" textColor="#131F24" full onClick={onStart} className="mt-5">
        Start my free 7 days
      </Button>
    </section>
  );
}
