"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import {
  Seashell,
  Starfish,
  Coconut,
  CoconutDrink,
  Sunglasses,
  BeachBall,
  FlipFlop,
  BeachUmbrella,
} from "./trip-hero-vibes";

interface BeachSectionsWrapperProps {
  children: ReactNode;
}

// Simple wrapper - no fixed floating elements anymore
export function BeachSectionsWrapper({ children }: BeachSectionsWrapperProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}

// Hook for section-specific scroll position (only active when in view)
function useSectionScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    const handleScroll = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Calculate progress: 0 when section enters, 1 when it leaves
      const progress = Math.max(0, Math.min(1,
        (viewportHeight - rect.top) / (viewportHeight + sectionHeight)
      ));

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { sectionRef, scrollProgress, isInView };
}

// Beach-themed SVG patterns - base opacity, actual opacity applied dynamically based on background
const beachPatterns = {
  // White stroke patterns for dark/medium backgrounds
  waves: `url("data:image/svg+xml,%3Csvg width='120' height='40' viewBox='0 0 120 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q30 8 60 20 T120 20' stroke='%23ffffff' stroke-width='2.5' fill='none' opacity='0.6'/%3E%3Cpath d='M0 30 Q30 18 60 30 T120 30' stroke='%23ffffff' stroke-width='2' fill='none' opacity='0.5'/%3E%3C/svg%3E")`,
  dots: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='3' fill='%23ffffff' opacity='0.5'/%3E%3C/svg%3E")`,
  shells: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q45 18 45 35 Q45 52 30 55 Q15 52 15 35 Q15 18 30 8' stroke='%23ffffff' stroke-width='2' fill='none' opacity='0.5'/%3E%3Cpath d='M30 8 L30 55' stroke='%23ffffff' stroke-width='1.5' fill='none' opacity='0.4'/%3E%3C/svg%3E")`,
  starfish: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5 L28 18 L42 18 L31 27 L35 42 L25 33 L15 42 L19 27 L8 18 L22 18 Z' stroke='%23ffffff' stroke-width='1.5' fill='none' opacity='0.45'/%3E%3C/svg%3E")`,
  // Teal/colored stroke patterns for light backgrounds
  wavesLight: `url("data:image/svg+xml,%3Csvg width='120' height='40' viewBox='0 0 120 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q30 8 60 20 T120 20' stroke='%230d9488' stroke-width='2.5' fill='none' opacity='0.25'/%3E%3Cpath d='M0 30 Q30 18 60 30 T120 30' stroke='%230d9488' stroke-width='2' fill='none' opacity='0.18'/%3E%3C/svg%3E")`,
  dotsLight: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='3' fill='%230d9488' opacity='0.2'/%3E%3C/svg%3E")`,
  shellsLight: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8 Q45 18 45 35 Q45 52 30 55 Q15 52 15 35 Q15 18 30 8' stroke='%230d9488' stroke-width='2' fill='none' opacity='0.2'/%3E%3Cpath d='M30 8 L30 55' stroke='%230d9488' stroke-width='1.5' fill='none' opacity='0.15'/%3E%3C/svg%3E")`,
  palm: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 70 L40 30 Q25 15 10 20 M40 30 Q55 15 70 20 M40 35 Q20 25 5 35 M40 35 Q60 25 75 35' stroke='%230d9488' stroke-width='2' fill='none' opacity='0.2'/%3E%3C/svg%3E")`,
  sand: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='8' cy='8' r='2' fill='%23d97706' opacity='0.35'/%3E%3Ccircle cx='28' cy='15' r='1.5' fill='%23d97706' opacity='0.25'/%3E%3Ccircle cx='15' cy='30' r='2' fill='%23d97706' opacity='0.35'/%3E%3Ccircle cx='35' cy='35' r='1.5' fill='%23d97706' opacity='0.25'/%3E%3C/svg%3E")`,
};

