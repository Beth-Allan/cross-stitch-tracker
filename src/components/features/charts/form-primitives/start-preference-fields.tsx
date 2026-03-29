"use client";

const START_PERIODS = [
  { group: "Season", items: ["Spring", "Summer", "Fall", "Winter"] },
  {
    group: "Month",
    items: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
];

const START_YEARS = [2026, 2027, 2028, 2029, 2030];

interface StartPreferenceFieldsProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

function parsePreference(value: string | null): {
  period: string;
  year: string;
} {
  if (!value) return { period: "", year: "" };
  const parts = value.split(" ");
  if (parts.length === 2) return { period: parts[0], year: parts[1] };
  if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return { period: "", year: parts[0] };
  return { period: parts[0], year: "" };
}

function combinePreference(period: string, year: string): string | null {
  if (period && year) return `${period} ${year}`;
  if (year) return year;
  return null;
}

export function StartPreferenceFields({ value, onChange }: StartPreferenceFieldsProps) {
  // Derive period/year directly from the controlled `value` prop.
  // No internal state needed — the parent owns the value.
  const { period, year } = parsePreference(value);

  const handlePeriodChange = (newPeriod: string) => {
    onChange(combinePreference(newPeriod, year));
  };

  const handleYearChange = (newYear: string) => {
    onChange(combinePreference(period, newYear));
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <select
        value={period}
        onChange={(e) => handlePeriodChange(e.target.value)}
        className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
      >
        <option value="">Any time</option>
        {START_PERIODS.map((group) => (
          <optgroup key={group.group} label={group.group}>
            {group.items.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => handleYearChange(e.target.value)}
        className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
      >
        <option value="">Year</option>
        {START_YEARS.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
