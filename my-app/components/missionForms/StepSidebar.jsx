"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { STEPS } from "./mission-steps-config";

export function StepSidebar({ current, onClose }) {
  return (
    <aside className="flex flex-col gap-2 w-64 h-full shrink-0 rounded-l-2xl p-6 bg-foreground text-background overflow-y-auto">
      {/* Close button for mobile */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 lg:hidden"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-6 mt-8 lg:mt-0">
        <p className="text-xs font-semibold tracking-widest uppercase opacity-50 mb-1">Nouvelle Mission</p>
        <h2 className="text-xl font-bold tracking-tight">Créer une mission</h2>
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        {STEPS.map(({ id, label, subtitle, icon: Icon }) => {
          const done = id < current;
          const active = id === current;
          return (
            <div key={id} className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                active && "border-background bg-background text-foreground scale-110",
                done && "border-background/60 bg-background/20 text-background",
                !active && !done && "border-background/30 text-background/40",
              )}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="hidden lg:block">
                <p className={cn(
                  "text-[10px] font-semibold tracking-widest uppercase",
                  active ? "opacity-60" : "opacity-30",
                )}>{subtitle}</p>
                <p className={cn(
                  "text-sm font-semibold tracking-tight leading-none mt-0.5",
                  active ? "opacity-100" : "opacity-40",
                )}>{label}</p>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}