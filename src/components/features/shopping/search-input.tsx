"use client";

import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}

export function SearchInput({ value, onChange, placeholder, ariaLabel }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search
        className="text-muted-foreground/60 absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2"
        strokeWidth={1.5}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        role="searchbox"
        aria-label={ariaLabel}
        className="border-border bg-card placeholder:text-muted-foreground focus:border-ring focus:ring-ring w-full rounded-lg border py-2 pr-8 pl-9 text-sm focus:ring-1 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm transition-colors outline-none focus-visible:ring-2"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
