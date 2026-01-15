// =====================================================================
// OBSConnector
// WebSocket connection to OBS using obs-websocket protocol
// =====================================================================

import { create } from 'zustand';

export interface OBSConnectionState {
    isConnected: boolean;
    isStreaming: boolean;
    isRecording: boolean;
    error: string | null;

    // Stats
    streamTimecode: string | null;
    recordTimecode: string | null;
    droppedFrames: number;
    totalFrames: number;
    fps: number;
    cpuUsage: number;
    memoryUsage: number;

    // Scene info
    currentScene: string | null;
    scenes: string[];

    // Actions
    setConnected: (connected: boolean) => void;
    setStreaming: (streaming: boolean) => void;
    setRecording: (recording: boolean) => void;
    setError: (error: string | null) => void;
    setCurrentScene: (scene: string) => void;
    setScenes: (scenes: string[]) => void;
    updateStats: (stats: Partial<OBSConnectionState>) => void;
}

export const useOBSStore = create<OBSConnectionState>((set) => ({
    isConnected: false,
    isStreaming: false,
    isRecording: false,
    error: null,
    streamTimecode: null,
    recordTimecode: null,
    droppedFrames: 0,
    totalFrames: 0,
    fps: 60,
    cpuUsage: 0,
    memoryUsage: 0,
    currentScene: null,
    scenes: [],

    setConnected: (connected) => set({ isConnected: connected }),
    setStreaming: (streaming) => set({ isStreaming: streaming }),
    setRecording: (recording) => set({ isRecording: recording }),
    setError: (error) => set({ error }),
    setCurrentScene: (scene) => set({ currentScene: scene }),
    setScenes: (scenes) => set({ scenes }),
    updateStats: (stats) => set(stats),
}));

// =====================================================================
// OBS WebSocket Connector
// =====================================================================

class OBSConnector {
    private ws: WebSocket | null = null;
    private serverUrl: string = 'ws://localhost:4455';
    private password: string = '';
    private reconnectTimer: NodeJS.Timeout | null = null;
    private messageId: number = 1;

    // Connect to OBS WebSocket server
    async connect(url?: string, password?: string): Promise<boolean> {
        if (url) this.serverUrl = url;
        if (password) this.password = password;

        return new Promise((resolve) => {
            try {
                console.log('🎬 Connecting to OBS:', this.serverUrl);
                this.ws = new WebSocket(this.serverUrl);

                this.ws.onopen = () => {
                    console.log('🎬 OBS WebSocket connected');
                    useOBSStore.getState().setConnected(true);
                    useOBSStore.getState().setError(null);
                    resolve(true);
                };

                this.ws.onclose = () => {
                    console.log('🎬 OBS WebSocket disconnected');
                    useOBSStore.getState().setConnected(false);
                    this.scheduleReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('🎬 OBS WebSocket error:', error);
                    useOBSStore.getState().setError('Connection failed');
                    resolve(false);
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };

            } catch (error) {
                console.error('🎬 OBS connection error:', error);
                useOBSStore.getState().setError('Connection failed');
                resolve(false);
            }
        });
    }

    private handleMessage(data: any): void {
        // Handle OBS WebSocket protocol messages
        switch (data.op) {
            case 0: // Hello
                this.authenticate();
                break;
            case 2: // Identified
                console.log('🎬 OBS authenticated');
                this.getSceneList();
                this.subscribeToEvents();
                break;
            case 5: // Event
                this.handleEvent(data.d);
                break;
            case 7: // RequestResponse
                this.handleResponse(data.d);
                break;
        }
    }

    private authenticate(): void {
        // For OBS WebSocket 5.x protocol
        this.send({
            op: 1, // Identify
            d: {
                rpcVersion: 1,
                authentication: this.password ? this.generateAuth() : undefined,
            }
        });
    }

    private generateAuth(): string {
        // Simplified - in production use proper auth challenge/response
        return btoa(this.password);
    }

    private handleEvent(event: any): void {
        switch (event.eventType) {
            case 'StreamStateChanged':
                useOBSStore.getState().setStreaming(event.eventData.outputActive);
                break;
            case 'RecordStateChanged':
                useOBSStore.getState().setRecording(event.eventData.outputActive);
                break;
            case 'CurrentProgramSceneChanged':
                useOBSStore.getState().setCurrentScene(event.eventData.sceneName);
                break;
        }
    }

    private handleResponse(response: any): void {
        if (response.requestType === 'GetSceneList') {
            const scenes = response.responseData.scenes.map((s: any) => s.sceneName);
            useOBSStore.getState().setScenes(scenes);
            if (response.responseData.currentProgramSceneName) {
                useOBSStore.getState().setCurrentScene(response.responseData.currentProgramSceneName);
            }
        }
    }

    private subscribeToEvents(): void {
        // Events are automatically received in OBS WebSocket 5.x
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, 5000);
    }

    private send(data: any): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    private request(requestType: string, requestData?: any): void {
        this.send({
            op: 6, // Request
            d: {
                requestType,
                requestId: `req-${this.messageId++}`,
                requestData,
            }
        });
    }

    // Public API
    getSceneList(): void {
        this.request('GetSceneList');
    }

    setCurrentScene(sceneName: string): void {
        this.request('SetCurrentProgramScene', { sceneName });
    }

    startStreaming(): void {
        this.request('StartStream');
    }

    stopStreaming(): void {
        this.request('StopStream');
    }

    startRecording(): void {
        this.request('StartRecord');
    }

    stopRecording(): void {
        this.request('StopRecord');
    }

    setSourceVisibility(sceneName: string, sourceName: string, visible: boolean): void {
        this.request('SetSceneItemEnabled', {
            sceneName,
            sceneItemId: sourceName, // Need to get item ID first in real implementation
            sceneItemEnabled: visible,
        });
    }

    disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        useOBSStore.getState().setConnected(false);
    }
}

// Singleton export
export const obsConnector = new OBSConnector();
