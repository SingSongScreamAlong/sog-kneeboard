// =====================================================================
// Watcher Agent Types
// Types for RNE Watcher Agent communication
// =====================================================================

/**
 * Authentication message from watcher agent
 */
export interface WatcherAuthMessage {
  agentType: 'watcher';
  apiKey: string;
  agentId?: string;
  version: string;
  capabilities?: WatcherCapabilities;
}

/**
 * Watcher agent capabilities
 */
export interface WatcherCapabilities {
  supportsDetection: boolean;
  supportsFrameCapture: boolean;
  maxConcurrentStreams: number;
}

/**
 * Successful authentication response
 */
export interface WatcherAuthSuccess {
  agentId: string;
  sessionToken: string;
  serverTime: string;
}

/**
 * Authentication error response
 */
export interface WatcherAuthError {
  error: string;
  code: 'INVALID_API_KEY' | 'VERSION_MISMATCH' | 'RATE_LIMITED' | 'UNKNOWN';
}

/**
 * Bounding box for detected objects
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Single detection in a frame
 */
export interface WatcherDetection {
  classId: number;
  className: string;
  confidence: number;
  bbox: BoundingBox;
  trackId?: number;
}

/**
 * Stream metadata
 */
export interface WatcherStreamInfo {
  streamId: string;
  videoId: string;
  videoTitle: string;
  channelName?: string;
  sourceType: 'video' | 'playlist' | 'channel';
  sourceUrl: string;
}

/**
 * Single observation from watcher agent
 */
export interface WatcherObservation {
  streamId: string;
  frameId: number;
  capturedAt: string;
  videoId: string;
  videoTitle: string;
  currentTime: number;
  duration: number;
  isKeyFrame?: boolean;
  frameData?: string; // Base64 JPEG (optional, only for key frames)
  thumbnailData?: string; // Base64 low-res thumbnail
  detections: WatcherDetection[];
  metadata?: Record<string, unknown>;
}

/**
 * Batch of observations
 */
export interface WatcherObservationBatch {
  agentId: string;
  batchId: string;
  observations: WatcherObservation[];
  streamInfo: WatcherStreamInfo;
}

/**
 * Watcher agent status report
 */
export interface WatcherStatusReport {
  agentId: string;
  state: 'idle' | 'starting' | 'running' | 'paused' | 'stopped' | 'error';
  activeStreams: number;
  totalFramesCaptured: number;
  totalObservationsSent: number;
  errorsCount: number;
  uptime: number;
}

/**
 * Command from server to watcher agent
 */
export interface WatcherCommand {
  commandId: string;
  type: 'start' | 'stop' | 'pause' | 'resume' | 'switch_source' | 'capture_now';
  payload?: Record<string, unknown>;
}

/**
 * AI insight generated from observations
 */
export interface AIInsight {
  id: string;
  observationId: string;
  insightType: 'strategy' | 'pit_timing' | 'incident' | 'driver_behavior' | 'track_condition';
  title: string;
  description: string;
  confidence: number;
  relevantTimestamp: number; // Video timestamp
  tags: string[];
  createdAt: string;
}
