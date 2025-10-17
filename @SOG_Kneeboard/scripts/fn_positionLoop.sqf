/*
 * SOG Kneeboard - Position Tracking Loop
 * Continuously sends player position and heading to the kneeboard server
 */

if (!hasInterface) exitWith {};

while {true} do {
    if (SOG_KB_enabled && alive player) then {
        [] spawn SOG_KB_fnc_sendPosition;
    };
    
    sleep SOG_KB_updateInterval;
};
