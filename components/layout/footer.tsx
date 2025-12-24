import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Lock } from "lucide-react"
import { COMPANY_INFO, SOCIAL_LINKS, NAVIGATION_ITEMS } from "@/lib/constants"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Image src="/images/logo.png" alt={COMPANY_INFO.name} width={160} height={70} className="h-14 w-auto" />
            <p className="text-muted-foreground leading-relaxed">{COMPANY_INFO.tagline}</p>
            <div className="flex gap-4">
              <Link
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-foreground mb-6">
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-foreground mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail size={18} className="text-primary" />
                <span>{COMPANY_INFO.email}</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone size={18} className="text-primary" />
                <span>{COMPANY_INFO.phone}</span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin size={18} className="text-primary mt-1" />
                <span>Presente em todo o Brasil através de nossas franquias</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-foreground mb-6">
              Newsletter
            </h3>
            <p className="text-muted-foreground mb-4">Receba novidades e promoções exclusivas.</p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} {COMPANY_INFO.name}. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacidade" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-1">
              <Lock size={12} />
              Área Restrita
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
