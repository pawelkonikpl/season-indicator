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
      spring_name: config.spring_name || 'Wiosna',
      summer_name: config.summer_name || 'Lato',
      autumn_name: config.autumn_name || 'Jesień',
      winter_name: config.winter_name || 'Zima',
      spring_color: config.spring_color || '#4CAF50',
      summer_color: config.summer_color || '#FFC107',
      autumn_color: config.autumn_color || '#FF9800',
      winter_color: config.winter_color || '#2196F3',
      day_text: config.day_text || 'Dzień',
      day_of_year_text: config.day_of_year_text || 'dzień roku',
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
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    let dayOfYear = Math.floor(diff / oneDay);
    
    // Shift the year so it starts from spring (day 80 becomes day 1)
    // This makes the timeline intuitive: Spring -> Summer -> Autumn -> Winter
    let adjustedDay = dayOfYear - 79; // dzień 80 (21 marca) staje się dniem 1
    if (adjustedDay <= 0) {
      adjustedDay = 365 + adjustedDay; // Dla dni 1-79 (styczeń-marzec)
    }
    
    // Division of the year into seasons - now in logical order
    const seasons = [
      { name: this.config.spring_name, start: 1, end: 92, color: this.config.spring_color, icon: '🌸', days: 92 },
      { name: this.config.summer_name, start: 93, end: 186, color: this.config.summer_color, icon: '☀️', days: 94 },
      { name: this.config.autumn_name, start: 187, end: 275, color: this.config.autumn_color, icon: '🍂', days: 89 },
      { name: this.config.winter_name, start: 276, end: 365, color: this.config.winter_color, icon: '❄️', days: 90 }
    ];
    
    let currentSeason;
    let seasonIndex;
    let progressInSeason;
    
    if (adjustedDay >= 1 && adjustedDay <= 92) {
      // Spring: March 21 - June 20
      currentSeason = seasons[0];
      seasonIndex = 0;
      progressInSeason = adjustedDay - 1;
    } else if (adjustedDay >= 93 && adjustedDay <= 186) {
      // Summer: June 21 - September 22
      currentSeason = seasons[1];
      seasonIndex = 1;
      progressInSeason = adjustedDay - 93;
    } else if (adjustedDay >= 187 && adjustedDay <= 275) {
      // Autumn: September 23 - December 20
      currentSeason = seasons[2];
      seasonIndex = 2;
      progressInSeason = adjustedDay - 187;
    } else {
      // Winter: December 21 - March 20
      currentSeason = seasons[3];
      seasonIndex = 3;
      progressInSeason = adjustedDay - 276;
    }
    
    // Calculate the indicator position on the timeline (0-100%)
    const yearProgress = (adjustedDay / 365) * 100;
    
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