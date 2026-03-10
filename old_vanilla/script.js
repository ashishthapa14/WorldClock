const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const ampmEl = document.getElementById('ampm');
const dateEl = document.getElementById('date');
const locationEl = document.getElementById('location');
const sunEl = document.getElementById('sun');
const moonEl = document.getElementById('moon');
const statusEl = document.getElementById('celestial-status');

// Helper to quickly display time zone based location
function setFallbackLocation() {
    const tzFallback = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tzFallback) {
        const parts = tzFallback.split('/');
        const city = parts[parts.length - 1].replace(/_/g, ' ');
        const region = parts[0] ? parts[0].replace(/_/g, ' ') : '';
        locationEl.textContent = `${city}${region && region !== city ? ', ' + region : ''}`;
    } else {
        locationEl.textContent = "Local Time";
    }
}

// Automatically called on start
setFallbackLocation();

// Try to fetch precise location (city, country) using geolocation and reverse geocoding
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            // Nominatim OpenStreetMap API is free and doesn't require an API key
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();

            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state;
                const country = data.address.country;
                if (city && country) {
                    locationEl.textContent = `${city}, ${country}`;
                } else if (city || country) {
                    locationEl.textContent = city || country;
                }
            }
        } catch (e) {
            console.log("Could not reverse geocode location, keeping timezone name.", e);
        }
    }, (error) => {
        console.log("Geolocation denied or unavailable:", error.message);
    });
}

// -------------------- SPACE FACTS --------------------
const spaceFacts = [
    "Venus is the only planet that rotates clockwise.",
    "A day on Venus is longer than a year on Venus.",
    "Jupiter's Great Red Spot is a storm that has been raging for over 300 years.",
    "Neutron stars can spin 600 times per second.",
    "There are more trees on Earth than stars in the Milky Way.",
    "Halley's Comet will next appear in the night sky in the year 2061.",
    "One million Earths could fit inside the Sun.",
    "The sunset on Mars appears blue.",
    "Saturn has 146 moons, the most of any planet in our solar system.",
    "The footprints on the Moon will be there for 100 million years.",
    "The Milky Way galaxy is hurtling through space at roughly 1.3 million miles per hour.",
    "A year on Mercury consists of only 88 Earth days."
];

function rotateSpaceFact() {
    const factEl = document.getElementById('space-fact-text');
    if (!factEl) return;
    const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
    factEl.style.opacity = 0;
    setTimeout(() => {
        factEl.textContent = randomFact;
        factEl.style.opacity = 1;
    }, 500); // Wait for fade out
}

rotateSpaceFact();
setInterval(rotateSpaceFact, 15000); // 15 seconds

// -------------------- TIME CONVERTER (SEARCH) --------------------
const searchInput = document.getElementById('timezone-search');
const suggestionsList = document.getElementById('timezone-suggestions');
const convertedTimeEl = document.getElementById('converted-time');
const convertedLocationEl = document.getElementById('converted-location');
const timeDifferenceEl = document.getElementById('time-difference');

let selectedTimezone = "";
let searchTimeout = null;

