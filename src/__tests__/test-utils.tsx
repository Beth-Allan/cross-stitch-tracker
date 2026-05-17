import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * App-level providers wrapper for tests.
 * Add context providers here as they're introduced (theme, auth, etc.).
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { wrapper?: RenderOptions["wrapper"] },
) {
  const { wrapper, ...rest } = options ?? {};
  return render(ui, { wrapper: wrapper ?? AllProviders, ...rest });
}

// Re-export everything from RTL, override render with our wrapper
export * from "@testing-library/react";
export { customRender as render };
