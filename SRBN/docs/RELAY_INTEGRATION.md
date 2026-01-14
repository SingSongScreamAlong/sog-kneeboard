# BroadcastBox Relay Integration

## Architecture

```
┌──────────────────┐     WebSocket      ┌────────────────────┐
│   Relay Agent    │ ──────────────────▶│  BroadcastBox      │
│   (Windows PC)   │    /relay          │  Server (port 3002)│
│                  │                    │                    │
│  - iRacing SDK   │                    │  - Relay Handler   │
│  - Telemetry     │                    │  - Event Generator │
│  - Incidents     │                    │  - AI Suggestions  │
└──────────────────┘                    └─────────┬──────────┘
                                                  │ WebSocket
                                                  ▼
                                        ┌────────────────────┐
                                        │  BroadcastBox App  │
                                        │  (port 5173)       │
                                        │                    │
                                        │  - Director UI     │
                                        │  - Leaderboard     │
                                        │  - Track Map       │
                                        └────────────────────┘
```

## Server Modes

The BroadcastBox server operates in two modes:

| Mode | Description | Data Source |
|------|-------------|-------------|
| **Mock** | Simulated race data | Internal generator |
| **Live** | Real iRacing data | Relay Agent |

The server **automatically switches to LIVE mode** when a relay agent connects.

## Relay Connection

### Endpoint

```
ws://localhost:3002/relay
```

### Message Types (Relay → Server)

| Event | Description | Payload |
|-------|-------------|---------|
| `session_metadata` | Session start | Track, category, weather |
| `telemetry` | Car positions | Array of car telemetry |
| `race_event` | Flag/lap changes | Flag state, lap, phase |
| `incident` | Collision detected | Cars, severity, location |
| `driver_update` | Driver join/leave | Driver info |

### Example: Connecting from Relay

```python
import socketio

sio = socketio.Client()
sio.connect('http://localhost:3002/relay')

# Send telemetry
sio.emit('telemetry', {
    'sessionId': 'my-session',
    'timestamp': time.time() * 1000,
    'cars': [
        {
            'carId': 1,
            'driverId': 'driver-1',
            'driverName': 'Verstappen',
            'position': 1,
            'pos': {'s': 0.75},
            'speed': 80,
            ...
        }
    ]
})
```

## Testing

### Run Test Relay Script

```bash
cd packages/mock-server
npx tsx test-relay.ts
```

This simulates a relay agent sending:
- Session metadata
- 5 drivers
- Continuous telemetry updates
- An incident event

### Manual Testing

1. Start the server: `npm run dev:mock`
2. Start the app: `npm run dev`
3. Connect your relay agent to `ws://localhost:3002/relay`
4. Watch the UI update with live data!

## Modifying Existing Relay Agent

If you have an existing relay agent (e.g., ControlBox relay), modify its connection URL:

```python
# Before (ControlBox)
CLOUD_URL = 'wss://controlbox-server.example.com'

# After (BroadcastBox)
CLOUD_URL = 'ws://localhost:3002/relay'
```

The message format is compatible - no changes needed to the message structure.