function updateConvertedTime() {
    if (!convertedTimeEl) return;

    if (!selectedTimezone) {
        convertedTimeEl.textContent = "--:-- --";
        if (convertedLocationEl) convertedLocationEl.textContent = "Search for a city";
        if (timeDifferenceEl) timeDifferenceEl.style.display = 'none';
        return;
    }

    try {
        const now = new Date();
        const options = {
            timeZone: selectedTimezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        convertedTimeEl.textContent = formatter.format(now);

        // Calculate difference
        if (timeDifferenceEl) {
            // Get local timezone offset (minutes)
            // Note: getTimezoneOffset returns positive for behind UTC (e.g. EST is +300), negative for ahead
            const localOffset = -now.getTimezoneOffset();

            // Get target timezone offset
            // We can hack this by comparing UTC values formatting the target string
            const targetDateStr = now.toLocaleString('en-US', { timeZone: selectedTimezone });
            const targetDate = new Date(targetDateStr);
            // Difference in minutes
            const diffMinutes = Math.round((targetDate - now) / 60000);

            timeDifferenceEl.style.display = 'inline-block';

            if (diffMinutes === 0) {
                timeDifferenceEl.textContent = "Same time as local";
                timeDifferenceEl.className = "time-difference same";
            } else {
                const isAhead = diffMinutes > 0;
                const absDiff = Math.abs(diffMinutes);
                const diffH = Math.floor(absDiff / 60);
                const diffM = absDiff % 60;

                let diffText = "";
                if (diffH > 0) diffText += `${diffH}h `;
                if (diffM > 0) diffText += `${diffM}m `;

                diffText += isAhead ? "ahead" : "behind";

                timeDifferenceEl.textContent = diffText.trim();
                timeDifferenceEl.className = `time-difference ${isAhead ? 'ahead' : 'behind'}`;
            }
        }

    } catch (e) {
        convertedTimeEl.textContent = "Invalid Zone";
        if (timeDifferenceEl) timeDifferenceEl.style.display = 'none';
    }
}

if (searchInput && suggestionsList) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        // Debounce search
        clearTimeout(searchTimeout);

        if (!query) {
            suggestionsList.style.display = 'none';
            suggestionsList.innerHTML = '';
            selectedTimezone = "";
            updateConvertedTime();
            return;
        }

        // Show loading state
        suggestionsList.innerHTML = '<li class="suggestion-item">Searching...</li>';
        suggestionsList.style.display = 'block';

        searchTimeout = setTimeout(async () => {
            try {
                // Use Open-Meteo free geocoding API to find ANY city and its timezone
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
                const data = await res.json();

                suggestionsList.innerHTML = '';

                if (data.results && data.results.length > 0) {
                    data.results.forEach(place => {
                        // Skip locations without a timezone
                        if (!place.timezone) return;

                        const li = document.createElement('li');
                        li.className = 'suggestion-item';

                        // e.g. "Paris, Ile-de-France, France"
                        const details = [place.name];
                        if (place.admin1 && place.admin1 !== place.name) details.push(place.admin1);
                        if (place.country) details.push(place.country);

                        li.textContent = details.join(', ');

                        li.addEventListener('click', () => {
                            selectedTimezone = place.timezone;
                            searchInput.value = place.name;
                            if (convertedLocationEl) {
                                convertedLocationEl.textContent = details.join(', ');
                            }
                            suggestionsList.style.display = 'none';
                            updateConvertedTime();
                        });
                        suggestionsList.appendChild(li);
                    });
                } else {
                    suggestionsList.innerHTML = '<li class="suggestion-item">No results found</li>';
                }
            } catch (err) {
                console.error("Search API failed:", err);
                suggestionsList.innerHTML = '<li class="suggestion-item">Error fetching data</li>';
            }
        }, 400); // 400ms debounce
    });

    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });
}

