"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/ToastProvider";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/Button";
import { DuoImg } from "@/components/ui/DuoImg";
import { DUO } from "@/lib/duoAssets";

interface PracticeCard {
  title: string;
  body: string;
  image: string;
  /** Image size in px; the art bleeds off the card's right edge like on Duolingo. */
  size: [number, number];
  super?: boolean;
  href?: string;
}

const CONVERSATION: PracticeCard[] = [
  { title: "Speak", body: "Improve your speaking skills with these phrases", image: DUO.practiceHub.speak, size: [66, 89], super: true },
  { title: "Listen", body: "Boost your listening skills with an audio-only session", image: DUO.practiceHub.listen, size: [99, 106], super: true },
];

const COLLECTIONS: PracticeCard[] = [
  // Duolingo's Super-only mistakes review; here it starts a regular practice session.
  { title: "Mistakes", body: "Start a personalized lesson to practice your mistakes", image: DUO.practiceHub.mistakes, size: [94, 98], super: true, href: "/practice" },
  { title: "Stories", body: "Reread a story to review words in context", image: DUO.practiceHub.stories, size: [110, 101] },
];

/** Practice hub: Duolingo's "Today's Review" banner plus practice collections. */
export default function PracticeHubPage() {
  const { me } = useUser();
  if (!me) return null;

  return (
    <div className="px-4 pb-10 pt-6 min-[1100px]:!px-0">
      <h1 className="text-[25px] font-bold leading-[30px]">Today’s Review</h1>
      <TargetPractice />

      <h2 className="mt-12 text-[25px] font-bold leading-[30px]">Conversation</h2>
      <div className="mt-6 flex flex-col gap-4">
        {CONVERSATION.map((card) => (
          <PracticeRow key={card.title} card={card} />
        ))}
      </div>

      <h2 className="mt-12 text-[25px] font-bold leading-[30px]">Your collections</h2>
      <div className="mt-6 flex flex-col gap-4">
        {COLLECTIONS.map((card) => (
          <PracticeRow key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}

/** The big gradient "Target Practice" banner (a Super feature, so UNLOCK only explains it's unavailable). */
function TargetPractice() {
  const toast = useToast();
  return (
    <section
      className="relative mt-6 min-h-[300px] overflow-hidden rounded-[18px] p-6 text-white"
      style={{ background: "linear-gradient(165deg, #0d5560 0%, #13306f 48%, #4a2387 100%)" }}
    >
      <div className="relative z-10 flex h-full min-h-[252px] max-w-[62%] flex-col">
        <DuoImg src={DUO.superBadge} width={87} height={23} alt="Super" />
        <h3 className="mt-3 text-[25px] font-bold leading-[30px]">Target Practice</h3>
        <p className="mt-4 text-[19px] font-medium leading-[26px] text-white/95">Tackle weak areas with this customized session</p>
        <Button
          variant="white"
          textColor="#3C2B9F"
          className="mt-auto w-fit !px-4"
          onClick={() => toast({ title: "Super is coming soon", body: "Subscriptions aren't available in this demo." })}
        >
          Unlock
        </Button>
      </div>
      <div className="absolute bottom-0 right-0">
        <DuoImg src={DUO.practiceHub.targetPractice} width={164} height={253} />
      </div>
    </section>
  );
}

function PracticeRow({ card }: { card: PracticeCard }) {
  const router = useRouter();
  const toast = useToast();
  const [w, h] = card.size;
  return (
    <button
      onClick={() => (card.href ? router.push(card.href) : toast({ title: `${card.title} practice is coming soon` }))}
      className="tile relative flex min-h-[114px] items-center overflow-hidden rounded-2xl bg-bg py-5 pl-5 pr-24 text-left hover:bg-surface-2"
    >
      <div className="relative z-10">
        <p className="flex items-center gap-3 text-[19px] font-bold leading-[24px]">
          {card.title}
          {card.super && <DuoImg src={DUO.superBadge} width={75} height={20} alt="Super" />}
        </p>
        <p className="mt-2 text-[17px] font-medium leading-[24px] text-muted">{card.body}</p>
      </div>
      <div className="absolute -right-2 top-1/2 -translate-y-1/2">
        <DuoImg src={card.image} width={w} height={h} />
      </div>
    </button>
  );
}
