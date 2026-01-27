

## Plan: Uppdatera primärfärgen till den korrekta marinblå

### Bakgrund
Bilden visar en knapp med en specifik marinblå färg som ska användas konsekvent genom hela applikationen. Den nuvarande primary-färgen behöver justeras för att matcha exakt.

### Färganalys

| Nuvarande | Ny (från bilden) |
|-----------|------------------|
| HSL: 210 65% 25% (~#163050) | HSL: 211 42% 32% (~#2f4d6f) |

Den nya färgen är något ljusare och mer gråblå/marinblå än den nuvarande.

### Ändringar i src/index.css

Uppdatera CSS-variablerna för alla platser där den primära blå färgen används:

```css
/* Gamla värden → Nya värden */
--primary: 210 65% 25%;      → --primary: 211 42% 32%;
--ring: 210 65% 25%;         → --ring: 211 42% 32%;
--sidebar-background: 210 65% 25%; → --sidebar-background: 211 42% 32%;
--sidebar-accent: 210 55% 30%;     → --sidebar-accent: 211 38% 36%;

/* Uppdatera även gradienter som använder denna nyans */
--gradient-primary: linear-gradient(135deg, hsl(211 42% 32%) 0%, hsl(211 38% 42%) 100%);
```

### Påverkade komponenter
Eftersom projektet använder CSS-variabler kommer alla följande element automatiskt att uppdateras:
- Alla knappar med `variant="default"` och `variant="hero"`
- Logo-ikoner i Dashboard-layouten
- Aktiva navigation-länkar
- Fokusringar på formulärfält
- Sidebar-bakgrund (desktop)
- Progress-indikatorer
- Länkar och accenter

### Tekniska detaljer

Filen `src/index.css` innehåller alla färgdefinitioner. Ändringarna görs endast i `:root`-sektionen (ljust tema) och `.dark`-sektionen om mörkt tema också används.

Ingen ändring behövs i:
- `tailwind.config.ts` (refererar redan till CSS-variablerna)
- Individuella komponenter (använder redan `bg-primary`, `text-primary`, etc.)