// -------------------- MOON PHASE CALCULATION --------------------
function getMoonPhase(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 3) {
        year--;
        month += 12;
    }

    month++;
    let jd = 365.25 * year + 30.6 * month + day - 694039.09; // julian days
    jd /= 29.5305882; // lunar cycles
    let phase = jd - Math.floor(jd); // fractional part is phase

    if (phase < 0.03) return { name: "New Moon", icon: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"></circle>` };
    else if (phase < 0.22) return { name: "Waxing Crescent", icon: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>` };
    else if (phase < 0.28) return { name: "First Quarter", icon: `<path d="M12 3a9 9 0 0 1 0 18z"></path>` };
    else if (phase < 0.47) return { name: "Waxing Gibbous", icon: `<path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" fill-opacity="0.3"></path>` };
    else if (phase < 0.53) return { name: "Full Moon", icon: `<circle cx="12" cy="12" r="9" fill="currentColor"></circle>` };
    else if (phase < 0.72) return { name: "Waning Gibbous", icon: `<path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" fill-opacity="0.3"></path>` };
    else if (phase < 0.78) return { name: "Last Quarter", icon: `<path d="M12 3a9 9 0 0 0 0 18z"></path>` };
    else return { name: "Waning Crescent", icon: `<path d="M3 11.21A9 9 0 1 0 12.79 21 7 7 0 0 1 3 11.21z"></path>` };
}

// -------------------- MAIN CLOCK --------------------
function updateTime() {
    const now = new Date();

    // Extract time components
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    // Format AM/PM
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;

    hoursEl.textContent = displayHour.toString().padStart(2, '0');
    minutesEl.textContent = m.toString().padStart(2, '0');
    secondsEl.textContent = s.toString().padStart(2, '0');
    ampmEl.textContent = ampm;

    // Format Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, options);



    // Update Sun and Moon
    updateCelestialBodies(h, m, s, now);

    // Update time converter
    updateConvertedTime();
}

function updateCelestialBodies(hours, minutes, seconds, now) {
    // Total decimal hours elapsed in the day (0 to 24)
    const decimalHours = hours + (minutes / 60) + (seconds / 3600);

    // Sun is visible roughly between 6:00 and 18:00 (12 hours)
    const isDayTime = decimalHours >= 6 && decimalHours < 18;

    if (isDayTime) {
        sunEl.style.opacity = '1';
        moonEl.style.opacity = '0';

        // Progress from 0 to 1 over the course of the day (6am to 6pm)
        const dayProgress = (decimalHours - 6) / 12;

        // Calculate arc
        // X goes from 10% to 90%
        const xPos = 10 + (dayProgress * 80);
        // Y follows an inverted parabola, peaking at 20% height, starting/ending at 80% height
        const yPos = 80 - (Math.sin(dayProgress * Math.PI) * 60);

        sunEl.style.left = `${xPos}%`;
        sunEl.style.top = `${yPos}%`;

        // Determine exact phase for status
        if (dayProgress < 0.2) statusEl.textContent = "Morning • Sun is rising";
        else if (dayProgress > 0.8) statusEl.textContent = "Evening • Sun is setting";
        else statusEl.textContent = "Daytime • Sun is shining";

    } else {
        sunEl.style.opacity = '0';
        moonEl.style.opacity = '1';

        // Progress from 0 to 1 over the course of the night (6pm to 6am)
        let nightProgress;
        if (decimalHours >= 18) {
            // 6pm (18:00) to midnight (24:00) -> progress 0 to 0.5
            nightProgress = (decimalHours - 18) / 12;
        } else {
            // midnight (0:00) to 6am (6:00) -> progress 0.5 to 1.0
            nightProgress = 0.5 + (decimalHours / 12);
        }

        // Calculate arc for moon across the screen
        const xPos = 10 + (nightProgress * 80);
        const yPos = 80 - (Math.sin(nightProgress * Math.PI) * 60);

        moonEl.style.left = `${xPos}%`;
        moonEl.style.top = `${yPos}%`;

        // Determine exact phase for status
        if (nightProgress < 0.2) statusEl.textContent = "Evening • Moon is rising";
        else if (nightProgress > 0.8) statusEl.textContent = "Early Morning • Moon is setting";
        else statusEl.textContent = "Nighttime • Moon is shining";

        // Dynamic Moon Phase Icons and Tooltip
        const moonPhase = getMoonPhase(now);
        const moonPhaseNameEl = document.getElementById('moon-phase-name');
        const moonIconEl = document.getElementById('moon-icon');
        if (moonPhaseNameEl && moonIconEl) {
            moonPhaseNameEl.textContent = moonPhase.name;
            moonIconEl.innerHTML = moonPhase.icon;
        }
    }
}

// Initial draw
updateTime();

// Update every second
setInterval(updateTime, 1000);

// -------------------- NAVIGATION SWITCHING --------------------
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const celestialLayer = document.querySelector('.celestial-layer');
const spaceFactWidget = document.querySelector('.space-fact-widget');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        views.forEach(view => view.classList.remove('active'));

        item.classList.add('active');

        const targetId = item.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        targetView.classList.add('active');

        // Hide sun/moon strictly when not in home view
        if (targetId === 'view-home') {
            celestialLayer.style.opacity = '1';
            if (spaceFactWidget) {
                spaceFactWidget.style.opacity = '1';
                spaceFactWidget.style.pointerEvents = 'auto';
            }
        } else {
            celestialLayer.style.opacity = '0';
            if (spaceFactWidget) {
                spaceFactWidget.style.opacity = '0';
                spaceFactWidget.style.pointerEvents = 'none';
            }
        }
    });
});

