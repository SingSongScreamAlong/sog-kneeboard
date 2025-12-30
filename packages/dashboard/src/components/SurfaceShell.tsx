// =====================================================================
// Surface Shell (Week 7)
// Container component that renders the correct nav and guards routes.
// =====================================================================

import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import type { Surface } from '../lib/claims';

// =====================================================================
// Props
// =====================================================================

interface SurfaceShellProps {
    surface: Surface;
    children: ReactNode;
}

// =====================================================================
// Component
// =====================================================================

export function SurfaceShell({ surface, children }: SurfaceShellProps) {
    const { claims, isLoading, canAccess, setCurrentSurface } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Set current surface on mount
    useEffect(() => {
        setCurrentSurface(surface);
    }, [surface, setCurrentSurface]);

    // Guard: redirect if not authorized
    useEffect(() => {
        if (!isLoading && claims && !canAccess(surface)) {
            console.warn(`🚫 Access denied to ${surface}`);
            // Redirect to first available surface or login
            const firstSurface = claims.surfaces[0];
            if (firstSurface) {
                navigate(`/${firstSurface}`);
            } else {
                navigate('/unauthorized');
            }
        }
    }, [isLoading, claims, surface, canAccess, navigate]);

    // Loading state
    if (isLoading) {
        return (
            <div className="surface-shell surface-shell--loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    // Unauthorized state (guard not yet triggered)
    if (!claims || !canAccess(surface)) {
        return (
            <div className="surface-shell surface-shell--unauthorized">
                <div className="unauthorized-message">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this surface.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`surface-shell surface-shell--${surface}`} data-surface={surface}>
            <SurfaceNav surface={surface} />
            <main className="surface-content">
                {children}
            </main>
        </div>
    );
}

// =====================================================================
// Surface Navigation
// =====================================================================

interface SurfaceNavProps {
    surface: Surface;
}

function SurfaceNav({ surface }: SurfaceNavProps) {
    const { claims, canAccess } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <nav className={`surface-nav surface-nav--${surface}`}>
            {/* Surface Switcher */}
            <div className="surface-nav__switcher">
                {claims?.surfaces.includes('blackbox') && (
                    <a
                        href="/blackbox"
                        className={`surface-tab ${surface === 'blackbox' ? 'active' : ''}`}
                    >
                        🏎️ BlackBox
                    </a>
                )}
                {claims?.surfaces.includes('controlbox') && (
                    <a
                        href="/controlbox"
                        className={`surface-tab ${surface === 'controlbox' ? 'active' : ''}`}
                    >
                        ⚙️ ControlBox
                    </a>
                )}
                {claims?.surfaces.includes('racebox') && (
                    <a
                        href="/racebox"
                        className={`surface-tab ${surface === 'racebox' ? 'active' : ''}`}
                    >
                        📺 RaceBox
                    </a>
                )}
            </div>

            {/* Surface-specific Nav */}
            <div className="surface-nav__links">
                {surface === 'blackbox' && <BlackBoxNav isActive={isActive} />}
                {surface === 'controlbox' && <ControlBoxNav isActive={isActive} />}
                {surface === 'racebox' && <RaceBoxNav isActive={isActive} />}
            </div>

            {/* User Info */}
            <div className="surface-nav__user">
                <span className="user-name">{claims?.displayName}</span>
                <span className="user-role">{claims?.role}</span>
            </div>
        </nav>
    );
}

// =====================================================================
// Surface-specific Navigation
// =====================================================================

function BlackBoxNav({ isActive }: { isActive: (path: string) => boolean }) {
    return (
        <>
            <a href="/blackbox/team" className={isActive('/blackbox/team') ? 'active' : ''}>
                Pit Wall
            </a>
            <a href="/blackbox/sessions" className={isActive('/blackbox/sessions') ? 'active' : ''}>
                Sessions
            </a>
            <a href="/blackbox/replay" className={isActive('/blackbox/replay') ? 'active' : ''}>
                Replay
            </a>
        </>
    );
}

function ControlBoxNav({ isActive }: { isActive: (path: string) => boolean }) {
    return (
        <>
            <a href="/controlbox" className={isActive('/controlbox') && !isActive('/controlbox/') ? 'active' : ''}>
                Dashboard
            </a>
            <a href="/controlbox/sessions" className={isActive('/controlbox/sessions') ? 'active' : ''}>
                Sessions
            </a>
            <a href="/controlbox/incidents" className={isActive('/controlbox/incidents') ? 'active' : ''}>
                Incidents
            </a>
            <a href="/controlbox/rulebooks" className={isActive('/controlbox/rulebooks') ? 'active' : ''}>
                Rulebooks
            </a>
            <a href="/controlbox/settings" className={isActive('/controlbox/settings') ? 'active' : ''}>
                Settings
            </a>
        </>
    );
}

function RaceBoxNav({ isActive }: { isActive: (path: string) => boolean }) {
    return (
        <>
            <a href="/racebox" className={isActive('/racebox') ? 'active' : ''}>
                Overlays
            </a>
        </>
    );
}

// =====================================================================
// Capability Guard Component
// =====================================================================

interface CapabilityGuardProps {
    capability: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export function CapabilityGuard({ capability, children, fallback }: CapabilityGuardProps) {
    const { hasCap } = useAuth();

    if (!hasCap(capability as any)) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
}
