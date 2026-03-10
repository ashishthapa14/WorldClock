# 🌎 World Clock & Space Tracker

A **premium, glassmorphic React application** that displays localized time, global timezone differences, countdown timers, and live celestial body tracking.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![React Vite](https://img.shields.io/badge/React-Vite-blue) ![Architecture](https://img.shields.io/badge/Architecture-Custom_Hooks-purple)

## ✨ Core Features
- 🕒 **Live Local Clock**: Displays precise 12/24-Hour local time with ticking seconds.
- 🌗 **Celestial Tracker**: Beautiful animated Sun and Moon icons that arc across the screen relative to your local time of day, including real-time Moon Phase calculations!
- 🛰️ **Space Fact Widget**: Periodically fetches a random cosmic astronomy fact directly from **NASA's APOD API** (with a fallback to curated local planet facts).
- 🌐 **Global Time Converter**: Search for any city or country (powered by the **Open-Meteo Geocoding API**) to instantly see its current time and the relative difference (`"2h 30m ahead"`) from your local timezone.
- 🍅 **Focus Sessions**: Built-in 25-minute Pomodoro timer for productivity.
- ⏱️ **Timer & Stopwatch**: Customizable hours/mins/seconds countdown Timer and a high-precision millisecond Stopwatch with Lap tracking.

## 🏗️ Architecture Design (Senior Level)
This project is built to the standard of a scalable, maintainable Enterprise React codebase:

1. **Custom Hook Side-Effects (`/hooks`)**
   - `useCurrentTime`: Completely isolates the `setInterval` clock ticking logic to a clean custom hook return.
   - `useGeolocation`: Handles the Geolocation API permission request and OpenStreetMap reverse-geocoding resolution.
   - `useCitySearch`: Manages a debounced input query effect against the Open-Meteo API.
2. **Pure Utility Modules (`/utils`)**
   - Mathematical calculations (Timezone string parses) and display formatting (`MM:SS.ms`) are decoupled from Component trees into pure, easily testable functions.
3. **Optimized Render Tree**
   - Extensive usage of `useMemo` and `useCallback` to prevent the heavy visual animations and SVG layers from re-rendering un-necessarily.
4. **Defensive Typing**
   - Fortified with `PropTypes` and strict linting.
5. **React Compiler**
   - Powered by the experimental `babel-plugin-react-compiler` for optimal performance.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ashishthapa14/WorldClock.git
   cd WorldClock
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## 🎨 Design & Styling
The styling is heavily reliant on modern **Vanilla CSS** to deliver a sleek, minimalist **Glassmorphism** effect over a high-resolution dotted world map. Features smooth CSS transitions and bespoke toggles.

---
*Built with React, Vite, CSS3, and Open-Source Space APIs.*
