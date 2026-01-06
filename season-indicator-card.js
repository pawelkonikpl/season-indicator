class SeasonIndicatorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._cssText = null;
    this._stylesLoaded = false;
    this.loadStyles();
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    
    // Default names, colors and UI texts
    this.config = {
      spring_name: config.spring_name || 'Spring',
      summer_name: config.summer_name || 'Summer',
      autumn_name: config.autumn_name || 'Autumn',
      winter_name: config.winter_name || 'Winter',
      spring_color: config.spring_color || '#4CAF50',
      summer_color: config.summer_color || '#FFC107',
      autumn_color: config.autumn_color || '#FF9800',
      winter_color: config.winter_color || '#2196F3',
      day_text: config.day_text || 'Day',
      day_of_year_text: config.day_of_year_text || 'day of year',
      ...config
    };
    
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  async loadStyles() {
    if (this._stylesLoaded) return;
    try {
      const resp = await fetch('season-indicator-card.css');
      if (!resp.ok) return;
      this._cssText = await resp.text();
      this._stylesLoaded = true;
      this.render();
    } catch (e) {
      // ignore - fallback to inline styles if fetch fails
    }
  }

  getCardSize() {
    return 2;
  }

  getSeasonInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    let dayOfYear = Math.floor(diff / oneDay);

    // Leap year check
    const isLeap = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
    const daysInYear = isLeap ? 366 : 365;

    // Shift the year so it starts from spring (day 80 becomes day 1)
    // This makes the timeline intuitive: Spring -> Summer -> Autumn -> Winter
    let adjustedDay = dayOfYear - 79; // dzień 80 (21 marca) staje się dniem 1
    if (adjustedDay <= 0) {
      adjustedDay = daysInYear + adjustedDay; // Dla dni 1-79 (styczeń-marzec)
    }

    // Division of the year into seasons - adjust for leap years
    // Spring: 92 days (Mar 21-Jun 20), Summer: 94 (Jun 21-Sep 22), Autumn: 89 (Sep 23-Dec 20), Winter: 90 or 91 (Dec 21-Mar 20)
    // In leap years, add the extra day to summer (most common convention)
    const springDays = 92;
    const summerDays = isLeap ? 95 : 94;
    const autumnDays = 89;
    const winterDays = daysInYear - (springDays + summerDays + autumnDays); // 90 or 91

    const seasons = [
      { name: this.config.spring_name, start: 1, end: springDays, color: this.config.spring_color, icon: '🌸', days: springDays },
      { name: this.config.summer_name, start: springDays + 1, end: springDays + summerDays, color: this.config.summer_color, icon: '☀️', days: summerDays },
      { name: this.config.autumn_name, start: springDays + summerDays + 1, end: springDays + summerDays + autumnDays, color: this.config.autumn_color, icon: '🍂', days: autumnDays },
      { name: this.config.winter_name, start: springDays + summerDays + autumnDays + 1, end: daysInYear, color: this.config.winter_color, icon: '❄️', days: winterDays }
    ];

    let currentSeason;
    let seasonIndex;
    let progressInSeason;
    
    for (let i = 0; i < seasons.length; i++) {
      if (adjustedDay >= seasons[i].start && adjustedDay <= seasons[i].end) {
        currentSeason = seasons[i];
        seasonIndex = i;
        progressInSeason = adjustedDay - seasons[i].start;
        break;
      }
    }

    // Calculate the indicator position on the timeline (0-100%)
    const yearProgress = (adjustedDay / daysInYear) * 100;

    return {
      seasons,
      currentSeason,
      seasonIndex,
      progressInSeason,
      dayOfYear,
      yearProgress
    };
  }

  render() {
    const { 
      seasons, 
      currentSeason, 
      seasonIndex, 
      progressInSeason,
      dayOfYear, 
      yearProgress 
    } = this.getSeasonInfo();

    this.shadowRoot.innerHTML = `
      <style id="season-styles"></style>
      
      <ha-card>
        <div class="card">
          <div class="header">
            <div class="current-info">
              <div class="season-icon">${currentSeason.icon}</div>
              <div class="season-details">
                <div class="current-season">${currentSeason.name}</div>
                <div class="season-progress">
                  ${this.config.day_text} ${progressInSeason + 1} z ${currentSeason.days}
                </div>
              </div>
            </div>
            <div class="day-info">
              <div class="day-number">${dayOfYear}</div>
              <div>${this.config.day_of_year_text}</div>
            </div>
          </div>
          
          <div class="timeline-container">
            <div class="timeline">
              ${seasons.map((season, index) => `
                <div class="season-segment ${index === seasonIndex ? 'active' : ''}" 
                     style="background: ${season.color};">
                  <div class="season-name">${season.name}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="indicator-container">
              <div class="indicator" style="left: ${yearProgress}%; transform: translateX(-50%);">
                <div class="indicator-line"></div>
                  <div class="indicator-dot" style="background: ${currentSeason.color};"></div>
              </div>
            </div>
          </div>
          
          <div class="labels">
            ${seasons.map(season => `
              <div class="label">
                <div class="label-icon">${season.icon}</div>
                <div>${season.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </ha-card>
    `;

    // Inject fetched CSS into the placeholder <style> inside the shadow root
    const stylePlaceholder = this.shadowRoot.querySelector('#season-styles');
    if (stylePlaceholder && this._cssText) {
      stylePlaceholder.textContent = this._cssText;
    }
  }
}

customElements.define('season-indicator-card', SeasonIndicatorCard);

// Add the card to the custom cards list
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'season-indicator-card',
  name: 'Season Indicator Card',
  description: 'A card showing the current season with visual timeline and progress indicator'
});