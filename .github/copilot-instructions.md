Repository-specific Copilot instructions for the Season Indicator card

Purpose
- This repository contains a single Home Assistant custom card implemented as a Web Component: `season-indicator-card` ([season-indicator-card.js](season-indicator-card.js)). The file is plain JavaScript and intended to be dropped into HA's `www` or used directly as a resource in Lovelace.

Big picture
- Single-file Web Component: defines `customElements.define('season-indicator-card', ...)` and registers metadata via `window.customCards`.
- Integration point: Home Assistant Lovelace via `ha-card` and the `hass` property (the component reads `this._hass` when provided).
- Styling: component uses Shadow DOM and inline styles, but respects several Home Assistant CSS variables (`--ha-card-background`, `--primary-text-color`, `--secondary-text-color`, `--ha-card-border-radius`, `--ha-card-box-shadow`).

Key implementation notes you can rely on
- Config API: `setConfig(config)` validates and merges defaults. Config keys you can change in Lovelace: `spring_name`, `summer_name`, `autumn_name`, `winter_name`, `spring_color`, `summer_color`, `autumn_color`, `winter_color`, `day_text`, `day_of_year_text`.
- Data logic: the code shifts the year so the timeline starts on March 21 (day 80 becomes day 1). Seasons are defined with explicit day ranges and day counts. `yearProgress` is computed as `(adjustedDay / 365) * 100` and used to position the indicator.
- Accessibility & size: `getCardSize()` returns `2` (used by Lovelace layout).

Developer workflows
- No build step: the card is pure JS. To test locally:
  - Copy `season-indicator-card.js` to Home Assistant `www/custom_cards/` and add a Lovelace resource entry pointing to the file, or
  - Serve the repo via a local HTTP server (e.g., `python3 -m http.server 8000`) and add the resource URL to Lovelace.
- Quick Lovelace example (YAML card):

  type: 'custom:season-indicator-card'
  spring_name: 'Wiosna'
  spring_color: '#4CAF50'

- Debugging tips:
  - Open browser DevTools and inspect the element; the component uses Shadow DOM so expand the shadow root to view internals.
  - Add `console.log` in `setConfig()` or `set hass()` to inspect runtime `config` and `hass` payloads.
  - Reload Lovelace resources after edits (Clear cache / hard reload may be required).

Project-specific conventions
- Language/defaults: the defaults in the file are Polish (e.g., `Wiosna`, `dzień roku`). Change via config keys rather than editing the file if you want different locale strings.
- Visuals done inline: colors and icons (emoji) are declared inside the component. If you prefer external theming, override the provided CSS variables or pass color config values.

What to change and how
- To add localization or unit tests, create a small wrapper or a second file — keep the original file as the component implementation.
- To change season boundaries or astronomy logic: edit `getSeasonInfo()`; note the code intentionally shifts the day-of-year so spring is the timeline start.

Files to inspect when editing
- [season-indicator-card.js](season-indicator-card.js) — single source of truth for config, rendering, styles, and date logic.

When unsure, ask about
- Desired localization (language/date formats) and whether to support leap years more explicitly, because current math uses 365 days.

Next steps
- I added this guidance file to the repo. Tell me if you'd like me to add a README snippet, a small test harness page, or example Lovelace dashboard YAML to the repository.
