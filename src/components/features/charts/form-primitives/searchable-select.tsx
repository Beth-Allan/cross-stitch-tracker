"use client";

import { useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  onAddNew?: (searchTerm: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onAddNew,
  placeholder = "Select...",
  disabled,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(
            "border-border bg-background flex h-9 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors",
            "focus:border-primary focus:ring-ring focus:ring-2 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedLabel && "text-muted-foreground",
          )}
        >
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <ChevronDown className="text-muted-foreground ml-2 size-4 shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-(--anchor-width) p-0" align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    data-checked={value === option.value ? "true" : undefined}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(value === option.value && "bg-primary/10 text-primary")}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {onAddNew && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onAddNew(search);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="text-primary"
                    >
                      <Plus className="mr-2 size-4" />
                      Add New
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          aria-label="Clear selection"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
