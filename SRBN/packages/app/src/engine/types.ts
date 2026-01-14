// =====================================================================
// Broadcast Engine Types
// Core type definitions for the broadcast system
// =====================================================================

/**
 * Scene types available in BroadcastBox
 */
export type SceneType =
    | 'world'      // World camera feed
    | 'onboard'    // Driver onboard camera
    | 'split'      // Split-screen (battle view)
    | 'replay'     // Replay footage
    | 'standings'  // Leaderboard fullscreen
    | 'custom';    // User-defined layout

/**
 * Scene configuration
 */
export interface Scene {
    id: string;
    name: string;
    type: SceneType;
    layout: SceneLayout;
    sources: SceneSource[];
    overlays: OverlayConfig[];
    transition: TransitionType;
}

/**
 * Scene layout definition
 */
export interface SceneLayout {
    /** Layout type */
    type: 'single' | 'pip' | 'split-h' | 'split-v' | 'quad';
    /** Primary source region (normalized 0-1) */
    primary: LayoutRegion;
    /** Secondary source region (for PiP/split) */
    secondary?: LayoutRegion;
}

export interface LayoutRegion {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Source reference within a scene
 */
export interface SceneSource {
    sourceId: string;
    region: 'primary' | 'secondary' | 'pip';
    opacity: number;
    zIndex: number;
}

/**
 * Overlay configuration
 */
export interface OverlayConfig {
    type: 'timing-tower' | 'lower-third' | 'battle-box' | 'incident-banner' | 'custom';
    enabled: boolean;
    position: { x: number; y: number };
    opacity: number;
    zIndex: number;
}

/**
 * Transition types
 */
export type TransitionType = 'cut' | 'fade' | 'wipe-left' | 'wipe-right' | 'dissolve';

/**
 * Video source types
 */
export type SourceType =
    | 'screen'       // Screen/window capture
    | 'ndi'          // NDI input
    | 'media'        // Video file
    | 'test-pattern' // Color bars
    | 'browser';     // Browser source (URL)

/**
 * Video source
 */
export interface VideoSource {
    id: string;
    name: string;
    type: SourceType;
    status: SourceStatus;
    width: number;
    height: number;
    frameRate: number;
    /** The actual video element or canvas */
    element?: HTMLVideoElement | HTMLCanvasElement;
}

export type SourceStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Output destination
 */
export interface OutputDestination {
    id: string;
    name: string;
    type: 'preview' | 'recording' | 'rtmp';
    status: OutputStatus;
    url?: string; // For RTMP
    filePath?: string; // For recording
}

export type OutputStatus = 'stopped' | 'starting' | 'active' | 'error';

/**
 * Encoder settings
 */
export interface EncoderSettings {
    codec: 'h264' | 'vp9' | 'av1';
    bitrate: number; // kbps
    width: number;
    height: number;
    frameRate: number;
    keyframeInterval: number; // seconds
}

/**
 * Broadcast engine state
 */
export interface BroadcastEngineState {
    isRunning: boolean;
    activeSceneId: string | null;
    previewSceneId: string | null;
    scenes: Scene[];
    sources: VideoSource[];
    outputs: OutputDestination[];
    encoder: EncoderSettings;
    transitionDuration: number; // ms
}
