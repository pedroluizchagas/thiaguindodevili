"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useBuilder } from "@/hooks/use-builder"

type BuilderContextType = ReturnType<typeof useBuilder>

const BuilderContext = createContext<BuilderContextType | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const builder = useBuilder()

  return <BuilderContext.Provider value={builder}>{children}</BuilderContext.Provider>
}

export function useBuilderContext() {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error("useBuilderContext must be used within a BuilderProvider")
  }
  return context
}
