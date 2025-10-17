/*
 * SOG Kneeboard - Initialization Script
 * Starts the position tracking and marker synchronization loops
 */

if (!hasInterface) exitWith {}; // Only run on clients with interface

// Configuration
SOG_KB_serverUrl = "http://localhost:31337";
SOG_KB_token = "sog-kneeboard-secure-token-2024";
SOG_KB_updateInterval = 1; // Position update interval in seconds
SOG_KB_markerInterval = 5; // Marker sync interval in seconds
SOG_KB_enabled = true;

// Initialize variables
SOG_KB_lastMarkerCheck = 0;
SOG_KB_knownMarkers = [];

// Send initial world metadata
[] spawn SOG_KB_fnc_getWorldMeta;

// Start position tracking loop
[] spawn SOG_KB_fnc_positionLoop;

// Start marker synchronization loop
[] spawn SOG_KB_fnc_markerSync;

// Confirmation message
systemChat "SOG Kneeboard: Integration initialized";
systemChat format["SOG Kneeboard: Tracking %1 on %2", name player, worldName];

// Add action to toggle tracking
player addAction [
    "<t color='#00FF00'>SOG Kneeboard: Toggle Tracking</t>",
    {
        SOG_KB_enabled = !SOG_KB_enabled;
        if (SOG_KB_enabled) then {
            systemChat "SOG Kneeboard: Position tracking ACTIVE";
        } else {
            systemChat "SOG Kneeboard: Position tracking PAUSED";
        };
    },
    nil,
    1.5,
    false,
    true,
    "",
    "true",
    5
];

true
