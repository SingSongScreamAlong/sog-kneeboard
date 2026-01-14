# BroadcastBox Component Tree

```
App
├── TopBar
│   ├── LogoStripes (black, blue, orange)
│   ├── SessionBanner (state indicator)
│   ├── SessionBadge (ID display)
│   └── AdvOptionsButton
│
├── DriverStack (Left Column)
│   └── DriverTile (×5)
│       ├── Thumbnail
│       ├── PositionBadge
│       ├── DriverName
│       ├── GapValue
│       ├── TireIcon
│       └── PitStatus
│
├── MainFeed (Center)
│   ├── VideoPlaceholder
│   ├── CameraLockBadge
│   ├── AISuggestionOverlay
│   └── BottomOverlay
│       ├── DriverCard
│       └── StatusBanner
│
├── ContextStack (Right Column)
│   ├── RaceContextPanel
│   │   ├── LapDisplay
│   │   ├── FlagBanner
│   │   ├── TrackInfo
│   │   └── LapProgress
│   │
│   ├── TrackMap
│   │   ├── TrackOutline (SVG)
│   │   ├── BattleZones
│   │   └── CarDots
│   │
│   └── EventQueue
│       ├── AIEvents
│       └── PendingEvents
│
├── Leaderboard (Bottom)
│   ├── Header
│   ├── TimingTable
│   │   └── LeaderboardRow (×N)
│   └── Footer
│
└── AdvancedOptions (Overlay)
    ├── AIDirectorSection
    ├── CameraSection
    ├── OverlaySection
    ├── DelaySection
    ├── ReplaySection
    └── OutputSection
```

## Store Architecture

```
Zustand Stores
├── sessionStore
│   ├── session: Session | null
│   ├── sessionState: SessionState (8 states)
│   └── stateConfig: SessionStateConfig
│
├── broadcastStore
│   ├── featuredDriverId
│   ├── featuredBattle
│   ├── cameraMode
│   ├── cameraLocked
│   ├── aiAggressiveness
│   ├── pendingSuggestions
│   └── replayBookmarks
│
└── driverStore
    ├── drivers: Driver[]
    ├── stackDriverIds: string[]
    └── battles: Battle[]
```
