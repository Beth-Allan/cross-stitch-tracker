import Link from "next/link";
import { buttonVariants } from "./button-variants";
import type { VariantProps } from "class-variance-authority";

interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof buttonVariants> {
  href: string;
}

/**
 * Navigation element styled as a button. Use instead of Button render={<Link>}.
 *
 * Works in both Server and Client Components without hydration issues.
 */
export function LinkButton({
  href,
  variant,
  size,
  className,
  children,
  target,
  rel,
  ...props
}: LinkButtonProps) {
  const safeRel =
    target === "_blank" ? [rel, "noopener noreferrer"].filter(Boolean).join(" ") : rel;

  return (
    <Link
      href={href}
      className={buttonVariants({ variant, size, className })}
      target={target}
      rel={safeRel}
      {...props}
    >
      {children}
    </Link>
  );
}
