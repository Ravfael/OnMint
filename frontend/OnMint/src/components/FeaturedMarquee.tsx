import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface MarqueeCard {
  id: string;
  image: string;
  price: string;
  name: string;
}

interface FeaturedMarqueeProps {
  cards: MarqueeCard[];
}

function MarqueeCardItem({ card, tilt }: { card: MarqueeCard; tilt: number }) {
  return (
    <div
      className="marquee-card group relative bg-gray-900 rounded-2xl border border-white/10 overflow-hidden cursor-pointer shrink-0"
      style={{
        width: "280px", // lebih besar dari 200px
        height: "380px", // lebih besar dari 280px
        transform: `rotate(${tilt}deg)`,
        margin: "0 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 0 40px rgba(168,85,247,0.5), 0 12px 40px rgba(0,0,0,0.8)";
        el.style.transform = `rotate(${tilt}deg) scale(1.06)`;
        el.style.zIndex = "10";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.6)";
        el.style.transform = `rotate(${tilt}deg) scale(1)`;
        el.style.zIndex = "0";
      }}
    >
      {/* Holo overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay rounded-2xl bg-gradient-to-br from-fuchsia-500/30 via-transparent to-blue-500/30" />

      {/* Card image — full height, pure card */}
      <div className="relative w-full h-full bg-black overflow-hidden">
        <img src={card.image} alt={card.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ filter: "brightness(0.65) contrast(1.05)" }} />
      </div>
    </div>
  );
}

export default function FeaturedMarquee({ cards }: FeaturedMarqueeProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Triple cards untuk seamless loop
  const tripled = [...cards, ...cards, ...cards];

  const TILT = 10;

  useGSAP(() => {
    const row = rowRef.current;
    if (!row) return;

    const rowWidth = row.scrollWidth / 3;

    // Start dari kiri (x = -rowWidth), bergerak ke kanan (x = 0), lalu reset
    gsap.set(row, { x: `-${rowWidth}px` });

    tweenRef.current = gsap.to(row, {
      x: "0px",
      duration: 35,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => {
          const val = parseFloat(x) % rowWidth;
          return val > 0 ? val - rowWidth : val;
        }),
      },
    });
  }, []);

  return (
    <div className="relative w-full overflow-hidden" style={{ paddingTop: "80px", paddingBottom: "80px" }} onMouseEnter={() => tweenRef.current?.pause()} onMouseLeave={() => tweenRef.current?.resume()}>
      {/* Fade edges kiri & kanan */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-40" style={{ background: "linear-gradient(to right, #000 0%, transparent 100%)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-40" style={{ background: "linear-gradient(to left, #000 0%, transparent 100%)" }} />

      {/* Single row — LEFT → RIGHT */}
      <div ref={rowRef} className="flex items-center" style={{ willChange: "transform" }}>
        {tripled.map((card, i) => (
          <MarqueeCardItem key={`r-${i}`} card={card} tilt={TILT} />
        ))}
      </div>
    </div>
  );
}
