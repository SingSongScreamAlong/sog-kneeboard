# SOG Kneeboard - HTTP Integration Guide

## Overview
The Arma 3 mod needs to communicate with the Node.js server via HTTP. This guide explains integration options.

## Challenge
Arma 3's SQF scripting language has limited HTTP capabilities. We need a bridge between the game and the server.

## Solution Options

### Option 1: File-Based Communication (RECOMMENDED)

The simplest and most reliable method uses file-based communication with an external bridge tool.

#### How It Works:
1. **Position Tracking**: Mod writes position to `sog_position.json`
2. **Bridge Tool**: Reads position file and POSTs to server
3. **Marker Sync**: Server writes to `sog_ipad_inbox.json`
4. **Mod Reads**: Mod reads inbox file and creates markers

#### Implementation:

**Create Bridge Tool** (`bridge.js`):
```javascript
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ARMA_PROFILE = path.join(process.env.USERPROFILE, 'Documents', 'Arma 3');
const POSITION_FILE = path.join(ARMA_PROFILE, 'sog_position.json');
const SERVER_URL = 'http://localhost:31337';
const TOKEN = 'sog-kneeboard-secure-token-2024';

// Watch position file
fs.watch(POSITION_FILE, async (eventType) => {
    if (eventType === 'change') {
        try {
            const data = JSON.parse(fs.readFileSync(POSITION_FILE, 'utf8'));
            await axios.post(`${SERVER_URL}/position`, {
                token: TOKEN,
                ...data
            });
        } catch (err) {
            console.error('Error syncing position:', err.message);
        }
    }
});
```

**Modify SQF Scripts**:
Replace HTTP calls with file writes:
```sqf
// In fn_sendPosition.sqf
private _json = format['{"worldPos":[%1,%2],"heading":%3}', _pos select 0, _pos select 1, _heading];
_json saveProfileNamespace "sog_position.json";
```

### Option 2: Arma 3 Extension (ADVANCED)

Use a compiled DLL extension for direct HTTP calls.

#### Required:
- **C++ knowledge** for extension development
- **Visual Studio** or similar compiler
- **Arma 3 Extension API** knowledge

#### Popular Extensions:
- **ArmaREST**: https://github.com/Dahlgren/ArmaREST
- **Intercept**: https://github.com/intercept/intercept

#### Usage Example:
```sqf
// Using ArmaREST extension
private _result = "ArmaREST" callExtension format[
    "POST|%1/position|%2",
    SOG_KB_serverUrl,
    _jsonData
];
```

### Option 3: Python Bridge Tool

A more robust bridge tool using Python.

**Create** `bridge.py`:
```python
import os
import json
import time
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

ARMA_PROFILE = os.path.join(os.environ['USERPROFILE'], 'Documents', 'Arma 3')
POSITION_FILE = os.path.join(ARMA_PROFILE, 'sog_position.json')
SERVER_URL = 'http://localhost:31337'
TOKEN = 'sog-kneeboard-secure-token-2024'

class PositionHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path == POSITION_FILE:
            try:
                with open(POSITION_FILE, 'r') as f:
                    data = json.load(f)
                requests.post(f'{SERVER_URL}/position', json={'token': TOKEN, **data})
            except Exception as e:
                print(f'Error: {e}')

observer = Observer()
observer.schedule(PositionHandler(), ARMA_PROFILE, recursive=False)
observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
```

### Option 4: WebSocket Extension (FUTURE)

For real-time bidirectional communication, a WebSocket extension would be ideal but requires significant development.

## Recommended Setup

**For Most Users**: Use Option 1 (File-Based + Bridge)

1. **Modify SQF scripts** to write/read JSON files
2. **Create simple bridge tool** (Node.js or Python)
3. **Run bridge alongside server**
4. **Test with file monitoring**

## File Locations

```
%USERPROFILE%\Documents\Arma 3\
├── sog_position.json      # Written by mod, read by bridge
├── sog_ipad_inbox.json    # Written by server, read by mod
└── sog_worldmeta.json     # Written by mod, read by bridge
```

## Testing Without Arma 3

You can test the server without Arma 3 by manually creating position files:

**Create test file** `test_position.json`:
```json
{
    "worldPos": [1024, 1024],
    "heading": 45,
    "playerName": "TEST_PILOT",
    "vehicleName": "UH-1H",
    "timestamp": 1234567890
}
```

**Send to server**:
```bash
curl -X POST http://localhost:31337/position \
  -H "Content-Type: application/json" \
  -d '{"token":"sog-kneeboard-secure-token-2024","worldPos":[1024,1024],"heading":45,"playerName":"TEST","vehicleName":"","timestamp":123}'
```

## Security Considerations

1. **Token Authentication**: Always use secure tokens
2. **Local Network Only**: Don't expose server to internet
3. **File Permissions**: Ensure proper file access controls
4. **Input Validation**: Server validates all incoming data

## Performance

- **Position Updates**: 1 per second (configurable)
- **Marker Sync**: Every 5 seconds (configurable)
- **File I/O**: Minimal overhead with proper buffering
- **Network**: Local HTTP is very fast (<1ms latency)

## Troubleshooting

### Position not updating
- Check if position file is being written
- Verify bridge tool is running
- Check server logs for incoming requests

### Markers not appearing
- Verify inbox file exists and is readable
- Check mod is reading file correctly
- Ensure marker data format is correct

### High CPU usage
- Increase update intervals
- Use file watching instead of polling
- Optimize JSON parsing

## Next Steps

1. Choose integration method
2. Implement file-based communication in SQF
3. Create bridge tool
4. Test end-to-end integration
5. Deploy and enjoy!

---
**Need help?** Open an issue on GitHub
