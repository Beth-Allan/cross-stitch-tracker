import { Scissors } from "lucide-react"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <Scissors className="size-8" strokeWidth={1.5} />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100">
          Cross Stitch Tracker
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Sign in to manage your projects
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
