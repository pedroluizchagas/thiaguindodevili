// Type definitions for the Resenha Builder - Interface Segregation Principle

export interface MeatOption {
  id: string
  name: string
  description: string
  items: string[]
  pricePerPerson: number
  image: string
  tier: "raiz" | "ouro" | "lenda"
}

export interface BeverageOption {
  id: string
  name: string
  brand: string
  pricePerUnit: number
  category: "cerveja" | "refrigerante" | "agua" | "energetico" | "gin"
  image: string
}

export interface ServiceOption {
  id: string
  name: string
  description: string
  price: number
  icon: "flame" | "sparkles" | "utensils"
}

export interface AccompanimentOption {
  id: string
  name: string
  price: number
}

export interface BuilderState {
  step: number
  guests: number
  selectedMeat: MeatOption | null
  selectedBeverages: {
    option: BeverageOption
    quantity: number
  }[]
  selectedServices: ServiceOption[]
  selectedAccompaniments: AccompanimentOption[]
  customerInfo: CustomerInfo | null
}

export interface CustomerInfo {
  name: string
  whatsapp: string
  address: string
  date: string
  time: string
}

export interface BuilderSummary {
  guests: number
  meatKit: string
  beverages: string[]
  services: string[]
  accompaniments: string[]
  subtotal: number
  total: number
}

export type BuilderAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_GUESTS"; payload: number }
  | { type: "SET_MEAT"; payload: MeatOption }
  | { type: "ADD_BEVERAGE"; payload: { option: BeverageOption; quantity: number } }
  | { type: "REMOVE_BEVERAGE"; payload: string }
  | { type: "UPDATE_BEVERAGE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "TOGGLE_SERVICE"; payload: ServiceOption }
  | { type: "TOGGLE_ACCOMPANIMENT"; payload: AccompanimentOption }
  | { type: "SET_CUSTOMER_INFO"; payload: CustomerInfo }
  | { type: "RESET" }
