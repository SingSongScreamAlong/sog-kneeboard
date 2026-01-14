// =====================================================================
// Compositor
// Real-time video compositing engine using Canvas 2D
// =====================================================================

import { useSceneManager } from './SceneManager';
import { useSourceManager } from './SourceManager';
import type { Scene, VideoSource, TransitionType } from './types';

export class Compositor {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private outputWidth: number;
    private outputHeight: number;
    private frameRate: number;
    private animationId: number | null = null;
    private lastFrameTime: number = 0;
    private frameInterval: number;

    // Transition state
    private transitionFrom: Scene | null = null;
    private transitionTo: Scene | null = null;
    private transitionProgress: number = 0;
    private transitionType: TransitionType = 'cut';

    constructor(
        canvas: HTMLCanvasElement,
        width: number = 1920,
        height: number = 1080,
        frameRate: number = 60
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.outputWidth = width;
        this.outputHeight = height;
        this.frameRate = frameRate;
        this.frameInterval = 1000 / frameRate;

        // Set canvas size
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * Start the render loop
     */
    start(): void {
        if (this.animationId !== null) return;
        this.lastFrameTime = performance.now();
        this.render();
    }

    /**
     * Stop the render loop
     */
    stop(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Set transition state
     */
    setTransition(from: Scene | null, to: Scene | null, type: TransitionType, progress: number): void {
        this.transitionFrom = from;
        this.transitionTo = to;
        this.transitionType = type;
        this.transitionProgress = progress;
    }

    /**
     * Main render loop
     */
    private render = (): void => {
        const now = performance.now();
        const delta = now - this.lastFrameTime;

        if (delta >= this.frameInterval) {
            this.lastFrameTime = now - (delta % this.frameInterval);
            this.renderFrame();
        }

        this.animationId = requestAnimationFrame(this.render);
    };

    /**
     * Render a single frame
     */
    private renderFrame(): void {
        const sceneManager = useSceneManager.getState();
        const sourceManager = useSourceManager.getState();

        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.outputWidth, this.outputHeight);

        const activeScene = sceneManager.scenes.find(s => s.id === sceneManager.activeSceneId);

        if (sceneManager.isTransitioning && this.transitionFrom && this.transitionTo) {
            // Render transition
            this.renderTransition(
                this.transitionFrom,
                this.transitionTo,
                this.transitionType,
                sceneManager.transitionProgress,
                sourceManager.sources
            );
        } else if (activeScene) {
            // Render active scene
            this.renderScene(activeScene, sourceManager.sources, 1);
        }

        // Render overlays (always on top)
        if (activeScene) {
            this.renderOverlays(activeScene);
        }
    }

    /**
     * Render a scene
     */
    private renderScene(scene: Scene, sources: VideoSource[], opacity: number): void {
        const { layout } = scene;

        // Render primary source
        if (scene.sources.length > 0) {
            const primarySourceRef = scene.sources.find(s => s.region === 'primary');
            if (primarySourceRef) {
                const source = sources.find(s => s.id === primarySourceRef.sourceId);
                if (source?.element) {
                    this.renderSource(
                        source.element,
                        layout.primary,
                        opacity * primarySourceRef.opacity
                    );
                }
            }
        } else {
            // No source assigned - render placeholder
            this.renderPlaceholder(layout.primary, scene.name);
        }

        // Render secondary source (for split/pip layouts)
        if (layout.secondary && scene.sources.length > 1) {
            const secondarySourceRef = scene.sources.find(s => s.region === 'secondary');
            if (secondarySourceRef) {
                const source = sources.find(s => s.id === secondarySourceRef.sourceId);
                if (source?.element) {
                    this.renderSource(
                        source.element,
                        layout.secondary,
                        opacity * secondarySourceRef.opacity
                    );
                }
            }
        }
    }

    /**
     * Render a video/canvas source to a region
     */
    private renderSource(
        element: HTMLVideoElement | HTMLCanvasElement,
        region: { x: number; y: number; width: number; height: number },
        opacity: number
    ): void {
        const x = region.x * this.outputWidth;
        const y = region.y * this.outputHeight;
        const w = region.width * this.outputWidth;
        const h = region.height * this.outputHeight;

        this.ctx.globalAlpha = opacity;
        this.ctx.drawImage(element, x, y, w, h);
        this.ctx.globalAlpha = 1;
    }

    /**
     * Render placeholder for empty source
     */
    private renderPlaceholder(
        region: { x: number; y: number; width: number; height: number },
        label: string
    ): void {
        const x = region.x * this.outputWidth;
        const y = region.y * this.outputHeight;
        const w = region.width * this.outputWidth;
        const h = region.height * this.outputHeight;

        // Dark background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x, y, w, h);

        // Grid pattern
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        const gridSize = 50;
        for (let gx = x; gx < x + w; gx += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(gx, y);
            this.ctx.lineTo(gx, y + h);
            this.ctx.stroke();
        }
        for (let gy = y; gy < y + h; gy += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, gy);
            this.ctx.lineTo(x + w, gy);
            this.ctx.stroke();
        }

        // Label
        this.ctx.fillStyle = '#666666';
        this.ctx.font = 'bold 24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label.toUpperCase(), x + w / 2, y + h / 2);
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText('No source assigned', x + w / 2, y + h / 2 + 30);
    }

    /**
     * Render transition between two scenes
     */
    private renderTransition(
        from: Scene,
        to: Scene,
        type: TransitionType,
        progress: number,
        sources: VideoSource[]
    ): void {
        switch (type) {
            case 'cut':
                this.renderScene(to, sources, 1);
                break;

            case 'fade':
            case 'dissolve':
                this.renderScene(from, sources, 1 - progress);
                this.renderScene(to, sources, progress);
                break;

            case 'wipe-left':
                // Save clip region
                this.ctx.save();

                // Render "from" scene
                this.renderScene(from, sources, 1);

                // Clip to wipe region and render "to" scene
                this.ctx.beginPath();
                this.ctx.rect(0, 0, this.outputWidth * progress, this.outputHeight);
                this.ctx.clip();
                this.renderScene(to, sources, 1);

                this.ctx.restore();
                break;

            case 'wipe-right':
                this.ctx.save();

                this.renderScene(from, sources, 1);

                this.ctx.beginPath();
                const startX = this.outputWidth * (1 - progress);
                this.ctx.rect(startX, 0, this.outputWidth * progress, this.outputHeight);
                this.ctx.clip();
                this.renderScene(to, sources, 1);

                this.ctx.restore();
                break;
        }
    }

    /**
     * Render overlays for a scene
     */
    private renderOverlays(scene: Scene): void {
        // For now, we'll use HTML overlays positioned over the canvas
        // This allows us to reuse existing React components
        // In the future, we could render them directly to canvas for recording

        // Overlays are handled by the OverlayRenderer component
    }

    /**
     * Get the canvas element
     */
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Get canvas as MediaStream for recording/streaming
     */
    getStream(frameRate: number = 60): MediaStream {
        return this.canvas.captureStream(frameRate);
    }

    /**
     * Resize output
     */
    resize(width: number, height: number): void {
        this.outputWidth = width;
        this.outputHeight = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

// Singleton instance factory
let compositorInstance: Compositor | null = null;

export function getCompositor(): Compositor | null {
    return compositorInstance;
}

export function createCompositor(canvas: HTMLCanvasElement, width?: number, height?: number): Compositor {
    compositorInstance = new Compositor(canvas, width, height);
    return compositorInstance;
}
