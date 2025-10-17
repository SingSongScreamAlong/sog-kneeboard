/*
 * SOG Kneeboard - Get World Metadata
 * Detects current map and sends metadata to server
 */

if (!hasInterface) exitWith {};

private _worldName = worldName;
private _worldSize = worldSize;
private _terrainName = _worldName;

// Detect specific SOG maps
private _tileBaseUrl = "";

switch (_worldName) do {
    case "vn_khe_sanh": {
        _terrainName = "Khe Sanh";
        _worldSize = 2048;
    };
    case "vn_the_bra": {
        _terrainName = "The Bra";
        _worldSize = 1024;
    };
    case "cam_lao_nam": {
        _terrainName = "Cam Lao Nam";
        _worldSize = 5120;
    };
    default {
        _terrainName = _worldName;
    };
};

// Prepare metadata payload
private _data = format [
    '{
        "token": "%1",
        "worldSize": %2,
        "terrainName": "%3",
        "tileBaseUrl": "%4"
    }',
    SOG_KB_token,
    _worldSize,
    _terrainName,
    _tileBaseUrl
];

// Send HTTP request
private _url = format["%1/worldmeta", SOG_KB_serverUrl];

[_url, "POST", _data] call {
    params ["_url", "_method", "_data"];
    
    // Use extension for HTTP request (fallback to basic method)
    private _result = "OK"; // Placeholder
    
    systemChat format["SOG Kneeboard: Map detected - %1 (%2m)", _terrainName, _worldSize];
};

true
