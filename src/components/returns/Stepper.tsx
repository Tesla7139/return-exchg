"use client";

import { Check } from "lucide-react";
import type { Step } from "@/lib/returns/types";
import { usePortal } from "./PortalContext";

export function Stepper({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  const { primary } = usePortal();
  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const done = s.number < currentStep;
          const active = s.number === currentStep;
          return (
            <div key={s.number} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                    done ? "text-white" : active ? "text-white ring-4" : "bg-slate-200 text-slate-400"
                  }`}
                  style={
                    done || active
                      ? { backgroundColor: primary, ["--tw-ring-color" as string]: `${primary}33` }
                      : undefined
                  }
                >
                  {done ? <Check className="h-4 w-4" /> : <span className="text-xs font-medium">{s.number}</span>}
                </div>
                <span
                  className={`mt-2 hidden text-xs font-medium transition-colors duration-300 sm:block ${
                    s.number <= currentStep ? "font-bold text-slate-900" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-all duration-500 ${done ? "" : "bg-slate-200"}`}
                  style={done ? { backgroundColor: primary } : undefined}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
