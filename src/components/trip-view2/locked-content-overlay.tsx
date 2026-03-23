"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface LockedContentOverlayProps {
  returnUrl: string;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export function LockedContentOverlay({
  returnUrl,
  message = "Login to view details",
  children,
  className = "",
}: LockedContentOverlayProps) {
  const router = useRouter();

  const handleClick = () => {
    // Store return URL in sessionStorage for redirect after login
    sessionStorage.setItem("returnUrl", returnUrl);
    router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content behind */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div
        onClick={handleClick}
        className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer group transition-all hover:from-white/70 hover:to-white/90 rounded-xl"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200 text-center max-w-xs mx-4 transform group-hover:scale-105 transition-transform">
          <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-teal" />
          </div>
          <p className="font-semibold text-navy mb-1">Private Information</p>
          <p className="text-sm text-slate-500 mb-4">{message}</p>
          <span className="inline-block px-4 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal-dark transition-colors">
            Login to View
          </span>
        </div>
      </div>
    </div>
  );
}

// Simpler inline lock for individual fields
interface LockedFieldProps {
  returnUrl: string;
  label: string;
  className?: string;
}

export function LockedField({ returnUrl, label, className = "" }: LockedFieldProps) {
  const router = useRouter();

  const handleClick = () => {
    sessionStorage.setItem("returnUrl", returnUrl);
    router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-500 transition-colors cursor-pointer ${className}`}
    >
      <Lock className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
