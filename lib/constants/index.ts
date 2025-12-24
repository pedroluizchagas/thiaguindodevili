// Centralized constants following Single Responsibility Principle

export const COMPANY_INFO = {
  name: "Quem Fez, Fez!",
  tagline: "Agora só pedir que a gente resolve!",
  email: "contato@quemfezfez.com.br",
  phone: "(11) 99999-9999",
  whatsapp: "https://wa.me/5511999999999",
} as const

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/quemfezfez",
  facebook: "https://facebook.com/quemfezfez",
  youtube: "https://youtube.com/@quemfezfez",
} as const

export const NAVIGATION_ITEMS = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Monte Sua Resenha", href: "#monte-sua-resenha" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Combos", href: "#combos" },
  { label: "Franquias", href: "#franquias" },
  { label: "Contato", href: "#contato" },
] as const

export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Escolha o Combo",
    description: "Selecione a quantidade de pessoas. Carnes nobres, acompanhamentos e bebidas premium.",
    icon: "package" as const,
  },
  {
    step: 2,
    title: "Nós Chegamos com Tudo",
    description: "Entregamos tudo em um Cooler Térmico Profissional. As bebidas já chegam trincando!",
    icon: "truck" as const,
  },
  {
    step: 3,
    title: "O Toque de Mestre",
    description: "Nossa equipe organiza os insumos e, o mais importante: nós acendemos a sua churrasqueira.",
    icon: "flame" as const,
  },
  {
    step: 4,
    title: "A Magia Acontece",
    description: "Você assume o controle da grelha e curte a resenha sem estresse.",
    icon: "sparkles" as const,
  },
  {
    step: 5,
    title: "Sem Bagunça",
    description: "No dia/horário combinado, passamos apenas para recolher o cooler.",
    icon: "check" as const,
  },
] as const

export const DIFFERENTIALS = [
  {
    title: "Curadoria de Carnes",
    description:
      'Não entregamos "carne de churrasco". Entregamos cortes selecionados (Angus, Wagyu, Duroc) temperados com precisão ou 100% in natura para o seu toque pessoal.',
    image: "/premium-wagyu-beef-steak-dark-food-photography.jpg",
  },
  {
    title: "O Cooler Inteligente",
    description:
      "Esqueça o isopor que vaza na sala. Nossos coolers de alta performance mantêm a temperatura ideal da primeira à última cerveja.",
    image: "/professional-cooler-with-ice-cold-beer-bottles-dar.jpg",
  },
  {
    title: "Churrasqueira Acesa",
    description:
      "Não perca tempo lutando com carvão. Chegamos com tudo pronto: carvão de qualidade, acendedor e brasa no ponto.",
    image: "/glowing-charcoal-bbq-grill-flames-dark-photography.jpg",
  },
] as const

export const COMBOS = [
  {
    id: "essencial",
    name: "Resenha Essencial",
    description: "Para até 8 pessoas",
    price: "R$ 599",
    features: [
      "2kg Picanha Premium",
      "1kg Fraldinha Angus",
      "1kg Linguiça Artesanal",
      "24 Cervejas Premium",
      "Carvão e Acendimento",
      "Cooler Térmico",
    ],
    popular: false,
  },
  {
    id: "premium",
    name: "Resenha Premium",
    description: "Para até 15 pessoas",
    price: "R$ 1.199",
    features: [
      "3kg Picanha Black Angus",
      "2kg Ancho Premium",
      "1.5kg Fraldinha",
      "1kg Linguiça Especial",
      "36 Cervejas Premium",
      "Espetos e Acompanhamentos",
      "Carvão Premium e Acendimento",
      "Cooler XL Térmico",
    ],
    popular: true,
  },
  {
    id: "vip",
    name: "Resenha VIP",
    description: "Para até 25 pessoas",
    price: "R$ 2.499",
    features: [
      "4kg Picanha Wagyu",
      "3kg Tomahawk",
      "2kg Costela Premium",
      "2kg Linguiça Artesanal",
      "60 Cervejas Premium",
      "Drinks Especiais",
      "Acompanhamentos Gourmet",
      "Carvão Premium e Acendimento",
      "2 Coolers XL Térmicos",
      "Churrasqueiro Assistente",
    ],
    popular: false,
  },
] as const

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Ricardo Mendes",
    role: "São Paulo, SP",
    content:
      "A melhor experiência de churrasco que já tive. A carne chegou no ponto perfeito e o cooler manteve as cervejas geladas a tarde toda!",
    rating: 5,
    avatar: "/brazilian-man-portrait-smiling.jpg",
  },
  {
    id: 2,
    name: "Fernanda Costa",
    role: "Rio de Janeiro, RJ",
    content:
      "Nunca mais vou fazer churrasco do jeito antigo. A praticidade de ter tudo entregue e a churrasqueira já acesa é impagável.",
    rating: 5,
    avatar: "/brazilian-woman-portrait-smiling.jpg",
  },
  {
    id: 3,
    name: "Carlos Eduardo",
    role: "Belo Horizonte, MG",
    content:
      "Qualidade excepcional das carnes! O Angus estava perfeito. Virei cliente fiel e já estou indicando para todos os amigos.",
    rating: 5,
    avatar: "/brazilian-man-portrait-casual.jpg",
  },
] as const

export const FRANCHISE_BENEFITS = [
  "Modelo de negócio validado",
  "Suporte completo na operação",
  "Marketing nacional",
  "Treinamento especializado",
  "Fornecedores homologados",
  "ROI atrativo",
] as const
