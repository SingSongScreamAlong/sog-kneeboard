// =====================================================================
// Stream Relay
// Server-side FFmpeg process for RTMP streaming to YouTube/Twitch
// =====================================================================

import { spawn, ChildProcess } from 'child_process';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

interface StreamConfig {
    rtmpUrl: string;
    streamKey: string;
    width: number;
    height: number;
    frameRate: number;
    bitrate: number; // kbps
}

export class StreamRelay {
    private wss: WebSocketServer | null = null;
    private ffmpeg: ChildProcess | null = null;
    private config: StreamConfig | null = null;
    private isStreaming: boolean = false;
    private clients: Set<WebSocket> = new Set();

    constructor(private server: Server) { }

    /**
     * Initialize WebSocket server for receiving video frames
     */
    initialize(): void {
        this.wss = new WebSocketServer({
            server: this.server,
            path: '/stream'
        });

        this.wss.on('connection', (ws) => {
            console.log('🎬 Stream client connected');
            this.clients.add(ws);

            ws.on('message', (data, isBinary) => {
                if (isBinary && this.ffmpeg && this.ffmpeg.stdin) {
                    // Forward video data to FFmpeg
                    this.ffmpeg.stdin.write(data);
                } else {
                    // Handle control messages
                    try {
                        const message = JSON.parse(data.toString());
                        this.handleControlMessage(ws, message);
                    } catch (e) {
                        console.error('Invalid message:', e);
                    }
                }
            });

            ws.on('close', () => {
                console.log('🎬 Stream client disconnected');
                this.clients.delete(ws);

                // Stop streaming if no clients
                if (this.clients.size === 0) {
                    this.stopStream();
                }
            });

            ws.on('error', (error) => {
                console.error('Stream client error:', error);
                this.clients.delete(ws);
            });
        });

        console.log('🎬 Stream relay initialized on /stream');
    }

    /**
     * Handle control messages from clients
     */
    private handleControlMessage(ws: WebSocket, message: any): void {
        switch (message.type) {
            case 'start':
                this.startStream(message.config);
                break;
            case 'stop':
                this.stopStream();
                break;
            case 'status':
                ws.send(JSON.stringify({
                    type: 'status',
                    isStreaming: this.isStreaming,
                    config: this.config,
                }));
                break;
        }
    }

    /**
     * Start RTMP stream with FFmpeg
     */
    startStream(config: StreamConfig): void {
        if (this.isStreaming) {
            console.log('⚠️ Stream already active');
            return;
        }

        this.config = config;
        const rtmpFullUrl = `${config.rtmpUrl}/${config.streamKey}`;

        // FFmpeg command for RTMP streaming
        // Input: Raw video from stdin
        // Output: RTMP stream
        const ffmpegArgs = [
            // Input options
            '-f', 'webm',           // Input format (WebM from browser MediaRecorder)
            '-i', 'pipe:0',         // Read from stdin

            // Video encoding
            '-c:v', 'libx264',      // H.264 codec
            '-preset', 'veryfast',  // Fast encoding for real-time
            '-tune', 'zerolatency', // Low latency
            '-b:v', `${config.bitrate}k`,
            '-maxrate', `${config.bitrate}k`,
            '-bufsize', `${config.bitrate * 2}k`,
            '-pix_fmt', 'yuv420p',
            '-g', String(config.frameRate * 2), // Keyframe every 2 seconds

            // Audio (if present)
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',

            // Output
            '-f', 'flv',
            rtmpFullUrl,
        ];

        console.log(`🚀 Starting stream to ${config.rtmpUrl}`);
        console.log(`   Resolution: ${config.width}x${config.height}`);
        console.log(`   Bitrate: ${config.bitrate} kbps`);

        this.ffmpeg = spawn('ffmpeg', ffmpegArgs);

        this.ffmpeg.stdout?.on('data', (data) => {
            console.log(`[FFmpeg] ${data}`);
        });

        this.ffmpeg.stderr?.on('data', (data) => {
            // FFmpeg outputs progress to stderr
            const line = data.toString();
            if (line.includes('frame=')) {
                // Progress update - don't spam the log
            } else {
                console.log(`[FFmpeg] ${line}`);
            }
        });

        this.ffmpeg.on('close', (code) => {
            console.log(`🛑 FFmpeg exited with code ${code}`);
            this.isStreaming = false;
            this.ffmpeg = null;
            this.broadcastStatus();
        });

        this.ffmpeg.on('error', (error) => {
            console.error('FFmpeg error:', error);
            this.isStreaming = false;
            this.ffmpeg = null;
            this.broadcastStatus();
        });

        this.isStreaming = true;
        this.broadcastStatus();
    }

    /**
     * Stop RTMP stream
     */
    stopStream(): void {
        if (!this.isStreaming || !this.ffmpeg) {
            return;
        }

        console.log('🛑 Stopping stream...');

        // Gracefully close FFmpeg
        this.ffmpeg.stdin?.end();

        // Force kill after 5 seconds if still running
        setTimeout(() => {
            if (this.ffmpeg) {
                this.ffmpeg.kill('SIGKILL');
            }
        }, 5000);

        this.isStreaming = false;
        this.config = null;
        this.broadcastStatus();
    }

    /**
     * Broadcast status to all connected clients
     */
    private broadcastStatus(): void {
        const status = JSON.stringify({
            type: 'status',
            isStreaming: this.isStreaming,
            config: this.config,
        });

        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(status);
            }
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isStreaming: this.isStreaming,
            config: this.config,
            clients: this.clients.size,
        };
    }
}
