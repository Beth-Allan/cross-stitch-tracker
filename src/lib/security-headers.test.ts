import { describe, it, expect } from "vitest";
import { contentSecurityPolicy } from "./security-headers";

describe("contentSecurityPolicy", () => {
  describe("in production", () => {
    const csp = contentSecurityPolicy({ isDev: false });

    it("does not permit unsafe-eval", () => {
      expect(csp).not.toContain("unsafe-eval");
    });

    it("refuses to be framed", () => {
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it("pins base-uri, form-action and object-src", () => {
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("object-src 'none'");
    });

    it("still allows R2 images and connections", () => {
      expect(csp).toContain("img-src 'self' data: blob: https://*.r2.cloudflarestorage.com");
      expect(csp).toContain("connect-src 'self' https://*.r2.cloudflarestorage.com");
    });

    it("keeps style-src unsafe-inline for next/font", () => {
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });
  });

  describe("in development", () => {
    const csp = contentSecurityPolicy({ isDev: true });

    it("permits unsafe-eval so hot reload works", () => {
      expect(csp).toContain("'unsafe-eval'");
    });

    it("carries the same hardening directives as production", () => {
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("object-src 'none'");
    });
  });
});