// -------------------- FOCUS SESSION (POMODORO) --------------------
let focusInterval = null;
let focusTimeRemaining = 25 * 60; // 25 minutes default
let isFocusRunning = false;

const focusMinsEl = document.getElementById('focus-minutes');
const focusSecsEl = document.getElementById('focus-seconds');
const focusStartBtn = document.getElementById('focus-start-btn');
const focusResetBtn = document.getElementById('focus-reset-btn');
const focusStatusText = document.getElementById('focus-status-text');

function updateFocusDisplay() {
    const mins = Math.floor(focusTimeRemaining / 60);
    const secs = focusTimeRemaining % 60;
    focusMinsEl.textContent = mins.toString().padStart(2, '0');
    focusSecsEl.textContent = secs.toString().padStart(2, '0');
}

focusStartBtn.addEventListener('click', () => {
    if (isFocusRunning) {
        clearInterval(focusInterval);
        focusStartBtn.textContent = 'Resume';
        isFocusRunning = false;
        focusStatusText.textContent = "Session paused";
    } else {
        if (focusTimeRemaining <= 0) focusTimeRemaining = 25 * 60; // Reset if finished
        focusStartBtn.textContent = 'Pause';
        isFocusRunning = true;
        focusStatusText.textContent = "Focusing...";

        focusInterval = setInterval(() => {
            focusTimeRemaining--;
            updateFocusDisplay();

            if (focusTimeRemaining <= 0) {
                clearInterval(focusInterval);
                isFocusRunning = false;
                focusStartBtn.textContent = 'Start';
                focusStatusText.textContent = "Session Complete!";
                // Play a simple beep
                const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
                audio.play().catch(e => console.log('Audio disabled'));
            }
        }, 1000);
    }
});

focusResetBtn.addEventListener('click', () => {
    clearInterval(focusInterval);
    isFocusRunning = false;
    focusTimeRemaining = 25 * 60;
    updateFocusDisplay();
    focusStartBtn.textContent = 'Start';
    focusStatusText.textContent = "Ready to focus";
});

// -------------------- TIMER --------------------
let timerInterval = null;
let timerTotalSeconds = 0;
let isTimerRunning = false;

const timerInputH = document.getElementById('timer-input-h');
const timerInputM = document.getElementById('timer-input-m');
const timerInputS = document.getElementById('timer-input-s');
const timerInputsGroup = document.getElementById('timer-inputs');
const timerDisplayGroup = document.getElementById('timer-display');

const timerHEl = document.getElementById('timer-h');
const timerMEl = document.getElementById('timer-m');
const timerSEl = document.getElementById('timer-s');

const timerStartBtn = document.getElementById('timer-start-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');

function updateTimerDisplay() {
    const h = Math.floor(timerTotalSeconds / 3600);
    const m = Math.floor((timerTotalSeconds % 3600) / 60);
    const s = timerTotalSeconds % 60;

    timerHEl.textContent = h.toString().padStart(2, '0');
    timerMEl.textContent = m.toString().padStart(2, '0');
    timerSEl.textContent = s.toString().padStart(2, '0');
}

