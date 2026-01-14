# BroadcastBox Phase 2 TODO

## Integration Work

### Real Telemetry
- [ ] Connect to ControlBox relay agent
- [ ] Implement WebSocket client for live data
- [ ] Handle connection/reconnection logic
- [ ] Parse iRacing telemetry format

### Video Feeds
- [ ] OBS WebSocket integration
- [ ] NDI input support
- [ ] Camera switching via OBS scenes
- [ ] PiP (picture-in-picture) mode

### Output Streaming
- [ ] YouTube Live API integration
- [ ] Twitch API integration
- [ ] Local recording via FFmpeg
- [ ] Health monitoring (dropped frames, bitrate)

## AI Director Enhancements

### Battle Detection
- [ ] Gap threshold configuration
- [ ] Battle intensity scoring
- [ ] Position change prediction
- [ ] Historical battle tracking

### Incident Detection
- [ ] Spin detection from telemetry
- [ ] Contact detection
- [ ] Off-track/pit lane awareness
- [ ] Automatic highlight creation

### Smart Suggestions
- [ ] ML-based camera prediction
- [ ] Viewer engagement scoring
- [ ] Commentary sync points
- [ ] Story arc detection

## Ecosystem Integration

### BlackBox
- [ ] Driver intent data consumption
- [ ] Pit strategy predictions
- [ ] Tire wear forecasting

### ControlBox
- [ ] Race control flags sync
- [ ] Incident markers integration
- [ ] Official timing data

### SRBN Viewer
- [ ] Viewer count display
- [ ] Chat integration (optional)
- [ ] Interactive features coordination

## UI Polish

### Animations
- [ ] Smooth position changes
- [ ] Battle highlight transitions
- [ ] AI suggestion entrance/exit
- [ ] Leaderboard expand/collapse

### Accessibility
- [ ] Keyboard navigation audit
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Reduced motion support

### Customization
- [ ] User-defined keyboard shortcuts
- [ ] Layout presets
- [ ] Color theme options
- [ ] Overlay positioning
