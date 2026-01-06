# Season Indicator Card

A simple Home Assistant custom card that displays the current season on a horizontal timeline with a moving indicator.

## Installation (HACS)

This repository is packaged for HACS. The recommended way to install the card is via HACS.

1. Create a release on GitHub and tag it with a semver version (for example `v1.0.0`). The repository includes a `hacs.json` file so HACS will detect it as a frontend plugin.
2. In Home Assistant open **HACS → Frontend** and click the **+** button. Search for "Season Indicator Card" and install it, or add the repository manually by URL.

Note: The repository includes a separate stylesheet file `season-indicator-card.css`. When installed via HACS the CSS is provided together with the card. To customize appearance you can edit that file or override Home Assistant theme variables.

## Usage

Add the card to Lovelace (example):

```yaml
type: custom:season-indicator-card
# Optional customizations:
# spring_name: "Spring"
# summer_name: "Summer"
# autumn_name: "Autumn"
# winter_name: "Winter"
# spring_color: "#4CAF50"
# summer_color: "#FFC107"
# autumn_color: "#FF9800"
# winter_color: "#2196F3"
```

## Troubleshooting

- If the card does not appear after installation, wait a moment and refresh the page (clear browser cache / hard reload).
- If you see "Custom element doesn't exist", try restarting Home Assistant and refreshing the browser cache.
- Inspect the browser console (F12) for errors if the card still does not load.

## License

MIT License — see the bundled `LICENSE` file for details.