timerStartBtn.addEventListener('click', () => {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        timerStartBtn.textContent = 'Resume';
        isTimerRunning = false;
    } else {
        // If not running and showing inputs, calculate total seconds
        if (timerInputsGroup.style.display !== 'none') {
            const h = parseInt(timerInputH.value) || 0;
            const m = parseInt(timerInputM.value) || 0;
            const s = parseInt(timerInputS.value) || 0;
            timerTotalSeconds = (h * 3600) + (m * 60) + s;

            if (timerTotalSeconds <= 0) return; // Don't start if 0

            timerInputsGroup.style.display = 'none';
            timerDisplayGroup.style.display = 'flex';
        }

        if (timerTotalSeconds <= 0) return;

        updateTimerDisplay();
        timerStartBtn.textContent = 'Pause';
        isTimerRunning = true;

        timerInterval = setInterval(() => {
            timerTotalSeconds--;
            updateTimerDisplay();

            if (timerTotalSeconds <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                timerStartBtn.textContent = 'Start';

                // Show inputs again
                timerInputsGroup.style.display = 'flex';
                timerDisplayGroup.style.display = 'none';

                const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
                audio.play().catch(e => console.log('Audio disabled'));
            }
        }, 1000);
    }
});

timerResetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerStartBtn.textContent = 'Start';
    timerInputsGroup.style.display = 'flex';
    timerDisplayGroup.style.display = 'none';
    timerInputH.value = '';
    timerInputM.value = '';
    timerInputS.value = '';
});

// -------------------- STOPWATCH --------------------
let stopwatchInterval = null;
let stopwatchElapsedTime = 0; // in milliseconds
let isStopwatchRunning = false;
let lastStopwatchTime = 0;
let lapCounter = 1;

const stopwatchMEl = document.getElementById('stopwatch-m');
const stopwatchSEl = document.getElementById('stopwatch-s');
const stopwatchMsEl = document.getElementById('stopwatch-ms');
const stopwatchStartBtn = document.getElementById('stopwatch-start-btn');
const stopwatchLapBtn = document.getElementById('stopwatch-lap-btn');
const stopwatchResetBtn = document.getElementById('stopwatch-reset-btn');
const lapsList = document.getElementById('laps-list');

function formatStopwatchTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10); // 2 digits

    return {
        m: minutes.toString().padStart(2, '0'),
        s: seconds.toString().padStart(2, '0'),
        ms: milliseconds.toString().padStart(2, '0')
    };
}

function updateStopwatchDisplay() {
    const formatted = formatStopwatchTime(stopwatchElapsedTime);
    stopwatchMEl.textContent = formatted.m;
    stopwatchSEl.textContent = formatted.s;
    stopwatchMsEl.textContent = formatted.ms;
}

stopwatchStartBtn.addEventListener('click', () => {
    if (isStopwatchRunning) {
        clearInterval(stopwatchInterval);
        stopwatchStartBtn.textContent = 'Resume';
        isStopwatchRunning = false;
        stopwatchLapBtn.disabled = true;
    } else {
        lastStopwatchTime = performance.now();
        stopwatchStartBtn.textContent = 'Pause';
        isStopwatchRunning = true;
        stopwatchLapBtn.disabled = false;

        stopwatchInterval = setInterval(() => {
            const nowTime = performance.now();
            stopwatchElapsedTime += (nowTime - lastStopwatchTime);
            lastStopwatchTime = nowTime;
            updateStopwatchDisplay();
        }, 10);
    }
});

stopwatchLapBtn.addEventListener('click', () => {
    if (!isStopwatchRunning) return;

    const formatted = formatStopwatchTime(stopwatchElapsedTime);
    const li = document.createElement('li');
    li.className = 'lap-item';
    li.innerHTML = `<span class="lap-number">Lap ${lapCounter}</span> <span class="lap-time">${formatted.m}:${formatted.s}.${formatted.ms}</span>`;

    lapsList.prepend(li);
    lapCounter++;
});

stopwatchResetBtn.addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    isStopwatchRunning = false;
    stopwatchElapsedTime = 0;
    lapCounter = 1;
    updateStopwatchDisplay();
    stopwatchStartBtn.textContent = 'Start';
    lapsList.innerHTML = '';
});
