# BroadcastBox Session State Machine

```
                    ┌──────────┐
                    │   IDLE   │ ← No active session
                    └────┬─────┘
                         │ session:start
                         ▼
              ┌──────────────────────┐
              │      PRACTICE        │
              └──────────┬───────────┘
                         │ session:qualify
                         ▼
              ┌──────────────────────┐
              │     QUALIFYING       │
              └──────────┬───────────┘
                         │ session:race
                         ▼
              ┌──────────────────────┐
         ┌───▶│     RACE_GREEN       │◀───┐
         │    └──────────┬───────────┘    │
         │               │ flag:yellow    │
         │               ▼                │
         │    ┌──────────────────────┐    │
         │    │       CAUTION        │    │
         │    └──────────┬───────────┘    │
         │               │ restart:ready  │
         │               ▼                │
         │    ┌──────────────────────┐    │
         │    │       RESTART        │────┘
         │    └──────────────────────┘  flag:green
         │
         │    ┌──────────────────────┐
         └───▶│     FINAL_LAPS       │ ← laps_remaining < 3
              └──────────┬───────────┘
                         │ leader:finish
                         ▼
              ┌──────────────────────┐
              │       FINISH         │
              └──────────────────────┘
```

## State Behavior Matrix

| State | Overlay | AI Freq | Leaderboard | Highlight |
|-------|---------|---------|-------------|-----------|
| IDLE | minimal | low | collapsed | off |
| PRACTICE | minimal | low | collapsed | off |
| QUALIFYING | standard | medium | expanded | on |
| RACE_GREEN | standard | high | collapsed | on |
| CAUTION | detailed | low | expanded | off |
| RESTART | detailed | high | expanded | on |
| FINAL_LAPS | detailed | high | collapsed | on |
| FINISH | detailed | low | expanded | off |
