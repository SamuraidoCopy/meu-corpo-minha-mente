"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QUIZ_COPY } from "@/lib/quiz-copy";

type ElementOrbitItem = {
  name: string;
  asset: string;
  tone: string;
};

type StackFeatureSectionProps = {
  onStart?: () => void;
};

const orbitItems: ElementOrbitItem[] = [
  { name: "Madeira", asset: "/assets/icons/element-wood.svg", tone: "bg-emerald-50 text-emerald-800" },
  { name: "Fogo", asset: "/assets/icons/element-fire.svg", tone: "bg-red-50 text-red-800" },
  { name: "Terra", asset: "/assets/icons/element-earth.svg", tone: "bg-amber-50 text-amber-900" },
  { name: "Metal", asset: "/assets/icons/element-metal.svg", tone: "bg-slate-100 text-slate-800" },
  { name: "Água", asset: "/assets/icons/element-water.svg", tone: "bg-blue-50 text-blue-800" },
];

export default function StackFeatureSection({ onStart }: StackFeatureSectionProps) {
  const orbits = [
    { size: "16rem", duration: "24s", items: [orbitItems[1], orbitItems[4]] },
    { size: "24rem", duration: "34s", items: [orbitItems[0], orbitItems[2]] },
    { size: "32rem", duration: "46s", items: [orbitItems[3]] },
  ];

  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center overflow-hidden rounded-[2rem] bg-white/80 shadow-2xl ring-1 ring-white/70 md:min-h-[34rem] md:grid-cols-[0.94fr_1.06fr]">
      <div className="relative z-10 space-y-7 px-6 py-10 md:px-10 lg:px-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          <Sparkles className="h-4 w-4 text-wellness-gold" />
          {QUIZ_COPY.intro.eyebrow}
        </div>

        <div className="space-y-5">
          <h1 className="font-serif text-5xl leading-[1.04] text-slate-900 md:text-7xl">
            {QUIZ_COPY.intro.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-700 md:text-xl">
            {QUIZ_COPY.intro.description}
          </p>
        </div>

        <div>
          <Button
            onClick={onStart}
            className="h-16 rounded-full bg-wellness-gold px-8 text-base font-bold uppercase tracking-wide text-white shadow-xl shadow-wellness-gold/25 transition-all hover:scale-[1.02] hover:bg-wellness-gold/90 active:scale-95 md:text-lg"
          >
            {QUIZ_COPY.intro.cta}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative h-[20rem] overflow-hidden md:h-full">
        <div className="absolute inset-0 bg-gradient-to-l from-wellness-cream via-white/20 to-transparent" />
        <div className="absolute left-1/2 top-1/2 flex h-[34rem] w-[34rem] -translate-x-[28%] -translate-y-1/2 items-center justify-center md:h-[42rem] md:w-[42rem] md:-translate-x-[36%]">
          <div className="relative z-20 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-2xl ring-1 ring-wellness-sage/20">
            <Image
              src="/images/logo-mapa-raiz.png"
              alt="O Mapa da Raiz"
              width={92}
              height={92}
              className="h-16 w-20 object-contain"
              priority
            />
          </div>

          {orbits.map((orbit, orbitIdx) => {
            const angleStep = (2 * Math.PI) / orbit.items.length;

            return (
              <div
                key={orbitIdx}
                className="mcmm-orbit-ring absolute rounded-full border border-dotted border-wellness-sage/35"
                style={{
                  width: orbit.size,
                  height: orbit.size,
                  animation: `mcmm-orbit-spin ${orbit.duration} linear infinite`,
                }}
              >
                {orbit.items.map((item, itemIdx) => {
                  const angle = itemIdx * angleStep + orbitIdx * 0.55;
                  const x = 50 + 50 * Math.cos(angle);
                  const y = 50 + 50 * Math.sin(angle);

                  return (
                    <div
                      key={`${item.name}-${itemIdx}`}
                      className={`absolute flex h-16 w-16 items-center justify-center rounded-full p-2 shadow-lg ring-1 ring-white/70 ${item.tone}`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      aria-label={`Elemento ${item.name}`}
                    >
                      <Image
                        src={item.asset}
                        alt=""
                        width={48}
                        height={48}
                        className="h-11 w-11 object-contain"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
