import type React from "react"
import type { Metadata } from "next"
import { Inter, Bebas_Neue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
})

export const metadata: Metadata = {
  title: "Quem Fez, Fez! | Delivery de Churrasco Premium",
  description:
    "A resenha completa, do gelo à brasa acesa, entregue na sua porta. Carnes nobres, bebidas geladas e churrasqueira pronta para usar.",
  keywords: ["churrasco", "delivery", "carnes nobres", "resenha", "franquia", "Brasil"],
  authors: [{ name: "Quem Fez, Fez!" }],
  openGraph: {
    title: "Quem Fez, Fez! | Delivery de Churrasco Premium",
    description: "A resenha completa, do gelo à brasa acesa, entregue na sua porta.",
    type: "website",
    locale: "pt_BR",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
