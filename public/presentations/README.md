# Presentations

Branded reveal.js decks for BitDevs DMV meetups.

## Structure

```
public/presentations/
  theme.css                 # shared brand theme (navy + orange + IBM Plex)
  socratic-022/index.html   # Seminar 022 reading-room deck
```

Live URL pattern: `https://bitdevsdmv.com/presentations/<slug>/`

## Brand

- Background: `#07111f`
- Accent: `#f7931a`
- Logo: `/brand/bitdevs-dmv-logo.png`
- Type: IBM Plex Sans / Mono (matches the site)

## New deck

1. Copy `socratic-022/` to `socratic-0XX/`
2. Update chrome meta, title slide, topics, and QR if needed
3. Link from the event markdown: `/presentations/socratic-0XX/`

Open locally via the Astro dev server or by opening the HTML file (logo paths need the site origin).
