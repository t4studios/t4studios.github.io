// main.js

// 🔑 NEW CONSTANT: Define the application version here. 
// Change this variable instead of the HTML to update the version number globally.
const APP_VERSION = '1.0.1'; 

// Import functions and variables from clock.js
import { 
    TIMEZONE_OFFSETS, 
    is24HourFormat, 
    initializeClockElements,
    setClockFormat,
    updateClock, 
    updateTimezoneDisplay 
} from './clock.js';

// Assumes save.js and console.js functions are globally available or imported in a real module environment.
// For this example, we assume they are globally available since they are loaded via <script> tags.
// function loadSettings() { /* ... */ } 
// function saveSettings(is24HourFormat, colorEffectActive, isFullscreen) { /* ... */ }
// function initConsoleTimes() { /* ... */ }
// function logCustomDataTable() { /* ... */ }
// function logAndDisplaySyncInfo() { /* ... */ }

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selection ---
    const timeHmsElement = document.getElementById('time-hms');
    const timeAmPmElement = document.getElementById('time-ampm');
    const syncInfoElement = document.getElementById('sync-info'); 
    const dateDisplayElement = document.getElementById('date-display');
    const versionDisplayElement = document.getElementById('version-display'); // Version element

    const toggle24hr = document.getElementById('toggle-24hr');
    const toggleColorEffect = document.getElementById('toggle-color-effect'); 
    const sidebar = document.getElementById('sidebar');

    const featuresList = document.getElementById('features-list');
    const tzLocalLabel = document.getElementById('tz-local-label');
    
    // Timezone element map uses TIMEZONE_OFFSETS keys imported from clock.js
    const tzElements = {
        'local': document.getElementById('tz-local'),
        ...Object.keys(TIMEZONE_OFFSETS).reduce((acc, key) => {
            acc[key] = document.getElementById(`tz-${key}`);
            return acc;
        }, {})
    };
    
    // Taskbar and Modal Elements
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
    const arrow = toggleSidebarBtn.querySelector('.arrow');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const licenseLink = document.getElementById('open-license-link');
    const licenseModal = document.getElementById('license-modal');
    const closeLicenseModalBtn = document.getElementById('close-license-modal');
    const licenseContent = document.getElementById('license-content');

    // State variable for color effect
    let colorInterval = null;
    
    // 🔑 NEW LOGIC: Update the HTML element with the version from the JS variable
    if (versionDisplayElement) {
        versionDisplayElement.textContent = `Version ${APP_VERSION}`;
    }

    // --- Startup Console Warnings (Powered by T4Studio) ---
    console.warn(`ClockLive (v${APP_VERSION}) Initializing: Your settings (24hr mode, color effect, fullscreen state) are saved automatically. (Powered by T4Studio)`);
    console.warn("FEATURE NOTE: Automatic Fullscreen is blocked by modern browser security. Please use the [⛶] button for the best experience. (Powered by T4Studio)");


    // --- Clock Initialization Wiring ---
    // Pass elements and saveSettings reference to clock.js
    initializeClockElements({
        timeHmsElement,
        timeAmPmElement,
        dateDisplayElement, 
        tzElements,
        tzLocalLabel,
        toggle24hr,
        toggleColorEffect,
    }, typeof saveSettings === 'function' ? saveSettings : undefined); // Pass saveSettings if available

    // --- Utility Functions (Color Effect) ---
    function toggleFeatureColor(active) {
        const featureItems = featuresList.querySelectorAll('.feature-item');
        featureItems.forEach(item => {
            if (active) {
                item.classList.add('color-active');
            } else {
                item.classList.remove('color-active');
            }
        });
    }

    function getRandomColor() {
        const r = Math.floor(Math.random() * 150); 
        const g = Math.floor(Math.random() * 150);
        const b = Math.floor(Math.random() * 150);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function updateButtonStyles(bgColor) {
        const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return; 

        document.documentElement.style.setProperty('--accent-color-dynamic', bgColor); 
    }

    function changeAndApplyColor() {
        if (!toggleColorEffect.checked) return; 
        
        const newColor = getRandomColor();
        document.body.style.backgroundColor = newColor;
        updateButtonStyles(newColor); 
    }

    function startColorEffect() {
        if (colorInterval) clearInterval(colorInterval); 
        
        changeAndApplyColor();
        colorInterval = setInterval(changeAndApplyColor, 2000);
        
        toggleFeatureColor(true);
    }

    function stopColorEffect() {
        clearInterval(colorInterval);
        colorInterval = null; 
        document.body.style.backgroundColor = 'var(--bg-color)'; 
        document.documentElement.style.setProperty('--accent-color-dynamic', 'var(--accent-color)');
        
        toggleFeatureColor(false);
    }

    // --- Sidebar Logic ---
    function toggleSidebar(open) {
        const isOpen = (typeof open === 'boolean') ? open : !sidebar.classList.contains('open');
        
        if (isOpen) {
            sidebar.classList.add('open');
            arrow.style.transform = 'rotate(180deg)';
        } else {
            sidebar.classList.remove('open');
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    // --- License Modal Logic ---
    async function loadLicenseContent() {
        try {
            const response = await fetch('LICENSE'); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            licenseContent.textContent = text;
        } catch (error) {
            licenseContent.textContent = `Error loading license: ${error.message}\nCheck that the LICENSE file exists.`;
            console.error("Failed to load LICENSE:", error);
        }
    }

    function openLicenseModal(e) {
        e.preventDefault(); 
        loadLicenseContent(); 
        licenseModal.classList.add('open');
    }

    function closeLicenseModal() {
        licenseModal.classList.remove('open');
    }

    // --- Fullscreen Logic ---
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    function requestFullscreenIfAllowed() {
        document.documentElement.requestFullscreen().catch(err => {
             // Suppress the console error from the failed auto-initiation attempt
        });
    }

    // --- Event Listeners ---
    toggleSidebarBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        toggleSidebar();
    });
    
    closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
    
    licenseLink.addEventListener('click', openLicenseModal);
    closeLicenseModalBtn.addEventListener('click', closeLicenseModal);
    
    toggleFullscreenBtn.addEventListener('click', toggleFullScreen);
    
    document.addEventListener('click', (e) => {
        const clickedOutsideSidebar = !sidebar.contains(e.target) && e.target.id !== 'toggle-sidebar';

        if (sidebar.classList.contains('open') && clickedOutsideSidebar) {
            toggleSidebar(false);
        }
        
        if (document.fullscreenElement) {
            if (clickedOutsideSidebar) {
                 document.exitFullscreen();
            }
        }
    });

    toggle24hr.addEventListener('change', () => {
        setClockFormat(toggle24hr.checked);
        updateClock();
        updateTimezoneDisplay();
        if (typeof saveSettings === 'function') {
            saveSettings(is24HourFormat, toggleColorEffect.checked, document.fullscreenElement !== null); 
        }

        if (is24HourFormat) {
            console.warn(`
            ███ OPTION SWITCHED TO 24 HOUR FORMAT! (v${APP_VERSION}) ███
            
            This change ensures maximum compatibility with standard digital systems and military timekeeping. 
            The clock will now display hours from 00 (midnight) to 23 (11 PM). 
            This mode REMOVES the AM/PM designation from the display. 
            ENSURE YOU UNDERSTAND THIS FORMAT BEFORE DEPENDING ON IT IN A CRITICAL SCENARIO.
            `);
        } else {
            console.warn(`
            ███ OPTION SWITCHED TO 12 HOUR FORMAT! (v${APP_VERSION}) ███
            
            The time display has been reverted to the conventional 12-hour format, utilizing the AM (ante meridiem) and PM (post meridiem) suffixes. 
            This format is generally preferred for casual use and readability. 
            REMEMBER that 12 AM is midnight and 12 PM is noon. 
            THIS IS THE STANDARD MODE FOR NON-TECHNICAL CLOCK READINGS.
            `);
        }
    });

    toggleColorEffect.addEventListener('change', () => {
        if (toggleColorEffect.checked) {
            startColorEffect();
             console.error(`
            🔴 CRITICAL OPTION ACTIVATION: ANIMATE COLOR BACKGROUND OPTION HAS BEEN SWITCHED ON. (v${APP_VERSION}) 🔴
            
            ADVISORY: ACTIVATING THIS VISUAL EFFECT REQUIRES SUBSTANTIALLY MORE GPU AND CPU POWER. 
            THIS INCREASED RESOURCE USAGE MAY LEAD TO HIGHER BATTERY DRAIN ON MOBILE DEVICES 
            AND COULD POTENTIALLY INTERFERE WITH OTHER TIME-CRITICAL PROCESSES RUNNING CONCURRENTLY. 
            IF PERFORMANCE DEGRADATION OR INCREASED POWER CONSUMPTION IS OBSERVED, IT IS HIGHLY RECOMMENDED TO DISABLE THIS FEATURE.
            `);
        } else {
            stopColorEffect();
            console.log("Option Switched OFF: Animate Color Background feature deactivated. Performance usage is now optimized.");
        }
        if (typeof saveSettings === 'function') {
            saveSettings(is24HourFormat, toggleColorEffect.checked, document.fullscreenElement !== null);
        }
    });
    
    // --- Initialization ---
    function initialize() {
        if (typeof initConsoleTimes === 'function') {
            initConsoleTimes(); 
        }

        const settings = typeof loadSettings === 'function' ? loadSettings() : null;
        
        if (settings) {
            setClockFormat(settings.is24HourFormat);
            toggle24hr.checked = settings.is24HourFormat;
            
            toggleColorEffect.checked = settings.colorEffectActive;
            if (settings.colorEffectActive) {
                const currentBgColor = document.body.style.backgroundColor || 'var(--bg-color)';
                updateButtonStyles(currentBgColor); 
                startColorEffect(); 
                toggleFeatureColor(true); 
            } else {
                document.documentElement.style.setProperty('--accent-color-dynamic', 'var(--accent-color)');
                toggleFeatureColor(false); 
            }

            if (settings.isFullscreen) {
                requestFullscreenIfAllowed(); 
            }

        } else {
             document.documentElement.style.setProperty('--accent-color-dynamic', 'var(--accent-color)');
             toggleFeatureColor(false); 
        }
        
        if (typeof logCustomDataTable === 'function') {
            logCustomDataTable(is24HourFormat, toggleColorEffect.checked, document.fullscreenElement !== null, APP_VERSION); 
        }

        // Update the main clock (time AND date) every 50ms for high-precision synchronization
        setInterval(updateClock, 50); 
        
        // Timezone and Sync Info are less critical and should remain at 1 second for efficiency
        setInterval(updateTimezoneDisplay, 1000); 

        updateClock(); 
        updateTimezoneDisplay(); 

        if (typeof logAndDisplaySyncInfo === 'function') {
            setInterval(() => logAndDisplaySyncInfo(syncInfoElement), 1000); 
            logAndDisplaySyncInfo(syncInfoElement); 
        }
    }
    
    initialize();
});