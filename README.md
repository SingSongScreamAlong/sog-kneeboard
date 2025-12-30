# ControlBox

**AI-Assisted Race Stewarding Platform for iRacing**

ControlBox is a modern race control and stewarding platform designed to assist race stewards in managing iRacing events. It provides real-time incident detection, AI-powered analysis, and comprehensive race management tools.

> ⚠️ **Important**: ControlBox provides **recommendations** to human stewards. It does not directly control iRacing flags or penalties.

## Features

### Core Functionality
- 🏁 **Race Control Panel** — Flag management, session controls, caution handling
- ⚠️ **Incident Detection** — AI-assisted incident analysis with severity scoring
- 🎯 **Recommendation Engine** — Status suggestions (GREEN, YELLOW, FCY) with confidence levels
- 🚩 **Penalty Management** — Driver warnings, time penalties, and disqualifications
- 📊 **Live Timing** — Real-time position tracking and lap times

### Advanced Features
- 📈 **Telemetry Timeline** — Scrub through incident data with speed/throttle/brake overlays
- 👥 **Multi-Steward Collaboration** — Real-time session sharing and decision voting
- 📅 **Season Management** — Championship tracking, standings, and historical data
- 📄 **Report Generation** — Post-race PDF exports and social media snippets
- 🔌 **Discord Integration** — Webhook notifications for incidents and penalties

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- (Optional) Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/controlbox.git
cd controlbox

# Install dependencies
npm install

# Build all packages
npm run build

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Project Structure

```
controlbox/
├── packages/
│   ├── common/          # Shared types and utilities
│   ├── dashboard/       # React frontend (Vite)
│   └── server/          # Express API server
├── docker-compose.yml   # Production stack
├── Dockerfile          # Multi-stage build
└── .github/workflows/  # CI/CD pipeline
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start all packages in dev mode
npm run build            # Build all packages
npm run lint             # Lint all packages

# Testing
npm test                 # Run unit tests
npm run test:e2e         # Run Playwright E2E tests

# Docker
docker-compose up -d     # Start production stack
docker-compose down      # Stop all services
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Zustand, TailwindCSS |
| Backend | Express, Socket.IO, Prisma |
| Database | PostgreSQL |
| Testing | Vitest, Playwright |
| Deployment | Docker, GitHub Actions |

## Configuration

### Environment Variables

```bash
# Server
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/controlbox
JWT_SECRET=your-secret-key

# Dashboard
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   iRacing   │────▶│  ControlBox  │────▶│  Database  │
│  Telemetry  │     │    Server    │     │ PostgreSQL │
└─────────────┘     └──────┬───────┘     └────────────┘
                          │
                    Socket.IO
                          │
                    ┌─────▼─────┐
                    │ Dashboard │
                    │  (React)  │
                    └───────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [iRacing](https://www.iracing.com/) for the simulation platform
- All the race stewards who provided feedback and testing

---

**ControlBox** — *Making race stewarding smarter, not replacing stewards.*
