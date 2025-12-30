// =====================================================================
// Driver Comparison Panel
// Side-by-side telemetry comparison between two drivers
// =====================================================================

import { useState } from 'react';
import { useSessionStore } from '../../stores/session.store';

// Local type definitions
type TelemetryChannel = 'speed' | 'throttle' | 'brake' | 'steering' | 'lateralG' | 'longitudinalG';

export function DriverComparison() {
    const { timing } = useSessionStore();

    const [driver1Id, setDriver1Id] = useState<string | null>(null);
    const [driver2Id, setDriver2Id] = useState<string | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<TelemetryChannel>('speed');
    const [timeWindow, setTimeWindow] = useState(5); // seconds before/after

    const driver1 = timing.find(t => t.driverId === driver1Id);
    const driver2 = timing.find(t => t.driverId === driver2Id);

    const channels: { id: TelemetryChannel; label: string; unit: string; color1: string; color2: string }[] = [
        { id: 'speed', label: 'Speed', unit: 'km/h', color1: 'rgb(59, 130, 246)', color2: 'rgb(239, 68, 68)' },
        { id: 'throttle', label: 'Throttle', unit: '%', color1: 'rgb(34, 197, 94)', color2: 'rgb(251, 146, 60)' },
        { id: 'brake', label: 'Brake', unit: '%', color1: 'rgb(239, 68, 68)', color2: 'rgb(168, 85, 247)' },
        { id: 'steering', label: 'Steering', unit: '°', color1: 'rgb(168, 85, 247)', color2: 'rgb(20, 184, 166)' },
        { id: 'lateralG', label: 'Lateral G', unit: 'G', color1: 'rgb(251, 146, 60)', color2: 'rgb(34, 197, 94)' },
        { id: 'longitudinalG', label: 'Long. G', unit: 'G', color1: 'rgb(20, 184, 166)', color2: 'rgb(59, 130, 246)' },
    ];

    const currentChannel = channels.find(c => c.id === selectedChannel)!;

    // Generate sample telemetry data for visualization
    const generateSampleData = (isDriver1: boolean) => {
        const points = [];
        const baseSpeed = isDriver1 ? 280 : 275;
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            let value = baseSpeed;

            // Simulate braking zone
            if (t > 0.3 && t < 0.5) {
                value = baseSpeed - (t - 0.3) * 400;
            } else if (t >= 0.5 && t < 0.7) {
                value = baseSpeed - 80 + (t - 0.5) * 200;
            } else if (t >= 0.7) {
                value = baseSpeed - 40 + (t - 0.7) * 150;
            }

            // Add some variance
            value += (Math.random() - 0.5) * 5;
            if (!isDriver1) value -= Math.random() * 10;

            points.push({ x: i, y: Math.max(50, value) });
        }
        return points;
    };

    const driver1Data = generateSampleData(true);
    const driver2Data = generateSampleData(false);

    // Calculate deltas
    const avgDelta = driver1Data.reduce((acc, p, i) => acc + (p.y - driver2Data[i].y), 0) / driver1Data.length;

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Driver Comparison
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Window:</span>
                    <select
                        value={timeWindow}
                        onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    >
                        <option value={3}>±3s</option>
                        <option value={5}>±5s</option>
                        <option value={10}>±10s</option>
                        <option value={30}>±30s</option>
                    </select>
                </div>
            </div>

            {/* Driver Selection */}
            <div className="px-4 py-3 border-b border-slate-700 grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-slate-400 block mb-1">Driver 1 (Blue)</label>
                    <select
                        value={driver1Id || ''}
                        onChange={(e) => setDriver1Id(e.target.value || null)}
                        className="w-full px-3 py-2 bg-blue-900/30 border border-blue-500/30 rounded-lg text-white"
                    >
                        <option value="">Select driver...</option>
                        {timing.map(t => (
                            <option key={t.driverId} value={t.driverId} disabled={t.driverId === driver2Id}>
                                #{t.carNumber} {t.driverName}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm text-slate-400 block mb-1">Driver 2 (Red)</label>
                    <select
                        value={driver2Id || ''}
                        onChange={(e) => setDriver2Id(e.target.value || null)}
                        className="w-full px-3 py-2 bg-red-900/30 border border-red-500/30 rounded-lg text-white"
                    >
                        <option value="">Select driver...</option>
                        {timing.map(t => (
                            <option key={t.driverId} value={t.driverId} disabled={t.driverId === driver1Id}>
                                #{t.carNumber} {t.driverName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Channel Selection */}
            <div className="px-4 py-3 border-b border-slate-700">
                <div className="flex items-center gap-2 flex-wrap">
                    {channels.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel.id)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selectedChannel === channel.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {channel.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Graph Area */}
            <div className="p-4">
                {(!driver1Id || !driver2Id) ? (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <span className="text-4xl block mb-2">👆</span>
                            Select two drivers to compare telemetry
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Graph */}
                        <div className="relative h-64 bg-slate-900 rounded-lg p-4">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-4 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-500">
                                <span>300</span>
                                <span>200</span>
                                <span>100</span>
                                <span>0</span>
                            </div>

                            {/* Graph content */}
                            <div className="ml-12 h-full relative">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="border-t border-slate-700/50" />
                                    ))}
                                </div>

                                {/* SVG Graph */}
                                <svg className="w-full h-full" preserveAspectRatio="none">
                                    {/* Driver 1 line */}
                                    <polyline
                                        fill="none"
                                        stroke={currentChannel.color1}
                                        strokeWidth="2"
                                        points={driver1Data.map(p => `${p.x}%,${100 - (p.y / 300) * 100}%`).join(' ')}
                                    />
                                    {/* Driver 2 line */}
                                    <polyline
                                        fill="none"
                                        stroke={currentChannel.color2}
                                        strokeWidth="2"
                                        points={driver2Data.map(p => `${p.x}%,${100 - (p.y / 300) * 100}%`).join(' ')}
                                    />
                                </svg>

                                {/* X-axis labels */}
                                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500">
                                    <span>-{timeWindow}s</span>
                                    <span>0s</span>
                                    <span>+{timeWindow}s</span>
                                </div>
                            </div>
                        </div>

                        {/* Legend and Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentChannel.color1 }} />
                                    <span className="font-medium text-white">
                                        #{driver1?.carNumber} {driver1?.driverName.split(' ').pop()}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-blue-400">
                                    {Math.round(driver1Data[50].y)} {currentChannel.unit}
                                </div>
                                <div className="text-xs text-slate-400">at incident point</div>
                            </div>
                            <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentChannel.color2 }} />
                                    <span className="font-medium text-white">
                                        #{driver2?.carNumber} {driver2?.driverName.split(' ').pop()}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-red-400">
                                    {Math.round(driver2Data[50].y)} {currentChannel.unit}
                                </div>
                                <div className="text-xs text-slate-400">at incident point</div>
                            </div>
                        </div>

                        {/* Delta */}
                        <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                            <span className="text-sm text-slate-400">Average {currentChannel.label} Delta: </span>
                            <span className={`font-bold ${avgDelta > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(1)} {currentChannel.unit}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
