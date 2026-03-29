import Link from "next/link";
import { buttonVariants } from "./button";
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
  ...props
}: LinkButtonProps) {
  return (
    <Link href={href} className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
