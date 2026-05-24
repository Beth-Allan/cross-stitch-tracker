"use client";

import { useState, useEffect, useRef } from "react";

interface UseRejectionFlashOptions {
  duration?: number;
}

/**
 * Hook providing a timed visual rejection flash for invalid input.
 * Returns a boolean that drives CSS feedback (border-destructive, bg-destructive/10)
 * and a trigger function to activate it.
 */
export function useRejectionFlash({ duration = 600 }: UseRejectionFlashOptions = {}) {
  const [showRejection, setShowRejection] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function triggerRejection() {
    setShowRejection(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowRejection(false), duration);
  }

  return { showRejection, triggerRejection };
}