// Section backgrounds with gradients and patterns
// isDark: true for dark backgrounds (700-900 shades), false for light (50-400 shades), "medium" for mid-tones (500-600)
const sectionBackgrounds: Record<string, {
  gradient: string;
  pattern: string;
  elementColor: string;
  isDark: boolean | "medium";
}> = {
  flights: {
    gradient: "bg-gradient-to-br from-slate-700 via-cyan-800 to-teal-800",
    pattern: beachPatterns.waves,
    elementColor: "text-white/70",
    isDark: true,
  },
  hotels: {
    gradient: "bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-600",
    pattern: beachPatterns.shells,
    elementColor: "text-white/65",
    isDark: "medium",
  },
  todos: {
    gradient: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500",
    pattern: beachPatterns.starfish,
    elementColor: "text-white/70",
    isDark: "medium",
  },
  itinerary: {
    gradient: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100",
    pattern: beachPatterns.palm,
    elementColor: "text-teal-600/60",
    isDark: false,
  },
  survival: {
    gradient: "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600",
    pattern: beachPatterns.waves,
    elementColor: "text-white/70",
    isDark: "medium",
  },
  phrases: {
    gradient: "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600",
    pattern: beachPatterns.dots,
    elementColor: "text-white/70",
    isDark: "medium",
  },
  packing: {
    gradient: "bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100",
    pattern: beachPatterns.shellsLight,
    elementColor: "text-amber-700/60",
    isDark: false,
  },
  documents: {
    gradient: "bg-gradient-to-br from-slate-700 via-gray-800 to-slate-800",
    pattern: beachPatterns.shells,
    elementColor: "text-white/65",
    isDark: true,
  },
  emergency: {
    gradient: "bg-gradient-to-br from-rose-500 via-red-500 to-rose-600",
    pattern: beachPatterns.waves,
    elementColor: "text-white/70",
    isDark: "medium",
  },
};

// Calculate pattern opacity based on background darkness
// Dark backgrounds need very subtle patterns, light backgrounds can have more visible ones
function getPatternOpacity(isDark: boolean | "medium"): number {
  if (isDark === true) return 0.12;      // Very subtle for dark backgrounds (700-900)
  if (isDark === "medium") return 0.35;  // Moderate for mid-tone backgrounds (500-600)
  return 1;                               // Full opacity for light backgrounds (50-400)
}

