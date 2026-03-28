# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=JetBrains+Mono:wght@400;500;600&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## Font Usage

| Context | Font | Weight |
|---------|------|--------|
| **Page titles** | Fraunces | 600 (semibold) |
| **Section headings** | Fraunces | 600 |
| **Body text** | Source Sans 3 | 400 |
| **Labels & captions** | Source Sans 3 | 500 |
| **Button text** | Source Sans 3 | 500-600 |
| **Nav items** | Source Sans 3 | 500 |
| **Hero stat numbers** | JetBrains Mono | 600 |
| **Progress percentages** | JetBrains Mono | 600 |
| **Table data** | Source Sans 3 | 400 |

## Important Rules

- **Never mix JetBrains Mono with Source Sans 3 in card detail rows** — it looks jarring
- JetBrains Mono is ONLY for: large standalone number displays (hero stats, progress percentages)
- All numbers in tables and lists must explicitly set Source Sans 3 to prevent font inheritance from Fraunces headings
- Use `font-variant-numeric: tabular-nums` on any number column for alignment
