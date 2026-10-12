# RUNHealthy - Personalised Environmental Health Assistant

A browser-based prototype that provides real-time environmental health recommendations for individuals with respiratory conditions like asthma. The system integrates live weather and air quality data to offer personalized, actionable exercise guidance.

## 🎯 Project Overview

RUNHealthy helps users with asthma or similar conditions make informed decisions about outdoor exercise by:
- Fetching real-time PM2.5 and temperature data from Open-Meteo APIs
- Comparing environmental conditions against user-defined safety thresholds
- Providing clear, color-coded recommendations
- Allowing full customization via a local `config.json` file

**Target User**: Abayomi Gbolagade (62-year-old retired civil servant with asthma, low tech literacy)

## 📁 Project Structure
PROJECT RUNHEALTHY/
├── component/
│ ├── alert/ # Alert notification system
│ ├── dialog/ # Settings dialog modal
│ ├── gauge/ # Temperature and PM2.5 gauges
│ └── nav/ # Navigation component
├── config/
│ ├── config.json # Default configuration
│ └── configManager.js # Configuration management
├── css/
│ ├── variables.css # CSS custom properties
│ ├── dashboard.css # Dashboard page styles
│ └── settings.css # Settings page styles
├── js/
│ ├── dashboard.js # Dashboard logic and gauges
│ ├── eventBus.js # Event communication system
│ ├── script.js # Main application script
│ ├── settings.js # Settings page logic
│ └── validation.js # Input validation utilities
├── network/
│ └── apiManager.js # API integration with caching
├── res/ # Images and icons
├── dashboard.html # Main dashboard page
├── settings.html # Settings page
├── index.html # Landing page
└── README.md # This file

## 🚀 Key Features

### **Core Functionality**
- ✅ Real-time PM2.5 and temperature monitoring
- ✅ Personalized safety thresholds via `config.json`
- ✅ Color-coded recommendations (Good/Caution/Bad)
- ✅ Interactive temperature and air quality gauges
- ✅ Event-driven architecture for loose coupling

### **Technical Implementation**
- ✅ Modular ES6 JavaScript with imports/exports
- ✅ Responsive design for all screen sizes
- ✅ No PII collection - privacy by design
- ✅ Local configuration without code changes

### **User Experience**
- ✅ Clear, large text for accessibility
- ✅ Simple navigation with icon + text labels
- ✅ Immediate feedback through alerts
- ✅ One-click settings adjustment

## 🛠️ Setup & Usage

### **Prerequisites**
- Modern web browser (Chrome 90+, Firefox 88+)
- Local web server (VS Code Live Server)

### **Running Locally**
1. Clone or download the project
2. Start a local web server:

Configuration

Edit config/config.json to customize:
Safety thresholds (PM2.5, temperature range)
User profile (location, condition)
Advice messages for different conditions

Example configuration:
{
  "userProfile": {
    "condition": "asthma",
    "location": "London",
    "preferredActivity": "Outdoor Walking"
  },
  "thresholds": {
    "air": { "pm25": 35, "unit": "ug/m³" },
    "temperature": { "min": 5, "max": 30, "unit": "°C" }
  }
}

📊 API Integration
The application uses two Open-Meteo APIs:

Geocoding API - Convert city names to coordinates
Weather API - Current temperature and forecasts
Air Quality API - PM2.5 and AQI data

Caching Strategy
Geocoding data: 24-hour TTL (locations rarely change)
LocalStorage used for client-side caching

🎨 Design Principles
Accessibility
Large text (≥18pt) for users with visual impairments
High contrast color schemes
Icon + text labels for clear navigation
Keyboard-navigable dialog

User-Centered Design
Focus on user Abayomi (62, low tech literacy)
Immediate, actionable recommendations
Minimal cognitive load
Clear visual hierarchy

Sustainability
Encourages walking/cycling (low-carbon transport)
Efficient API calls with caching
No server-side infrastructure required

🔧 Technical Architecture
Event-Driven Communication
// Components communicate via events
emit("network:data", data);        // API data available
on("config:changed", updateUI);    // Config updated
emit("alert:show", {message, type}); // Show notification

Component Structure
Each component is self-contained with:
HTML template
CSS styles
JavaScript logic
Event listeners

Configuration Management
Default values in config.json
User overrides in localStorage
Live updates without page refresh

📝 Code Quality

Key JavaScript Patterns
Modular imports/exports
Async/await for API calls
Error boundaries and fallbacks
Comprehensive input validation

CSS Methodology
CSS Custom Properties for theming
Mobile-first responsive design
Accessibility-focused styling

🔮 Future Improvements
// To be written

📚 Academic Context
This prototype was developed for Bournemouth University's Programming and Prototyping unit (Level 7). It demonstrates:

Iterative Design - From low-fidelity sketches to high-fidelity prototype
User-Centered Development - Based on persona Abayomi Gbolagade
API Integration - Real-time data from Open-Meteo
Sustainable Practices - Consideration of environmental impact
Professional Standards - Adherence to ethical and legal guidelines

👥 Credits
Developer: Bankole Damilola Ilyas
University: Bournemouth University
Unit: Programming and Prototyping
Supervisor: Botao Fan

APIs: Open-Meteo (free weather and air quality API)
Icons: Custom SVG icons
Fonts: System UI fonts for maximum compatibility

📄 License
This project is for academic purposes as part of Bournemouth University coursework. All code is original work unless otherwise attributed.

Figma resources
Final project prototype: https://www.figma.com/design/xbJ0CRY5paMz6G6paBzi3o/RunHealthy?node-id=10-340&t=fgRnSXSbeuBjtxnh-1
Persona: https://www.figma.com/design/xbJ0CRY5paMz6G6paBzi3o/RunHealthy?node-id=123-3&t=fgRnSXSbeuBjtxnh-1


## 📝 Assessment Feedback (MSc Programming & Prototyping, Bournemouth University)

**Summary of assessor feedback:**

- **Prototype quality:** Rated *"of a high standard, running reliably with clear interaction and data integration"*. Recommendations display effectively, and changing the safety thresholds updates the labels and advice **without any code changes**.
- **Problem definition:** A clear problem space grounded in a credible scenario (an older adult with asthma preparing to go outdoors), with user pain points drawn from the persona and context analysis.
- **Design process:** A coherent progression towards an "advice-first" layout, with reasons given for rejecting earlier design approaches.
- **Professional considerations:** Covered sustainability, legal/ethical and professional issues, with sound awareness of risk.