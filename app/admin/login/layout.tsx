import type React from "react"

export const metadata = {
  title: "Login | Quem Fez, Fez!",
  description: "Acesso ao painel administrativo",
}

// Este layout não verifica autenticação, permitindo acesso à página de login
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
