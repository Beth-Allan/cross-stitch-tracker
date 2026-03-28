"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  onAddNew?: () => void;
  addNewLabel?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  onAddNew,
  addNewLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1">
        <PopoverTrigger
          render={<Button variant="outline" className="w-full justify-between font-normal" />}
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onValueChange(null);
            }}
            aria-label="Clear selection"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value === value ? null : option.value);
                    setOpen(false);
                  }}
                  data-checked={option.value === value}
                >
                  <Check
                    className={cn("size-4", option.value === value ? "opacity-100" : "opacity-0")}
                  />
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
                      setOpen(false);
                      onAddNew();
                    }}
                  >
                    <Plus className="size-4" />
                    {addNewLabel ?? "Add new"}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
