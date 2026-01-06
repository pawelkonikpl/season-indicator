class SeasonIndicatorCard extends HTMLElement {
  static get styles() {
    return `
      .card {
        padding: 24px;
        background: var(--ha-card-background, var(--card-background-color, white));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }

      .current-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .season-icon {
        font-size: 40px;
        line-height: 1;
      }

      .season-details {
        display: flex;
        flex-direction: column;
      }

      .current-season {
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-text-color);
        line-height: 1.2;
      }

      .season-progress {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .day-info {
        font-size: 14px;
        color: var(--secondary-text-color);
        text-align: right;
      }

      .day-number {
        font-size: 20px;
        font-weight: bold;
        color: var(--primary-text-color);
      }

      .timeline-container {
        position: relative;
        margin: 20px 0;
      }

      .timeline {
        display: flex;
        height: 50px;
        border-radius: 25px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        position: relative;
      }

      .season-segment {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: all 0.3s ease;
      }

      .season-segment:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 10%;
        height: 80%;
        width: 1px;
        background: rgba(255,255,255,0.3);
      }

      .season-segment.active {
        box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
      }

      .season-name {
        color: white;
        font-weight: bold;
        font-size: 14px;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
        z-index: 1;
      }

      .indicator-container {
        position: relative;
        height: 40px;
        margin-top: -10px;
      }

      .indicator {
        position: absolute;
        transform: translateX(-50%);
        transition: left 0.5s ease;
      }

      .indicator-line {
        width: 3px;
        height: 30px;
        background: var(--primary-text-color, #333);
        margin: 0 auto;
        border-radius: 2px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      .indicator-dot {
        width: 16px;
        height: 16px;
        border: 3px solid var(--ha-card-background, white);
        border-radius: 50%;
        margin: -5px auto 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        padding: 0 4px;
      }

      .label {
        font-size: 11px;
        color: var(--secondary-text-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .label-icon {
        font-size: 16px;
      }
    `;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
      <style>${SeasonIndicatorCard.styles}</style>

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