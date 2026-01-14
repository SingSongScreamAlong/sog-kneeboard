// =====================================================================
// Scene Switcher Component
// Quick scene switching buttons
// =====================================================================

import { useSceneManager } from '../../engine/SceneManager';
import './SceneSwitcher.css';

export function SceneSwitcher() {
    const { scenes, activeSceneId, setActiveScene, quickSwitch, isTransitioning } = useSceneManager();

    const handleSceneClick = (sceneId: string, e: React.MouseEvent) => {
        if (e.shiftKey) {
            // Shift+click for instant cut
            quickSwitch(sceneId);
        } else {
            // Normal click uses scene's default transition
            setActiveScene(sceneId);
        }
    };

    return (
        <div className="scene-switcher">
            <div className="scene-switcher__header">
                <span className="scene-switcher__title">SCENES</span>
                <span className="scene-switcher__hint">Shift+Click = Cut</span>
            </div>

            <div className="scene-switcher__grid">
                {scenes.map(scene => (
                    <button
                        key={scene.id}
                        className={`scene-switcher__btn ${scene.id === activeSceneId ? 'scene-switcher__btn--active' : ''} ${isTransitioning ? 'scene-switcher__btn--transitioning' : ''}`}
                        onClick={(e) => handleSceneClick(scene.id, e)}
                        disabled={scene.id === activeSceneId}
                    >
                        <span className="scene-switcher__btn-icon">
                            {getSceneIcon(scene.type)}
                        </span>
                        <span className="scene-switcher__btn-name">{scene.name}</span>
                        <span className="scene-switcher__btn-transition">
                            {scene.transition.toUpperCase()}
                        </span>
                    </button>
                ))}
            </div>

            <div className="scene-switcher__quick-actions">
                <button
                    className="scene-switcher__quick-btn"
                    onClick={() => {
                        const currentIndex = scenes.findIndex(s => s.id === activeSceneId);
                        const nextIndex = (currentIndex + 1) % scenes.length;
                        setActiveScene(scenes[nextIndex].id);
                    }}
                    title="Next scene"
                >
                    ⏭ Next
                </button>
                <button
                    className="scene-switcher__quick-btn scene-switcher__quick-btn--cut"
                    onClick={() => {
                        const currentIndex = scenes.findIndex(s => s.id === activeSceneId);
                        const nextIndex = (currentIndex + 1) % scenes.length;
                        quickSwitch(scenes[nextIndex].id);
                    }}
                    title="Cut to next"
                >
                    ▶ Cut
                </button>
            </div>
        </div>
    );
}

function getSceneIcon(type: string): string {
    switch (type) {
        case 'world': return '🌍';
        case 'onboard': return '🎥';
        case 'split': return '◫';
        case 'replay': return '⏪';
        case 'standings': return '📊';
        default: return '📺';
    }
}