// Section decorator component with section-specific parallax and patterned backgrounds
export function BeachSectionDecorator({
  children,
  variant = "default"
}: {
  children: ReactNode;
  variant?: "default" | "flights" | "hotels" | "itinerary" | "survival" | "packing" | "todos" | "phrases" | "documents" | "emergency";
}) {
  const { sectionRef, scrollProgress, isInView } = useSectionScroll();

  // Convert scroll progress to a larger value for noticeable parallax effect
  const parallaxValue = isInView ? scrollProgress * 400 : 0;

  const bg = sectionBackgrounds[variant];
  const elementColor = bg?.elementColor || "text-white/40";

  const getDecorations = () => {
    if (!isInView) return null;

    // Elements are VISIBLE now - higher opacity, shown on all screens
    switch (variant) {
      case "flights":
        return (
          <>
            <Seashell
              className={`absolute top-[20%] right-[8%] ${elementColor} w-16 h-16 md:w-20 md:h-20`}
              scrollY={parallaxValue}
              speed={0.2}
              rotateSpeed={0.05}
            />
            <Starfish
              className={`absolute bottom-[25%] left-[6%] ${elementColor} w-14 h-14 md:w-18 md:h-18`}
              scrollY={parallaxValue}
              speed={0.15}
              rotateSpeed={0.08}
            />
            <CoconutDrink
              className={`absolute top-[50%] left-[4%] ${elementColor} w-12 h-12 md:w-16 md:h-16 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.12}
              swaySpeed={0.02}
            />
          </>
        );
      case "hotels":
        return (
          <>
            <BeachUmbrella
              className={`absolute top-[15%] left-[5%] ${elementColor} w-16 h-16 md:w-24 md:h-24`}
              scrollY={parallaxValue}
              speed={0.15}
              swaySpeed={0.02}
            />
            <FlipFlop
              className={`absolute bottom-[20%] right-[6%] ${elementColor} w-14 h-14 md:w-18 md:h-18`}
              scrollY={parallaxValue}
              speed={0.18}
              isLeft={false}
            />
            <Sunglasses
              className={`absolute top-[55%] right-[4%] ${elementColor} w-12 h-12 md:w-16 md:h-16 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.12}
            />
          </>
        );
      case "todos":
        return (
          <>
            <BeachBall
              className={`absolute top-[18%] left-[5%] ${elementColor} w-14 h-14 md:w-20 md:h-20`}
              scrollY={parallaxValue}
              speed={0.2}
              rotateSpeed={0.12}
            />
            <CoconutDrink
              className={`absolute bottom-[22%] right-[6%] ${elementColor} w-12 h-12 md:w-16 md:h-16`}
              scrollY={parallaxValue}
              speed={0.15}
              swaySpeed={0.03}
            />
            <Starfish
              className={`absolute top-[60%] left-[8%] ${elementColor} w-10 h-10 md:w-14 md:h-14 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.1}
              rotateSpeed={0.06}
            />
          </>
        );
      case "itinerary":
        // Larger section - more elements
        return (
          <>
            <Starfish
              className={`absolute top-[10%] right-[5%] ${elementColor} w-16 h-16 md:w-24 md:h-24`}
              scrollY={parallaxValue}
              speed={0.18}
              rotateSpeed={0.06}
            />
            <Seashell
              className={`absolute top-[25%] left-[4%] ${elementColor} w-14 h-14 md:w-20 md:h-20`}
              scrollY={parallaxValue}
              speed={0.14}
              rotateSpeed={-0.04}
            />
            <Coconut
              className={`absolute top-[45%] right-[6%] ${elementColor} w-12 h-12 md:w-16 md:h-16 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.12}
              swaySpeed={0.02}
            />
            <BeachUmbrella
              className={`absolute top-[60%] left-[5%] ${elementColor} w-14 h-14 md:w-18 md:h-18 hidden md:block`}
              scrollY={parallaxValue}
              speed={0.1}
              swaySpeed={0.015}
            />
            <FlipFlop
              className={`absolute bottom-[15%] right-[8%] ${elementColor} w-10 h-10 md:w-14 md:h-14 hidden lg:block`}
              scrollY={parallaxValue}
              speed={0.16}
              isLeft={true}
            />
          </>
        );
      case "survival":
        return (
          <>
            <Coconut
              className={`absolute top-[18%] right-[5%] ${elementColor} w-14 h-14 md:w-20 md:h-20`}
              scrollY={parallaxValue}
              speed={0.15}
              swaySpeed={0.025}
            />
            <BeachBall
              className={`absolute bottom-[25%] left-[6%] ${elementColor} w-12 h-12 md:w-16 md:h-16`}
              scrollY={parallaxValue}
              speed={0.18}
              rotateSpeed={0.1}
            />
            <Sunglasses
              className={`absolute top-[55%] left-[4%] ${elementColor} w-10 h-10 md:w-14 md:h-14 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.12}
            />
          </>
        );
      case "phrases":
        return (
          <>
            <CoconutDrink
              className={`absolute top-[15%] left-[5%] ${elementColor} w-14 h-14 md:w-20 md:h-20`}
              scrollY={parallaxValue}
              speed={0.15}
              swaySpeed={0.025}
            />
            <Starfish
              className={`absolute bottom-[20%] right-[6%] ${elementColor} w-12 h-12 md:w-18 md:h-18`}
              scrollY={parallaxValue}
              speed={0.2}
              rotateSpeed={-0.06}
            />
            <Seashell
              className={`absolute top-[50%] right-[4%] ${elementColor} w-10 h-10 md:w-14 md:h-14 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.12}
              rotateSpeed={0.04}
            />
          </>
        );
      case "packing":
        // Larger section - more elements
        return (
          <>
            <Seashell
              className={`absolute top-[12%] right-[5%] ${elementColor} w-16 h-16 md:w-22 md:h-22`}
              scrollY={parallaxValue}
              speed={0.18}
              rotateSpeed={0.05}
            />
            <Coconut
              className={`absolute top-[30%] left-[4%] ${elementColor} w-14 h-14 md:w-18 md:h-18`}
              scrollY={parallaxValue}
              speed={0.12}
              swaySpeed={0.02}
            />
            <BeachBall
              className={`absolute top-[50%] right-[6%] ${elementColor} w-12 h-12 md:w-16 md:h-16 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.15}
              rotateSpeed={0.08}
            />
            <FlipFlop
              className={`absolute bottom-[18%] left-[6%] ${elementColor} w-10 h-10 md:w-14 md:h-14 hidden md:block`}
              scrollY={parallaxValue}
              speed={0.14}
              isLeft={true}
            />
          </>
        );
      case "documents":
        return (
          <>
            <BeachUmbrella
              className={`absolute top-[20%] left-[5%] ${elementColor} w-16 h-16 md:w-22 md:h-22`}
              scrollY={parallaxValue}
              speed={0.18}
              swaySpeed={0.02}
            />
            <Starfish
              className={`absolute bottom-[25%] right-[6%] ${elementColor} w-14 h-14 md:w-18 md:h-18`}
              scrollY={parallaxValue}
              speed={0.15}
              rotateSpeed={0.05}
            />
            <CoconutDrink
              className={`absolute top-[55%] right-[4%] ${elementColor} w-10 h-10 md:w-14 md:h-14 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.12}
              swaySpeed={0.02}
            />
          </>
        );
      case "emergency":
        return (
          <>
            <BeachBall
              className={`absolute top-[18%] right-[5%] ${elementColor} w-14 h-14 md:w-20 md:h-20`}
              scrollY={parallaxValue}
              speed={0.15}
              rotateSpeed={0.1}
            />
            <Seashell
              className={`absolute bottom-[22%] left-[6%] ${elementColor} w-12 h-12 md:w-16 md:h-16`}
              scrollY={parallaxValue}
              speed={0.18}
              rotateSpeed={0.06}
            />
            <Sunglasses
              className={`absolute top-[50%] left-[4%] ${elementColor} w-10 h-10 md:w-14 md:h-14 hidden sm:block`}
              scrollY={parallaxValue}
              speed={0.12}
            />
          </>
        );
      default:
        return null;
    }
  };

  // If no background defined, just render with decorations
  if (!bg) {
    return (
      <div ref={sectionRef} className="relative overflow-hidden">
        {getDecorations()}
        {children}
      </div>
    );
  }

  // Calculate pattern parallax offset (slower than elements for depth effect)
  const patternOffset = isInView ? scrollProgress * 50 : 0;
  // Calculate pattern opacity based on background darkness
  const patternOpacity = getPatternOpacity(bg.isDark);

  return (
    <div ref={sectionRef} className={`relative overflow-hidden ${bg.gradient}`}>
      {/* Pattern overlay with parallax - opacity based on background darkness */}
      <div
        className="absolute inset-0 pointer-events-none transition-[background-position] duration-100 ease-linear"
        style={{
          backgroundImage: bg.pattern,
          backgroundRepeat: 'repeat',
          backgroundPositionY: `${patternOffset}px`,
          opacity: patternOpacity
        }}
      />
      {/* Secondary pattern layer (fainter, faster parallax for depth) */}
      <div
        className="absolute inset-0 pointer-events-none transition-[background-position] duration-100 ease-linear"
        style={{
          backgroundImage: bg.pattern,
          backgroundRepeat: 'repeat',
          backgroundPositionY: `${patternOffset * 1.6}px`,
          backgroundSize: '150%',
          opacity: patternOpacity * 0.5
        }}
      />
      {/* Decorative elements - behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {getDecorations()}
      </div>
      {/* Content - on top */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
