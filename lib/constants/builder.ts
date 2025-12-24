// Centralized constants for the Resenha Builder - Single Responsibility Principle

import type { MeatOption, BeverageOption, ServiceOption, AccompanimentOption } from "@/lib/types/builder"

export const BUILDER_STEPS = [
  { id: 1, title: "Quantidade", shortTitle: "Pessoas" },
  { id: 2, title: "Carnes", shortTitle: "Kit" },
  { id: 3, title: "Bebidas", shortTitle: "Gelo" },
  { id: 4, title: "Serviços", shortTitle: "Extras" },
  { id: 5, title: "Finalizar", shortTitle: "Checkout" },
] as const

export const MEAT_OPTIONS: MeatOption[] = [
  {
    id: "raiz",
    name: "A Resenha Raiz",
    description: "O clássico que nunca falha",
    items: ["Contra-filé", "Linguiça Toscana", "Frango", "Coração"],
    pricePerPerson: 45,
    image: "/classic-brazilian-bbq-meat-cuts-on-dark-background.jpg",
    tier: "raiz",
  },
  {
    id: "ouro",
    name: "O Padrão Ouro",
    description: "Para quem quer impressionar",
    items: ["Picanha Importada", "Chorizo Argentino", "Linguiça Cuiabana", "Fraldinha"],
    pricePerPerson: 75,
    image: "/premium-picanha-and-chorizo-meat-cuts-dark-food-ph.jpg",
    tier: "ouro",
  },
  {
    id: "lenda",
    name: "A Lenda",
    description: "Experiência Wagyu & Angus",
    items: ["Tomahawk Angus", "Assado de Tira", "Picanha Wagyu", "Costela Premium"],
    pricePerPerson: 120,
    image: "/wagyu-tomahawk-steak-premium-meat-dark-photography.jpg",
    tier: "lenda",
  },
]

export const BEVERAGE_OPTIONS: BeverageOption[] = [
  {
    id: "heineken",
    name: "Heineken",
    brand: "Heineken",
    pricePerUnit: 7.5,
    category: "cerveja",
    image: "/heineken-beer-bottle-green.jpg",
  },
  {
    id: "spaten",
    name: "Spaten",
    brand: "Spaten",
    pricePerUnit: 6.5,
    category: "cerveja",
    image: "/spaten-beer-bottle.jpg",
  },
  {
    id: "stella",
    name: "Stella Artois",
    brand: "Stella Artois",
    pricePerUnit: 7,
    category: "cerveja",
    image: "/stella-artois-beer-bottle.jpg",
  },
  {
    id: "corona",
    name: "Corona",
    brand: "Corona",
    pricePerUnit: 8,
    category: "cerveja",
    image: "/corona-beer-bottle.jpg",
  },
  {
    id: "refrigerante",
    name: "Refrigerantes",
    brand: "Mix",
    pricePerUnit: 4,
    category: "refrigerante",
    image: "/soda-cans-coca-cola-sprite.jpg",
  },
  {
    id: "agua",
    name: "Água Mineral",
    brand: "Crystal",
    pricePerUnit: 2.5,
    category: "agua",
    image: "/water-bottle-mineral.jpg",
  },
  {
    id: "energetico",
    name: "Energético",
    brand: "Red Bull",
    pricePerUnit: 12,
    category: "energetico",
    image: "/images/redbull.png",
  },
  {
    id: "gin-kit",
    name: "Kit Gin Premium",
    brand: "Tanqueray",
    pricePerUnit: 89,
    category: "gin",
    image: "/gin-tonic-kit-with-botanicals.jpg",
  },
]

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "acendimento",
    name: "Acendimento Profissional",
    description: "Chegamos, organizamos e deixamos a brasa pronta para você",
    price: 89,
    icon: "flame",
  },
  {
    id: "limpeza",
    name: "Limpeza Pós-Resenha",
    description: "Buscamos o cooler e limpamos a grelha no dia seguinte",
    price: 59,
    icon: "sparkles",
  },
]

export const ACCOMPANIMENT_OPTIONS: AccompanimentOption[] = [
  { id: "pao-alho", name: "Pão de Alho Artesanal (10 un)", price: 29 },
  { id: "farofa", name: "Farofa da Casa", price: 19 },
  { id: "vinagrete", name: "Vinagrete Fresco", price: 15 },
  { id: "queijo-coalho", name: "Queijo Coalho (500g)", price: 35 },
  { id: "abacaxi", name: "Abacaxi Caramelizado", price: 25 },
]

export const CALCULATION_DEFAULTS = {
  meatPerPerson: 400, // grams
  beersPerPerson: 4,
  minGuests: 4,
  maxGuests: 50,
} as const
