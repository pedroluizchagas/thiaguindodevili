"use client"

import { cn } from "@/lib/utils"
import { BUILDER_STEPS } from "@/lib/constants/builder"
import { useBuilderContext } from "./builder-context"
import { Check } from "lucide-react"

export function ProgressBar() {
  const { state, setStep, canProceed } = useBuilderContext()

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {BUILDER_STEPS.map((step, index) => {
          const isCompleted = state.step > step.id
          const isCurrent = state.step === step.id
          const isClickable = step.id < state.step || (step.id === state.step + 1 && canProceed)

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => isClickable && setStep(step.id)}
                disabled={!isClickable && !isCompleted && !isCurrent}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all",
                  isClickable || isCompleted || isCurrent ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/30 animate-pulse",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent && "text-primary",
                    !isCurrent && "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < BUILDER_STEPS.length - 1 && (
                <div
                  className={cn("flex-1 h-1 mx-2 rounded-full transition-all", isCompleted ? "bg-primary" : "bg-muted")}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
