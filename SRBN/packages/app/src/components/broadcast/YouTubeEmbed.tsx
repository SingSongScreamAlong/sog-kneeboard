// =====================================================================
// YouTubeEmbed Component
// Embed YouTube live streams with minimal controls
// =====================================================================

import { useMemo } from 'react';
import { useBroadcastStore } from '../../stores/broadcast.store';
import './YouTubeEmbed.css';

interface YouTubeEmbedProps {
    className?: string;
}

export function YouTubeEmbed({ className = '' }: YouTubeEmbedProps) {
    const { youtubeUrl } = useBroadcastStore();

    // Extract video ID from various YouTube URL formats
    const videoId = useMemo(() => {
        if (!youtubeUrl) return null;

        try {
            const url = new URL(youtubeUrl);

            // Handle youtube.com/watch?v=VIDEO_ID
            if (url.hostname.includes('youtube.com')) {
                return url.searchParams.get('v');
            }

            // Handle youtu.be/VIDEO_ID
            if (url.hostname === 'youtu.be') {
                return url.pathname.slice(1);
            }

            // Handle youtube.com/live/VIDEO_ID
            if (url.pathname.startsWith('/live/')) {
                return url.pathname.replace('/live/', '');
            }

            return null;
        } catch {
            return null;
        }
    }, [youtubeUrl]);

    if (!videoId) {
        return null;
    }

    // Embed URL with minimal controls for broadcast use
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;

    return (
        <div className={`youtube-embed ${className}`}>
            <iframe
                src={embedUrl}
                title="YouTube Live Stream"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
