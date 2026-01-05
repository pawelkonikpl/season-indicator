# Season Indicator Card

Custom card for Home Assistant showing the current season as a **horizontal timeline** with colored sections and a moving indicator.

## 🎨 Features

- **Single horizontal timeline** split into 4 colored season sections:
  - 🌸 **Spring** (green) - Mar 21 - Jun 20 (92 days)
  - ☀️ **Summer** (yellow) - Jun 21 - Sep 22 (94 days)
  - 🍂 **Autumn** (orange) - Sep 23 - Dec 20 (89 days)
  - ❄️ **Winter** (blue) - Dec 21 - Mar 20 (90 days)
- **Animated indicator** showing the exact position in the year
- Displays current season with an icon
- Shows progress within the current season (e.g. "Day 15 of 92")
- Day of year (1-365)
- Labels with season icons under the timeline
- Pulsing dot on the indicator

## 📦 Installation

### Method 1: HACS (recommended when available)
1. Open HACS in Home Assistant
2. Click on "Frontend"
3. Click the "+" button in the bottom-right
4. Search for "Season Indicator Card"

### Method 2: Manual install
**Step 1: Copy the file**
Copy the file `season-indicator-card.js` to:
```
/config/www/season-indicator-card.js
```
**Step 2: Add resource**
Choose one of the methods:

#### A) Via UI (easier):
1. Go to **Settings** → **Dashboards** → **Resources** tab
2. Click **"ADD RESOURCE"**
3. Enter:
   - **URL:** `/local/season-indicator-card.js`
   - **Resource type:** **JavaScript Module**
4. Click **"CREATE"**

#### B) Via configuration.yaml:
```yaml
lovelace:
  mode: storage
  resources:
    - url: /local/season-indicator-card.js
      type: module
```
**Step 3: Refresh**
Clear your browser cache (Ctrl+F5) or restart Home Assistant

## 🚀 Usage

### Basic configuration (default names):
```yaml
type: custom:season-indicator-card
```
### Configure custom names:
```yaml
type: custom:season-indicator-card
spring_name: "Spring"
summer_name: "Summer"
autumn_name: "Fall"
winter_name: "Winter"
```
### Full config (names + colors):
```yaml
type: custom:season-indicator-card
spring_name: "Spring 🌱"
summer_name: "Summer ☀"
autumn_name: "Autumn 🍁"
winter_name: "Winter ⛄"
spring_color: "#2ecc71"
summer_color: "#f39c12"
autumn_color: "#d35400"
winter_color: "#3498db"
```

## ⚙️ Configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `spring_name` | string | `"Wiosna"` | Spring name |
| `summer_name` | string | `"Lato"` | Summer name |
| `autumn_name` | string | `"Jesień"` | Autumn name |
| `winter_name` | string | `"Zima"` | Winter name |
| `spring_color` | string | `"#4CAF50"` | Spring color (hex) |
| `summer_color` | string | `"#FFC107"` | Summer color (hex) |
| `autumn_color` | string | `"#FF9800"` | Autumn color (hex) |
| `winter_color` | string | `"#2196F3"` | Winter color (hex) |
| `day_text` | string | `"Dzień"` | Text for "Day" |
| `day_of_year_text` | string | `"dzień roku"` | Text for "day of year" |

## 🔧 How it works

The card computes the current day of year and displays it on a **horizontal timeline**. The timeline starts at Spring (Mar 21) so seasons appear in logical order without a break:
```
[Spring]→[Summer]→[Autumn]→[Winter]
Mar 21   Jun 21   Sep 23   Dec 21   Mar 20
```
Season breakdown:
- **Spring**: Mar 21 - Jun 20 = 92 days
- **Summer**: Jun 21 - Sep 22 = 94 days
- **Autumn**: Sep 23 - Dec 20 = 89 days
- **Winter**: Dec 21 - Mar 20 = 90 days

Example:
- **Jan 5** (day 5 of year) → **Winter** (day 16 of winter) → indicator in last quarter
- **Jul 15** (day 196 of year) → **Summer** (day 24 of summer) → indicator in second quarter

## 🐛 Troubleshooting

**Card does not appear:**
- Ensure the file is in `/config/www/`
- Verify the resource is added in Settings
- Clear browser cache (CTRL+F5)
- Check browser console (F12) for errors

**Error "Custom element doesn't exist":**
- Wait a moment after adding the resource
- Restart Home Assistant
- Refresh the browser with cache cleared

## 📝 License

MIT License

If you'd like a shorter README variant or a Polish version, let me know!