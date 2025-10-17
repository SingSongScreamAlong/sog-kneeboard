/*
 * SOG Kneeboard - Marker Synchronization Loop
 * Reads markers from the inbox file and creates them in-game
 */

if (!hasInterface) exitWith {};

while {true} do {
    if (SOG_KB_enabled) then {
        [] call SOG_KB_fnc_readMarkers;
    };
    
    sleep SOG_KB_markerInterval;
};
