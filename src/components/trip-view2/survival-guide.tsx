"use client";

import { SurvivalTip } from "@/lib/types";

interface SurvivalGuideProps {
  tips: SurvivalTip[];
}

const categoryEmoji: Record<string, string> = {
  "7-eleven": "🛒",
  vegetarian: "🥗",
  transport: "🚕",
  money: "💰",
  toddler: "👶",
  senior: "👵",
};

export function SurvivalGuide({ tips }: SurvivalGuideProps) {
  if (!tips.length) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="max-w-6xl mx-auto px-4 relative">
        <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
          🛡️ Travel{" "}
          <span className="text-gold">Survival Guide</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors shadow-lg"
            >
              <h3 className="text-gold font-semibold mb-4 flex items-center gap-3 pb-3 border-b border-white/10">
                <span className="text-2xl bg-white/10 p-2 rounded-xl">{categoryEmoji[tip.category] || "📌"}</span>
                <span className="text-lg">{tip.title}</span>
              </h3>
              <ul className="space-y-3">
                {tip.tips.map((item, i) => (
                  <li
                    key={i}
                    className="text-white/90 text-sm pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-gold leading-relaxed"
                  >
                    {item.includes(":") ? (
                      <>
                        <strong className="text-white font-semibold">
                          {item.split(":")[0]}:
                        </strong>
                        {item.split(":").slice(1).join(":")}
                      </>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
