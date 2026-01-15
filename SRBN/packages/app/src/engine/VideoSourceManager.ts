// =====================================================================
// VideoSourceManager
// Manages video sources from relay agent (cameras, onboards, world feed)
// =====================================================================

import { create } from 'zustand';

export type CameraType =
    | 'world'           // Main broadcast camera
    | 'onboard'         // Driver cockpit/helmet cam
    | 'chase'           // Chase camera behind car
    | 'trackside'       // Fixed track cameras
    | 'helicopter'      // Overhead view
    | 'pitlane';        // Pit lane camera

export interface VideoSource {
    id: string;
    name: string;
    type: CameraType;
    driverId?: string;      // For onboard cameras
    trackPosition?: string; // For trackside cameras (e.g., "Turn 1")
    isActive: boolean;
    isAvailable: boolean;
    quality: 'sd' | 'hd' | '4k';
}

export interface CameraCommand {
    type: 'switch_camera';
    targetCamera: CameraType;
    targetDriverId?: string;
    transition?: 'cut' | 'fade' | 'dissolve';
    duration?: number;
}

interface VideoSourceState {
    // Available sources
    sources: VideoSource[];
    activeSourceId: string | null;

    // Camera state from relay
    currentCamera: CameraType;
    currentDriverId: string | null;

    // Connection state
    isRelayConnected: boolean;
    relayError: string | null;

    // Actions
    setActiveSource: (sourceId: string) => void;
    setSources: (sources: VideoSource[]) => void;
    setCurrentCamera: (camera: CameraType, driverId?: string | null) => void;
    setRelayConnected: (connected: boolean) => void;
    setRelayError: (error: string | null) => void;

    // Camera commands
    requestCameraSwitch: (target: CameraType, driverId?: string) => void;
    requestDriverOnboard: (driverId: string) => void;
    requestWorldFeed: () => void;
}

export const useVideoSourceStore = create<VideoSourceState>((set, get) => ({
    sources: [],
    activeSourceId: null,
    currentCamera: 'world',
    currentDriverId: null,
    isRelayConnected: false,
    relayError: null,

    setActiveSource: (sourceId) => set({ activeSourceId: sourceId }),

    setSources: (sources) => set({ sources }),

    setCurrentCamera: (camera, driverId = null) => set({
        currentCamera: camera,
        currentDriverId: driverId
    }),

    setRelayConnected: (connected) => set({ isRelayConnected: connected }),

    setRelayError: (error) => set({ relayError: error }),

    // Send camera switch command to relay
    requestCameraSwitch: (target, driverId) => {
        const command: CameraCommand = {
            type: 'switch_camera',
            targetCamera: target,
            targetDriverId: driverId,
            transition: 'cut',
        };

        // Emit via videoSourceManager singleton
        videoSourceManager.sendCameraCommand(command);
    },

    requestDriverOnboard: (driverId) => {
        get().requestCameraSwitch('onboard', driverId);
    },

    requestWorldFeed: () => {
        get().requestCameraSwitch('world');
    },
}));

// =====================================================================
// VideoSourceManager Class
// Handles WebSocket communication for video sources
// =====================================================================

class VideoSourceManager {
    private socket: WebSocket | null = null;
    private serverUrl: string = 'ws://localhost:3002';
    private reconnectTimer: NodeJS.Timeout | null = null;

    connect(): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            console.log('📹 Video source already connected');
            return;
        }

        try {
            // Use the same server as telemetry but different namespace/path
            console.log('📹 Connecting to video source relay...');

            // For now, we'll use the existing telemetry connection
            // and add camera command support to it
            useVideoSourceStore.getState().setRelayConnected(true);

            // Initialize with default sources
            this.initializeDefaultSources();

        } catch (error) {
            console.error('📹 Video source connection error:', error);
            useVideoSourceStore.getState().setRelayError('Connection failed');
        }
    }

    private initializeDefaultSources(): void {
        const defaultSources: VideoSource[] = [
            { id: 'world-main', name: 'World Feed', type: 'world', isActive: true, isAvailable: true, quality: 'hd' },
            { id: 'helicopter', name: 'Helicopter', type: 'helicopter', isActive: false, isAvailable: true, quality: 'hd' },
            { id: 'pitlane', name: 'Pit Lane', type: 'pitlane', isActive: false, isAvailable: true, quality: 'hd' },
            { id: 'trackside-t1', name: 'Turn 1', type: 'trackside', trackPosition: 'Turn 1', isActive: false, isAvailable: true, quality: 'hd' },
            { id: 'trackside-t3', name: 'Turn 3', type: 'trackside', trackPosition: 'Turn 3', isActive: false, isAvailable: true, quality: 'hd' },
        ];

        useVideoSourceStore.getState().setSources(defaultSources);
    }

    sendCameraCommand(command: CameraCommand): void {
        console.log('📹 Camera command:', command);

        // Update local state immediately for responsiveness
        useVideoSourceStore.getState().setCurrentCamera(
            command.targetCamera,
            command.targetDriverId || null
        );

        // In a real implementation, this would send to the relay agent
        // socket.send(JSON.stringify({ type: 'camera:switch', payload: command }));
    }

    // Add driver onboard sources based on current driver list
    updateDriverOnboards(driverIds: string[], driverNames: Record<string, string>): void {
        const { sources } = useVideoSourceStore.getState();

        // Filter out old driver sources
        const nonDriverSources = sources.filter(s => s.type !== 'onboard');

        // Create new driver onboard sources
        const driverSources: VideoSource[] = driverIds.slice(0, 10).map(id => ({
            id: `onboard-${id}`,
            name: `${driverNames[id] || 'Driver'} Onboard`,
            type: 'onboard' as CameraType,
            driverId: id,
            isActive: false,
            isAvailable: true,
            quality: 'hd',
        }));

        useVideoSourceStore.getState().setSources([...nonDriverSources, ...driverSources]);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        useVideoSourceStore.getState().setRelayConnected(false);
    }
}

// Singleton export
export const videoSourceManager = new VideoSourceManager();
