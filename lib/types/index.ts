// Type definitions following Interface Segregation Principle

export interface NavigationItem {
  label: string
  href: string
}

export interface HowItWorksStep {
  step: number
  title: string
  description: string
  icon: "package" | "truck" | "flame" | "sparkles" | "check"
}

export interface Differential {
  title: string
  description: string
  image: string
}

export interface Combo {
  id: string
  name: string
  description: string
  price: string
  features: readonly string[]
  popular: boolean
}

export interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  type: "customer" | "franchise"
}
