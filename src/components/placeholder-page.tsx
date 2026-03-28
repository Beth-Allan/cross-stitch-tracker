import type { LucideIcon } from "lucide-react"

interface PlaceholderPageProps {
  title: string
  description: string
  icon: LucideIcon
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary/70" strokeWidth={1.5} />
      </div>
      <h1 className="font-heading text-2xl font-semibold text-foreground mb-2">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {description}
      </p>
      <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming soon
      </span>
    </div>
  )
}
