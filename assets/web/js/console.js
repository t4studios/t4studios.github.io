/**
 * console.js
 * Handles all console logging, warnings, and the custom status data table.
 */

// Define the initial global times needed for drift calculation.
let initialRealTime = 0;
let initialPerformanceTime = 0;
let syncFetchCount = 0;

/**
 * Initializes the global time markers for drift calculation.
 * Must be called once at startup in main.js.
 */
function initConsoleTimes() {
    initialRealTime = Date.now();
    initialPerformanceTime = performance.now();
}

/**
 * Logs the custom data table to the console.
 * @param {boolean} is24HourFormat - The current state of the 24hr format toggle.
 * @param {boolean} colorEffectActive - The current state of the color effect toggle.
 * @param {boolean} isFullscreen - The current fullscreen state.
 */
function logCustomDataTable(is24HourFormat, colorEffectActive, isFullscreen) {
    const now = new Date();
    
    // Calculate current clock drift
    const driftMs = (Date.now() - initialRealTime) - (performance.now() - initialPerformanceTime);
    const absoluteDriftMs = Math.abs(driftMs);

    const data = [
        { 
            'Parameter': 'Timestamp', 
            'Value': now.toLocaleTimeString('en-US', { hour12: false }), 
            'Units': ''
        },
        { 
            'Parameter': 'Local Drift', 
            // 🔑 FIX: Using toFixed(2) for milliseconds drift in the table
            'Value': absoluteDriftMs.toFixed(2), 
            'Units': 'ms'
        },
        { 
            'Parameter': 'Drift Direction', 
            'Value': driftMs > 0 ? 'AHEAD' : 'BEHIND', 
            'Units': ''
        },
        { 
            'Parameter': '24hr Mode',
            'Value': is24HourFormat ? 'Active' : 'Inactive',
            'Units': ''
        },
        { 
            'Parameter': 'Color Effect', 
            'Value': colorEffectActive ? 'Active' : 'Inactive', 
            'Units': ''
        },
        { 
            'Parameter': 'Fullscreen State', 
            'Value': isFullscreen ? 'TRUE' : 'FALSE', 
            'Units': ''
        }
    ];

    console.log("--- T4Studio Live Clock Status Report ---");
    console.table(data);
}


/**
 * Performs synchronization check and logs warnings/errors.
 * This function also updates the sync text on the screen.
 * @param {HTMLElement} syncInfoElement - The element to update on the screen.
 */
function logAndDisplaySyncInfo(syncInfoElement) {
    const currentTime = Date.now();
    const currentPerformanceTime = performance.now();
    
    const elapsedRealTime = currentTime - initialRealTime;
    const elapsedPerformanceTime = currentPerformanceTime - initialPerformanceTime;
    
    const driftMs = elapsedRealTime - elapsedPerformanceTime;
    const driftSeconds = (driftMs / 1000); 
    
    const accuracySeconds = (0.005).toFixed(3); 
    
    // Use toFixed(1) for the requested format (e.g., 1.2, 0.5)
    const aheadText = driftSeconds.toFixed(1); 
    const aheadDirection = driftSeconds > 0 ? 'ahead' : 'behind';
    
    // Update the on-screen element
    syncInfoElement.innerHTML = `Your clock is ${Math.abs(aheadText)} seconds ${aheadDirection}.<br>Accuracy of synchronization was &plusmn;${accuracySeconds} seconds.`;

    syncFetchCount++;
    
    // Log detailed status to console every 60 sync checks (60 seconds)
    if (syncFetchCount % 60 === 0) {
        const absoluteDriftMs = Math.abs(driftMs);
        
        if (absoluteDriftMs > 500) { 
            console.error(`🔴 CRITICAL SYNC ERROR: Clock drift is ${absoluteDriftMs.toFixed(0)}ms. Sync required immediately.`);
        } else if (absoluteDriftMs > 100) { 
            console.warn(`⚠️ SYNC WARNING: Clock drift is ${absoluteDriftMs.toFixed(0)}ms. Slight synchronization needed.`);
        } else {
            console.log(`✅ SYNC OK: Drift is minimal (${absoluteDriftMs.toFixed(0)}ms).`);
        }
        
        // Log the full table every sync minute check
        logCustomDataTable(
            document.getElementById('toggle-24hr').checked,
            document.getElementById('toggle-color-effect').checked,
            document.fullscreenElement !== null
        );
    }
}