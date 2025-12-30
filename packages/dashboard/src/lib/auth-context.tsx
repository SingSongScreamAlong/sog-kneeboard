// =====================================================================
// Auth Context (Week 7)
// React context for user claims and auth state.
// =====================================================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    type UserClaims,
    type Surface,
    type Capability,
    parseDevClaims,
    canAccessSurface,
    hasCapability,
    DEFAULT_ROLE_CLAIMS,
} from './claims';

// =====================================================================
// Context Types
// =====================================================================

interface AuthContextValue {
    claims: UserClaims | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    currentSurface: Surface | null;
    setCurrentSurface: (surface: Surface) => void;
    canAccess: (surface: Surface) => boolean;
    hasCap: (capability: Capability) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// =====================================================================
// Provider
// =====================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [claims, setClaims] = useState<UserClaims | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSurface, setCurrentSurface] = useState<Surface | null>(null);

    useEffect(() => {
        // Check for DEV mode claims first
        const searchParams = new URLSearchParams(window.location.search);
        const devClaims = parseDevClaims(searchParams);

        if (devClaims && import.meta.env.DEV) {
            console.log('🔧 DEV auth mode:', devClaims);
            setClaims(devClaims as UserClaims);
            setCurrentSurface(devClaims.surfaces?.[0] || null);
            setIsLoading(false);
            return;
        }

        // TODO: Real auth - fetch claims from API/JWT
        // For now, default to admin in dev mode
        if (import.meta.env.DEV) {
            const defaultClaims: UserClaims = {
                userId: 'dev-admin',
                orgId: 'dev-org',
                role: 'admin',
                surfaces: ['blackbox', 'controlbox', 'racebox'],
                capabilities: DEFAULT_ROLE_CLAIMS.admin.capabilities,
                displayName: 'Admin (Dev)',
            };
            setClaims(defaultClaims);
            setCurrentSurface('controlbox');
        }

        setIsLoading(false);
    }, []);

    // Detect surface from URL path
    useEffect(() => {
        const path = window.location.pathname;
        if (path.startsWith('/blackbox')) {
            setCurrentSurface('blackbox');
        } else if (path.startsWith('/controlbox')) {
            setCurrentSurface('controlbox');
        } else if (path.startsWith('/racebox')) {
            setCurrentSurface('racebox');
        }
    }, []);

    const canAccess = (surface: Surface) => {
        if (!claims) return false;
        return canAccessSurface(claims, surface);
    };

    const hasCap = (capability: Capability) => {
        if (!claims) return false;
        return hasCapability(claims, capability);
    };

    const logout = () => {
        setClaims(null);
        setCurrentSurface(null);
        // TODO: Real logout logic
    };

    return (
        <AuthContext.Provider
            value={{
                claims,
                isAuthenticated: !!claims,
                isLoading,
                currentSurface,
                setCurrentSurface,
                canAccess,
                hasCap,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// =====================================================================
// Hook
// =====================================================================

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook to require a specific surface access.
 * Returns null if not authorized.
 */
export function useRequireSurface(surface: Surface): boolean {
    const { canAccess, isLoading } = useAuth();
    if (isLoading) return true; // Don't block while loading
    return canAccess(surface);
}

/**
 * Hook to require a specific capability.
 */
export function useRequireCapability(capability: Capability): boolean {
    const { hasCap, isLoading } = useAuth();
    if (isLoading) return true;
    return hasCap(capability);
}
