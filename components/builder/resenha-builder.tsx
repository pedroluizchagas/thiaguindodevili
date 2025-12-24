"use client"

import { BuilderProvider, useBuilderContext } from "./builder-context"
import { ProgressBar } from "./progress-bar"
import { PriceDisplay } from "./price-display"
import { StepGuests } from "./steps/step-guests"
import { StepMeat } from "./steps/step-meat"
import { StepBeverages } from "./steps/step-beverages"
import { StepServices } from "./steps/step-services"
import { StepCheckout } from "./steps/step-checkout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BUILDER_STEPS } from "@/lib/constants/builder"

function BuilderContent() {
  const { state, setStep, canProceed } = useBuilderContext()

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return <StepGuests />
      case 2:
        return <StepMeat />
      case 3:
        return <StepBeverages />
      case 4:
        return <StepServices />
      case 5:
        return <StepCheckout />
      default:
        return <StepGuests />
    }
  }

  const handleNext = () => {
    if (state.step < BUILDER_STEPS.length) {
      setStep(state.step + 1)
    }
  }

  const handlePrevious = () => {
    if (state.step > 1) {
      setStep(state.step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <ProgressBar />

        {/* Price Display - Sticky on mobile */}
        <div className="sticky top-0 z-10 py-4 bg-background/80 backdrop-blur-lg">
          <PriceDisplay />
        </div>

        {/* Step Content */}
        <div className="py-8">{renderStep()}</div>

        {/* Navigation */}
        {state.step < 5 && (
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={state.step === 1}
              className="gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <Button size="lg" onClick={handleNext} disabled={!canProceed} className="gap-2">
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ResenhaBuilder() {
  return (
    <BuilderProvider>
      <BuilderContent />
    </BuilderProvider>
  )
}
