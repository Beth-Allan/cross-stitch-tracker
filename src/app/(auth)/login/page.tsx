import { Logo } from "@/components/shell/logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex items-center justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="font-heading text-foreground text-2xl font-semibold">
          Cross Stitch Tracker
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to your stitching studio</p>
      </div>
      <LoginForm />
    </div>
  );
}
