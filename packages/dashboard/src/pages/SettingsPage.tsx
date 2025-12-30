// =====================================================================
// Settings Page
// Consolidated settings for steward profile, recommendations, theme
// =====================================================================

import { useState } from 'react';
import { useRecommendationStore } from '../stores/recommendation.store';
import { useWorkspaceStore } from '../stores/workspace.store';

export function SettingsPage() {
    const {
        currentStewardId,
        currentStewardName,
        autoAnalysisEnabled,
        alertOnHighConfidence,
        setSteward,
        toggleAutoAnalysis,
    } = useRecommendationStore();

    const {
        theme,
        snapToGrid,
        gridSize,
        setTheme,
        toggleSnapToGrid,
        setGridSize,
    } = useWorkspaceStore();

    const [stewardName, setStewardName] = useState(currentStewardName);
    const [stewardId, setStewardId] = useState(currentStewardId);
    const [saved, setSaved] = useState(false);

    const handleSaveSteward = () => {
        setSteward(stewardId, stewardName);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleManageBilling = async () => {
        try {
            const res = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ returnUrl: window.location.href }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert('Failed to start portal session');
        } catch (err) {
            console.error(err);
            alert('Error connecting to billing service');
        }
    };

    const handleUpgrade = async (planId: string, interval: string) => {
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    interval,
                    successUrl: window.location.href + '?success=true',
                    cancelUrl: window.location.href + '?canceled=true',
                }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert('Failed to start checkout session');
        } catch (err) {
            console.error(err);
            alert('Error connecting to billing service');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">Configure your ControlBox preferences</p>
            </div>

            {/* Steward Profile */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>👤</span>
                        Steward Profile
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Steward Name</label>
                            <input
                                type="text"
                                value={stewardName}
                                onChange={(e) => setStewardName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                                placeholder="Your name"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-1">Steward ID</label>
                            <input
                                type="text"
                                value={stewardId}
                                onChange={(e) => setStewardId(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                                placeholder="Unique identifier"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSaveSteward}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium"
                    >
                        {saved ? '✓ Saved!' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Recommendation Engine */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🎯</span>
                        Recommendation Engine
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer">
                        <div>
                            <span className="text-white font-medium">Auto-Analysis</span>
                            <p className="text-sm text-slate-400">Automatically generate recommendations for new incidents</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={autoAnalysisEnabled}
                            onChange={toggleAutoAnalysis}
                            className="w-5 h-5 accent-primary-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer">
                        <div>
                            <span className="text-white font-medium">High Confidence Alerts</span>
                            <p className="text-sm text-slate-400">Visual pulse effect on high confidence recommendations</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={alertOnHighConfidence}
                            onChange={() => { }}
                            className="w-5 h-5 accent-primary-500"
                        />
                    </label>
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-300">
                            ⓘ Recommendations are internal suggestions only. They do not control iRacing flags.
                        </p>
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🖥️</span>
                        Workspace
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {/* Theme */}
                    <div>
                        <label className="text-sm text-slate-400 block mb-2">Theme</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium ${theme === 'dark'
                                    ? 'bg-slate-900 text-white border-2 border-primary-500'
                                    : 'bg-slate-700 text-slate-300 border-2 border-transparent'
                                    }`}
                            >
                                🌙 Dark
                            </button>
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium ${theme === 'light'
                                    ? 'bg-white text-slate-900 border-2 border-primary-500'
                                    : 'bg-slate-700 text-slate-300 border-2 border-transparent'
                                    }`}
                            >
                                ☀️ Light
                            </button>
                        </div>
                    </div>

                    {/* Snap to Grid */}
                    <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer">
                        <div>
                            <span className="text-white font-medium">Snap to Grid</span>
                            <p className="text-sm text-slate-400">Panels snap to grid when moving</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={snapToGrid}
                            onChange={toggleSnapToGrid}
                            className="w-5 h-5 accent-primary-500"
                        />
                    </label>

                    {/* Grid Size */}
                    {snapToGrid && (
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Grid Size: {gridSize}px</label>
                            <input
                                type="range"
                                min="25"
                                max="100"
                                step="25"
                                value={gridSize}
                                onChange={(e) => setGridSize(parseInt(e.target.value))}
                                className="w-full accent-primary-500"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Billing & Subscription */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>💳</span>
                        Billing & Subscription
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-slate-400">Manage your subscription and billing details.</p>

                    <div className="flex gap-4">
                        <button
                            onClick={handleManageBilling}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                        >
                            Manage Subscription
                        </button>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-md font-bold text-white mb-3">Available Plans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Team Plan */}
                            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                <h4 className="font-bold text-white">Team</h4>
                                <p className="text-slate-400 text-sm mb-4">$10/mo</p>
                                <button
                                    onClick={() => handleUpgrade('team', 'monthly')}
                                    className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm"
                                >
                                    Upgrade to Team
                                </button>
                            </div>
                            {/* League Plan */}
                            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                <h4 className="font-bold text-white">League</h4>
                                <p className="text-slate-400 text-sm mb-4">$50/mo</p>
                                <button
                                    onClick={() => handleUpgrade('league', 'monthly')}
                                    className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm"
                                >
                                    Upgrade to League
                                </button>
                            </div>
                            {/* Broadcast Plan */}
                            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                <h4 className="font-bold text-white">Broadcast</h4>
                                <p className="text-slate-400 text-sm mb-4">$100/mo</p>
                                <button
                                    onClick={() => handleUpgrade('broadcast', 'monthly')}
                                    className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm"
                                >
                                    Upgrade to Broadcast
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API & Integrations */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🔌</span>
                        API & Integrations
                    </h2>
                </div>
                <div className="p-6">
                    <div className="text-center py-8 text-slate-500">
                        <span className="text-4xl block mb-2">🔜</span>
                        <p>Coming Soon</p>
                        <p className="text-sm mt-2">Discord, webhooks, and overlay integrations</p>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>ℹ️</span>
                        About ControlBox
                    </h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl">
                            📦
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">ControlBox</div>
                            <div className="text-slate-400">v0.1.0-alpha</div>
                            <div className="text-sm text-slate-500 mt-1">
                                AI-Assisted Race Stewarding Platform
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
