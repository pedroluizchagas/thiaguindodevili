import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { DifferentialsSection } from "@/components/sections/differentials-section"
import { BuilderSection } from "@/components/sections/builder-section"
import { CombosSection } from "@/components/sections/combos-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { FranchiseSection } from "@/components/sections/franchise-section"
import { ContactSection } from "@/components/sections/contact-section"
import { CTASection } from "@/components/sections/cta-section"

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <DifferentialsSection />
        <BuilderSection />
        <CombosSection />
        <TestimonialsSection />
        <FranchiseSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
