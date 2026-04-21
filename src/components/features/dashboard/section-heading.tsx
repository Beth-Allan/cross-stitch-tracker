interface SectionHeadingProps {
  title: string;
  action?: React.ReactNode;
}

/**
 * Dashboard section heading with Fraunces font and emerald accent bar.
 * Server component -- no "use client" needed.
 */
export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-heading text-xl font-bold">{title}</h2>
        <div className="mt-1.5 h-0.5 w-10 rounded-full bg-emerald-400 dark:bg-emerald-500" />
      </div>
      {action}
    </div>
  );
}
