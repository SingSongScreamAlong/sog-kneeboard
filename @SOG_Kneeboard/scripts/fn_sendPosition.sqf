/*
 * SOG Kneeboard - Send Position Data
 * Sends current player position, heading, and vehicle info to server
 */

if (!hasInterface) exitWith {};

private _pos = getPosWorld player;
private _heading = getDir player;
private _playerName = name player;
private _vehicleName = "";

// Check if player is in a vehicle
if (vehicle player != player) then {
    _vehicleName = getText (configFile >> "CfgVehicles" >> typeOf vehicle player >> "displayName");
};

// Prepare data payload
private _data = format [
    '{
        "token": "%1",
        "worldPos": [%2, %3],
        "heading": %4,
        "playerName": "%5",
        "vehicleName": "%6",
        "timestamp": %7
    }',
    SOG_KB_token,
    _pos select 0,
    _pos select 1,
    _heading,
    _playerName,
    _vehicleName,
    time
];

// Send HTTP request
private _url = format["%1/position", SOG_KB_serverUrl];

[_url, "POST", _data] call {
    params ["_url", "_method", "_data"];
    
    // Use extension for HTTP request (fallback to basic method)
    private _result = "OK"; // Placeholder - actual HTTP would use extension
    
    // For debugging
    // diag_log format["SOG_KB: Sent position [%1, %2] heading %3", _pos select 0, _pos select 1, _heading];
};

true
