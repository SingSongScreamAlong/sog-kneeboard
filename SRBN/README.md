# BroadcastBox

> **Ok, Box Box Ecosystem** — Professional Broadcast Control Surface for Sim Racing

BroadcastBox is a director/producer control surface that provides AI-assisted race direction with human override priority.

## Quick Start

```bash
# Install dependencies
npm install

# Start development (app only)
npm run dev

# Start with mock telemetry server
npm run dev:all
```

## URLs

- **App**: http://localhost:5173
- **Mock Server**: http://localhost:3002

## Architecture

```
packages/
├── common/      # Shared types and constants
├── app/         # Main BroadcastBox application
└── mock-server/ # Mock telemetry generator
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-5` | Select driver 1-5 |
| `Space` | Lock/unlock camera |
| `Tab` | Cycle camera mode |
| `R` | Replay last event |
| `A` | Toggle advanced options |

## License

MIT © OKBoxBox
