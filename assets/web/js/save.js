// Data key for local storage
const STORAGE_KEY = 'liveClockSettings';

/**
 * Saves the current settings of the options to local storage.
 * @param {boolean} is24HourFormat - The state of the 24hr format toggle.
 * @param {boolean} colorEffectActive - The state of the color effect toggle.
 * @param {boolean} isFullscreen - The current fullscreen state. 
 */
function saveSettings(is24HourFormat, colorEffectActive, isFullscreen) {
    const settings = {
        is24HourFormat: is24HourFormat,
        colorEffectActive: colorEffectActive,
        isFullscreen: isFullscreen
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        // Console errors removed
    }
}

/**
 * Loads the settings from local storage.
 * @returns {object | null} The saved settings object, or null if none found.
 */
function loadSettings() {
    try {
        const storedSettings = localStorage.getItem(STORAGE_KEY);
        if (storedSettings) {
            return JSON.parse(storedSettings);
        }
    } catch (e) {
        // Console errors removed
    }
    return null;
}