# Tailwind Color Configuration

## Color Choices

- **Primary:** `emerald` — Used for buttons, links, progress bars, navigation highlights, hero stat cards, achievement badges
- **Secondary:** `amber` — Used for CTAs (Log Stitches button), star ratings, period badges, warning states
- **Neutral:** `stone` — Used for backgrounds, text, borders, empty states, card surfaces

## Status Color Mapping

These colors represent the project lifecycle and are used consistently across gallery cards, status badges, and gradient placeholders:

| Status | Color | Usage |
|--------|-------|-------|
| Unstarted | `stone` | Default/inactive state |
| Kitting | `amber` | Gathering supplies |
| Kitted/Ready | `emerald` | Ready to stitch |
| In Progress | `sky` | Actively stitching |
| On Hold | `orange` | Paused |
| Finished | `violet` | Stitching complete |
| FFO (Fully Finished Object) | `rose` | Framed/finished |

## Usage Examples

```
Primary button:     bg-emerald-600 hover:bg-emerald-700 text-white
Secondary CTA:      bg-amber-500 hover:bg-amber-600 text-white
Outline button:     border-amber-500 text-amber-600 hover:bg-amber-50
Hero stat card:     bg-emerald-50 border border-emerald-200
Progress bar fill:  bg-emerald-400 (on stone-200 track)
Neutral text:       text-stone-600 dark:text-stone-400
Card border:        border-stone-200 dark:border-stone-800
Achievement badge:  bg-emerald-100 text-emerald-800
```

## Font Usage Rules

- **JetBrains Mono**: ONLY for hero stat numbers (large standalone displays) and progress bar percentages. Never in label-value rows or table cells.
- **Fraunces**: Section headings, page titles, app logo
- **Source Sans 3**: Everything else — body text, nav labels, form fields, table data, card details. All numbers in tables must explicitly set this font.
