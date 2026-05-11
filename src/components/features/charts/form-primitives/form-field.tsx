import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}

export function FormField({ label, hint, error, required, htmlFor, children }: FormFieldProps) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div>
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-muted-foreground text-xs tracking-wider uppercase",
          error && "text-destructive",
        )}
      >
        {required && (
          <>
            <span
              className="bg-primary mr-1.5 inline-block size-1.5 rounded-full align-middle relative -top-px"
              aria-hidden="true"
            />
            <span className="sr-only"> (required)</span>
          </>
        )}
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={errorId} role="alert" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-muted-foreground/70 mt-1 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
