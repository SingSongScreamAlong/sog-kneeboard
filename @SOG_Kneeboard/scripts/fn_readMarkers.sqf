/*
 * SOG Kneeboard - Read Markers from Inbox
 * Reads the inbox JSON file and creates markers in-game
 */

if (!hasInterface) exitWith {};

// Path to inbox file
private _inboxPath = format["%1\Documents\Arma 3\sog_ipad_inbox.json", getenv "USERPROFILE"];

// Check if file exists (would need extension for actual file reading)
// This is a placeholder implementation - actual implementation would use:
// - Custom extension for file I/O
// - Or preprocessFileLineNumbers with JSON parsing
// - Or external tool to convert JSON to SQF

// Simulated marker data structure
private _newMarkers = [];

// Example of how markers would be processed:
/*
_newMarkers = [
    [timestamp, [x, y], "grid", "text", "color", "type", "ownerUID", "scope"]
];
*/

// Process new markers
{
    _x params ["_timestamp", "_worldPos", "_grid", "_text", "_color", "_type", "_ownerUID", "_scope"];
    
    // Check if we've already processed this marker
    private _markerExists = false;
    {
        if ((_x select 0) == _timestamp) then {
            _markerExists = true;
        };
    } forEach SOG_KB_knownMarkers;
    
    if (!_markerExists) then {
        // Create unique marker name
        private _markerName = format["sog_kb_%1", _timestamp];
        
        // Create marker
        private _marker = createMarkerLocal [_markerName, _worldPos];
        _marker setMarkerTypeLocal _type;
        _marker setMarkerColorLocal _color;
        _marker setMarkerTextLocal _text;
        
        // Set marker visibility based on scope
        switch (_scope) do {
            case "self": {
                // Only visible to player
                _marker setMarkerAlphaLocal 1;
            };
            case "group": {
                // Visible to group (would need group check)
                _marker setMarkerAlphaLocal 1;
            };
            case "side": {
                // Visible to side (would need side check)
                _marker setMarkerAlphaLocal 1;
            };
            case "global": {
                // Visible to all
                _marker setMarkerAlphaLocal 1;
            };
        };
        
        // Add to known markers
        SOG_KB_knownMarkers pushBack [_timestamp, _markerName];
        
        // Notify player
        systemChat format["SOG Kneeboard: New marker added - %1", _text];
    };
} forEach _newMarkers;

// Clean up old markers (keep last 100)
if (count SOG_KB_knownMarkers > 100) then {
    private _toRemove = (count SOG_KB_knownMarkers) - 100;
    for "_i" from 0 to (_toRemove - 1) do {
        private _markerData = SOG_KB_knownMarkers select 0;
        deleteMarkerLocal (_markerData select 1);
        SOG_KB_knownMarkers deleteAt 0;
    };
};

true
