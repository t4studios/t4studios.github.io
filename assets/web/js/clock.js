// clock.js

// Timezone offsets (in hours relative to UTC)
// NOTE: Using current DST offsets where applicable (EDT, CDT, BST/London, CET).
export const TIMEZONE_OFFSETS = {
    // North America Daylight Time
    'edt': -4, // Eastern Daylight Time (UTC - 4)
    'cdt': -5, // Central Daylight Time (UTC - 5)
    'mdt': -6, // Mountain Daylight Time (UTC - 6)
    'pdt': -7, // Pacific Daylight Time (UTC - 7)
    // Global
    'utc': 0,    // Coordinated Universal Time
    'europe-london': 1, // British Summer Time (UTC + 1)
    'cet': 2,    // Central European Summer Time (UTC + 2)
    'asia-kolkata': 5.5, // Indian Standard Time (UTC + 5.5)
    'asia-beijing': 8,   // China Standard Time (UTC + 8)
};

// Map element IDs to a user-friendly label for display
const TIMEZONE_LABELS = {
    'edt': 'EDT',
    'cdt': 'CDT',
    'mdt': 'MDT',
    'pdt': 'PDT',
    'utc': 'UTC / GMT',
    'europe-london': 'London (BST)',
    'cet': 'CET (Europe)',
    'asia-kolkata': 'India (IST)',
    'asia-beijing': 'Beijing',
};

// Global state variable for clock format, initialized to false (12hr)
export let is24HourFormat = false;

// References to the main clock and timezone display elements
let timeHmsElement;
let timeAmPmElement;
let dateDisplayElement;
let tzElements;
let tzLocalLabel;
let toggle24hr;
let toggleColorEffect;
let saveSettings;

/**
 * Sets the references to the DOM elements needed by the clock logic.
 * This must be called from main.js after DOMContentLoaded.
 * @param {object} elements - An object containing all required element references.
 * @param {function} saveSettingsFn - Reference to the saveSettings function from save.js/main.js.
 */
export function initializeClockElements(elements, saveSettingsFn) {
    timeHmsElement = elements.timeHmsElement;
    timeAmPmElement = elements.timeAmPmElement;
    dateDisplayElement = elements.dateDisplayElement;
    tzElements = elements.tzElements;
    tzLocalLabel = elements.tzLocalLabel;
    toggle24hr = elements.toggle24hr;
    toggleColorEffect = elements.toggleColorEffect;
    saveSettings = saveSettingsFn;

    // 🔑 INITIAL DATE UPDATE: Set the display to the initial date on initialization
    updateDateDisplay(new Date());
}

/**
 * Sets the initial clock format based on loaded settings.
 * @param {boolean} format - true for 24hr, false for 12hr.
 */
export function setClockFormat(format) {
    is24HourFormat = format;
}


/**
 * Helper function to format time for a given offset, ONLY showing hours and minutes.
 */
function formatTimeZoneTime(utcTime, offsetHours, use24Hour) {
    const totalMinutes = utcTime.getUTCHours() * 60 +
        utcTime.getUTCMinutes();

    let localMinutes = totalMinutes + (offsetHours * 60);

    const totalMinutesInDay = 24 * 60;
    localMinutes = (localMinutes % totalMinutesInDay + totalMinutesInDay) % totalMinutesInDay;

    let hours = Math.floor(localMinutes / 60);
    const minutes = localMinutes % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');

    if (use24Hour) {
        // 24hr format: 00:00
        return `${String(hours).padStart(2, '0')}:${paddedMinutes}`;
    } else {
        // 12hr format: 12:00am
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${String(hours).padStart(2, '0')}:${paddedMinutes}${ampm}`;
    }
}

/**
 * Helper function to format the UTC offset as a string (e.g., "+05:30" or "-04:00").
 * @param {number} offsetHours - The offset in hours.
 * @returns {string} The formatted offset string.
 */
function getOffsetString(offsetHours) {
    const sign = offsetHours >= 0 ? '+' : '-';
    const absoluteHours = Math.floor(Math.abs(offsetHours));
    const minutes = (Math.abs(offsetHours) - absoluteHours) * 60;

    const paddedHours = String(absoluteHours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');

    return `(${sign}${paddedHours}:${paddedMinutes})`;
}

/**
 * 🔑 NEW Function to update the date display.
 * @param {Date} now - The current Date object.
 */
function updateDateDisplay(now) {
    if (dateDisplayElement) {
        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        dateDisplayElement.textContent = now.toLocaleDateString(undefined, dateOptions);
    }
}

/**
 * Function to update the main clock display (hours:minutes:seconds).
 */
export function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    let ampm = '';
    let titleTime = '';

    if (!is24HourFormat) {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12;
        hours = hours ? hours : 12;

        const displayHours = hours.toString().padStart(2, '0');

        timeHmsElement.textContent = `${displayHours}:${minutes}:${seconds}`;
        timeAmPmElement.textContent = ampm;
        titleTime = `${displayHours}:${minutes}${ampm.toLowerCase().replace(' ', '')}`;

    } else {
        const displayHours = hours.toString().padStart(2, '0');

        timeHmsElement.textContent = `${displayHours}:${minutes}:${seconds}`;
        timeAmPmElement.textContent = '';
        titleTime = `${displayHours}:${minutes}`;
    }

    document.title = `ClockLive | ${titleTime}`;

    // 🔑 CALL NEW DATE UPDATE FUNCTION
    updateDateDisplay(now);

    // Note: saveSettings is checked for existence in main.js
    if (saveSettings) {
        saveSettings(is24HourFormat, toggleColorEffect.checked, document.fullscreenElement !== null);
    }
}

/**
 * Function to update all timezone displays.
 */
export function updateTimezoneDisplay() {
    const now = new Date();
    const use24Hour = toggle24hr.checked;

    // --- 1. Update Static Time Zones (EDT, UTC, etc.) ---
    for (const tz in TIMEZONE_OFFSETS) {
        const offset = TIMEZONE_OFFSETS[tz];
        const timeString = formatTimeZoneTime(now, offset, use24Hour);

        if (tzElements[tz]) {
            // Update the time display
            tzElements[tz].textContent = timeString;

            // Update the label with the offset string
            const featureItem = tzElements[tz].closest('.feature-item');
            if (featureItem) {
                const labelElement = featureItem.querySelector('.feature-label');
                const labelText = TIMEZONE_LABELS[tz];

                // UTC is a special case, show only the label
                if (tz === 'utc') {
                    labelElement.textContent = labelText;
                } else {
                    labelElement.textContent = `${labelText} ${getOffsetString(offset)}`;
                }
            }
        }
    }

    // --- 2. Update Local Time Zone ---
    if (tzElements.local) {
        const localTimeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: undefined,
            hour12: !use24Hour,
            timeZoneName: 'short'
        };

        const localTimeString = now.toLocaleTimeString(undefined, localTimeOptions);

        const parts = localTimeString.split(' ');
        let timePart = parts[0];
        let abbrPart = '';

        if (parts.length > 2) {
            // e.g., "09:39 PM EDT"
            timePart = `${parts[0]} ${parts[1]}`;
            abbrPart = parts[2];
        } else if (parts.length === 2 && isNaN(parts[1][0])) {
            // e.g., "21:39 EDT"
            timePart = parts[0];
            abbrPart = parts[1];
        }

        const formattedTime = timePart.toLowerCase().replace(/\s/g, '');

        tzElements.local.textContent = formattedTime;
        tzLocalLabel.textContent = `Current Time (${abbrPart.toUpperCase()})`;
    }
}