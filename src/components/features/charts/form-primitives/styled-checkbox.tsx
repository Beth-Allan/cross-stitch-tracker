"use client";

import { useId } from "react";

interface StyledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function StyledCheckbox({ checked, onChange, label, disabled }: StyledCheckboxProps) {
  const id = useId();

  return (
    <label htmlFor={id} className="group flex cursor-pointer items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="border-border accent-primary focus:ring-ring size-4 rounded focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span className="text-foreground group-hover:text-foreground/80 text-sm transition-colors">
        {label}
      </span>
    </label>
  );
}
