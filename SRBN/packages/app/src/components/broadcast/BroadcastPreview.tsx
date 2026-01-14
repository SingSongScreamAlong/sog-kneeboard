// =====================================================================
// Broadcast Preview Component
// Renders the compositor output in the UI with optional YouTube source
// =====================================================================

import { useEffect, useRef, useState } from 'react';
import { createCompositor, getCompositor } from '../../engine/Compositor';
import { useSceneManager } from '../../engine/SceneManager';
import { useOutputManager } from '../../engine/OutputManager';
import { useBroadcastStore } from '../../stores/broadcast.store';
import { OverlayRenderer } from './OverlayRenderer';
import { YouTubeEmbed } from './YouTubeEmbed';
import './BroadcastPreview.css';

interface BroadcastPreviewProps {
    className?: string;
}

export function BroadcastPreview({ className }: BroadcastPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRunning, setIsRunning] = useState(false);

    const { activeSceneId, scenes, isTransitioning, transitionProgress } = useSceneManager();
    const { previewEnabled } = useOutputManager();
    const { youtubeUrl } = useBroadcastStore();

    // Initialize compositor
    useEffect(() => {
        if (!canvasRef.current) return;

        const compositor = createCompositor(canvasRef.current, 1920, 1080);
        compositor.start();
        setIsRunning(true);

        return () => {
            compositor.stop();
            setIsRunning(false);
        };
    }, []);

    // Update transition state
    useEffect(() => {
        const compositor = getCompositor();
        if (!compositor) return;

        if (isTransitioning) {
            const fromScene = scenes.find(s => s.id === activeSceneId);
            // We'd need the target scene here - for now just use active
            compositor.setTransition(fromScene || null, fromScene || null, 'fade', transitionProgress);
        }
    }, [isTransitioning, transitionProgress, activeSceneId, scenes]);

    const activeScene = scenes.find(s => s.id === activeSceneId);

    return (
        <div ref={containerRef} className={`broadcast-preview ${className || ''}`}>
            <div className="broadcast-preview__header">
                <span className="broadcast-preview__label">PROGRAM</span>
                <span className="broadcast-preview__scene">{activeScene?.name || 'No Scene'}</span>
                <span className={`broadcast-preview__status ${isRunning ? 'broadcast-preview__status--live' : ''}`}>
                    {isRunning ? '● LIVE' : '○ STOPPED'}
                </span>
            </div>

            <div className="broadcast-preview__canvas-container">
                {/* YouTube embed (when configured) */}
                {youtubeUrl && <YouTubeEmbed />}

                <canvas
                    ref={canvasRef}
                    className="broadcast-preview__canvas"
                    style={{ display: previewEnabled && !youtubeUrl ? 'block' : 'none' }}
                />
                {activeScene && (
                    <OverlayRenderer
                        overlays={activeScene.overlays}
                        width={1920} // Assuming fixed render resolution for now
                        height={1080}
                    />
                )}
                {!previewEnabled && !youtubeUrl && (
                    <div className="broadcast-preview__disabled">
                        Preview Disabled
                    </div>
                )}
            </div>

            <div className="broadcast-preview__controls">
                <div className="broadcast-preview__resolution">1920×1080</div>
                <div className="broadcast-preview__fps">60fps</div>
            </div>
        </div>
    );
}
