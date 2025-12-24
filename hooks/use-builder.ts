"use client"

import { useReducer, useCallback, useMemo } from "react"
import type {
  BuilderState,
  BuilderAction,
  BuilderSummary,
  MeatOption,
  BeverageOption,
  ServiceOption,
  AccompanimentOption,
} from "@/lib/types/builder"
import { CALCULATION_DEFAULTS } from "@/lib/constants/builder"

const initialState: BuilderState = {
  step: 1,
  guests: 10,
  selectedMeat: null,
  selectedBeverages: [],
  selectedServices: [],
  selectedAccompaniments: [],
  customerInfo: null,
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload }
    case "SET_GUESTS":
      return {
        ...state,
        guests: Math.max(CALCULATION_DEFAULTS.minGuests, Math.min(CALCULATION_DEFAULTS.maxGuests, action.payload)),
      }
    case "SET_MEAT":
      return { ...state, selectedMeat: action.payload }
    case "ADD_BEVERAGE":
      const existingIndex = state.selectedBeverages.findIndex((b) => b.option.id === action.payload.option.id)
      if (existingIndex >= 0) {
        const updated = [...state.selectedBeverages]
        updated[existingIndex].quantity = action.payload.quantity
        return { ...state, selectedBeverages: updated }
      }
      return { ...state, selectedBeverages: [...state.selectedBeverages, action.payload] }
    case "REMOVE_BEVERAGE":
      return { ...state, selectedBeverages: state.selectedBeverages.filter((b) => b.option.id !== action.payload) }
    case "UPDATE_BEVERAGE_QUANTITY":
      return {
        ...state,
        selectedBeverages: state.selectedBeverages.map((b) =>
          b.option.id === action.payload.id ? { ...b, quantity: action.payload.quantity } : b,
        ),
      }
    case "TOGGLE_SERVICE":
      const hasService = state.selectedServices.some((s) => s.id === action.payload.id)
      return {
        ...state,
        selectedServices: hasService
          ? state.selectedServices.filter((s) => s.id !== action.payload.id)
          : [...state.selectedServices, action.payload],
      }
    case "TOGGLE_ACCOMPANIMENT":
      const hasAccomp = state.selectedAccompaniments.some((a) => a.id === action.payload.id)
      return {
        ...state,
        selectedAccompaniments: hasAccomp
          ? state.selectedAccompaniments.filter((a) => a.id !== action.payload.id)
          : [...state.selectedAccompaniments, action.payload],
      }
    case "SET_CUSTOMER_INFO":
      return { ...state, customerInfo: action.payload }
    case "RESET":
      return initialState
    default:
      return state
  }
}

export function useBuilder() {
  const [state, dispatch] = useReducer(builderReducer, initialState)

  const setStep = useCallback((step: number) => dispatch({ type: "SET_STEP", payload: step }), [])
  const setGuests = useCallback((guests: number) => dispatch({ type: "SET_GUESTS", payload: guests }), [])
  const setMeat = useCallback((meat: MeatOption) => dispatch({ type: "SET_MEAT", payload: meat }), [])
  const addBeverage = useCallback(
    (option: BeverageOption, quantity: number) => dispatch({ type: "ADD_BEVERAGE", payload: { option, quantity } }),
    [],
  )
  const removeBeverage = useCallback((id: string) => dispatch({ type: "REMOVE_BEVERAGE", payload: id }), [])
  const updateBeverageQuantity = useCallback(
    (id: string, quantity: number) => dispatch({ type: "UPDATE_BEVERAGE_QUANTITY", payload: { id, quantity } }),
    [],
  )
  const toggleService = useCallback(
    (service: ServiceOption) => dispatch({ type: "TOGGLE_SERVICE", payload: service }),
    [],
  )
  const toggleAccompaniment = useCallback(
    (accompaniment: AccompanimentOption) => dispatch({ type: "TOGGLE_ACCOMPANIMENT", payload: accompaniment }),
    [],
  )
  const reset = useCallback(() => dispatch({ type: "RESET" }), [])

  const suggestedBeers = useMemo(() => state.guests * CALCULATION_DEFAULTS.beersPerPerson, [state.guests])

  const calculateTotal = useMemo(() => {
    let total = 0

    // Meat cost
    if (state.selectedMeat) {
      total += state.selectedMeat.pricePerPerson * state.guests
    }

    // Beverages cost
    state.selectedBeverages.forEach(({ option, quantity }) => {
      total += option.pricePerUnit * quantity
    })

    // Services cost
    state.selectedServices.forEach((service) => {
      total += service.price
    })

    // Accompaniments cost
    state.selectedAccompaniments.forEach((accompaniment) => {
      total += accompaniment.price
    })

    return total
  }, [state])

  const summary: BuilderSummary = useMemo(
    () => ({
      guests: state.guests,
      meatKit: state.selectedMeat?.name || "Não selecionado",
      beverages: state.selectedBeverages.map((b) => `${b.quantity}x ${b.option.name}`),
      services: state.selectedServices.map((s) => s.name),
      accompaniments: state.selectedAccompaniments.map((a) => a.name),
      subtotal: calculateTotal,
      total: calculateTotal,
    }),
    [state, calculateTotal],
  )

  const canProceed = useMemo(() => {
    switch (state.step) {
      case 1:
        return state.guests >= CALCULATION_DEFAULTS.minGuests
      case 2:
        return state.selectedMeat !== null
      case 3:
        return true // Beverages are optional
      case 4:
        return true // Services are optional
      case 5:
        return true
      default:
        return false
    }
  }, [state])

  return {
    state,
    setStep,
    setGuests,
    setMeat,
    addBeverage,
    removeBeverage,
    updateBeverageQuantity,
    toggleService,
    toggleAccompaniment,
    reset,
    suggestedBeers,
    calculateTotal,
    summary,
    canProceed,
  }
}
