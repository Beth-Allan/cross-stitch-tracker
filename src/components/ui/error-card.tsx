interface ErrorCardProps {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function ErrorCard({ icon, title, description, children }: ErrorCardProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <span className="text-muted-foreground text-xl" aria-hidden="true">
            {icon}
          </span>
        </div>

        <h2 className="font-heading text-foreground text-lg font-semibold">{title}</h2>

        <p className="text-muted-foreground mt-2 text-sm">{description}</p>

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
