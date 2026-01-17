import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  badge?: string
  title: string
  subtitle?: string
  description?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({ badge, title, subtitle, description, centered = true, className }: SectionHeaderProps) {
  const subtitleText = subtitle ?? description

  return (
    <div className={cn("mb-12 md:mb-16", centered && "text-center", className)}>
      {badge && (
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium mb-4",
            centered && "mx-auto",
          )}
        >
          {badge}
        </div>
      )}
      <h2 className="font-[family-name:var(--font-bebas)] text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground mb-4">
        {title}
      </h2>
      {subtitleText && (
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">{subtitleText}</p>
      )}
    </div>
  )
}
