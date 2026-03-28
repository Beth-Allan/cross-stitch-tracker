export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
      {children}
    </div>
  )
}
