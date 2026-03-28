interface PlaceholderPageProps {
  title: string
  phase: number
  description?: string
}

export function PlaceholderPage({ title, phase, description }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
        {title}
      </h1>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {description ?? `Coming in Phase ${phase}`}
      </p>
    </div>
  )
}
