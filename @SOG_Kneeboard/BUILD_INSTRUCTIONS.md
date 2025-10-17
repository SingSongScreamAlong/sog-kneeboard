# SOG Kneeboard Mod - Build Instructions

## Overview
This mod requires building the addon files into PBO format for use in Arma 3.

## Prerequisites
- **Arma 3 Tools** (available on Steam)
- **Addon Builder** (part of Arma 3 Tools)

## Building the Mod

### Method 1: Using Addon Builder (GUI)

1. Open **Addon Builder** from Arma 3 Tools
2. Configure settings:
   - **Source Directory**: `@SOG_Kneeboard/addons`
   - **Destination Directory**: `@SOG_Kneeboard/addons`
   - **PBO Name Prefix**: `sog_kneeboard`
3. Click **Pack** to build the PBO file

### Method 2: Using Command Line

```bash
# Navigate to Arma 3 Tools directory
cd "C:\Program Files (x86)\Steam\steamapps\common\Arma 3 Tools\AddonBuilder"

# Build the addon
AddonBuilder.exe "@SOG_Kneeboard\addons" "@SOG_Kneeboard\addons" -prefix=sog_kneeboard
```

## Expected Output

After building, you should have:
```
@SOG_Kneeboard/
├── addons/
│   └── sog_kneeboard.pbo  (built addon)
├── scripts/                (source files)
├── mod.cpp
└── README.md
```

## Installation

1. Copy the entire `@SOG_Kneeboard` folder to your Arma 3 directory
2. Enable the mod in Arma 3 launcher
3. Launch Arma 3

## Development Mode (Without Building)

For development/testing, you can use the mod without building PBOs:

1. Create a symlink or copy the `@SOG_Kneeboard` folder to Arma 3 directory
2. Launch Arma 3 with `-filePatching` parameter
3. The game will load scripts directly from source files

**Launch parameter:**
```
-filePatching -mod=@SOG_Kneeboard
```

## HTTP Extension Requirement

**IMPORTANT**: The current implementation uses placeholder HTTP calls. For full functionality, you need:

### Option 1: Use Arma 3 Extension
Install a community HTTP extension like:
- **ArmaREST** - https://github.com/Dahlgren/ArmaREST
- **Intercept** - https://github.com/intercept/intercept

### Option 2: Use External Tool
Use a companion tool that:
1. Monitors Arma 3 profile directory for position files
2. Reads position data and sends HTTP requests
3. Reads marker inbox and writes to Arma 3 profile

### Option 3: Modify for File-Based Communication
The mod can be modified to use file-based communication instead of HTTP:
- Write position to `sog_position.json`
- Read markers from `sog_ipad_inbox.json`
- External tool bridges files to HTTP server

## Testing

1. Start the SOG Kneeboard server: `npm start`
2. Launch Arma 3 with the mod enabled
3. Join a server or start single-player
4. Check chat for initialization messages
5. Open kneeboard in browser: `http://localhost:31337`

## Troubleshooting

### Mod doesn't load
- Verify PBO file exists in `addons/` folder
- Check Arma 3 RPT log for errors
- Ensure mod is enabled in launcher

### No position updates
- Check if HTTP extension is installed
- Verify server is running on port 31337
- Check Windows Firewall settings

### Scripts not executing
- Ensure `-filePatching` is enabled for development
- Check RPT log for script errors
- Verify config.cpp syntax

## File Structure Reference

```
@SOG_Kneeboard/
├── mod.cpp                    # Mod metadata
├── README.md                  # User documentation
├── BUILD_INSTRUCTIONS.md      # This file
├── addons/
│   ├── config.cpp            # Addon configuration
│   └── sog_kneeboard.pbo     # Built addon (after building)
└── scripts/
    ├── fn_init.sqf           # Initialization
    ├── fn_positionLoop.sqf   # Position tracking loop
    ├── fn_sendPosition.sqf   # Send position to server
    ├── fn_markerSync.sqf     # Marker sync loop
    ├── fn_readMarkers.sqf    # Read markers from file
    └── fn_getWorldMeta.sqf   # Detect and send map info
```

## Next Steps

1. Build the PBO file using Addon Builder
2. Install HTTP extension or file-based bridge
3. Test integration with SOG Kneeboard server
4. Report issues on GitHub

---
**Version 1.0.0** - SOG Development Team
