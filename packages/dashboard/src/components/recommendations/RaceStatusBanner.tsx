// =====================================================================
// Race Status Banner
// Displays current internal race status
// Clear disclaimer: does NOT control iRacing flags
// =====================================================================

import { useRecommendationStore } from '../../stores/recommendation.store';

type RaceStatus = 'GREEN' | 'LOCAL_YELLOW' | 'FULL_COURSE_YELLOW' | 'REVIEW' | 'POST_RACE_REVIEW' | 'NO_ACTION';

const STATUS_CONFIG: Record<RaceStatus, {
    label: string;
    bgColor: string;
    textColor: string;
    icon: string;
    borderColor: string;
}> = {
    GREEN: {
        label: 'GREEN',
        bgColor: 'bg-green-600',
        textColor: 'text-white',
        icon: '🟢',
        borderColor: 'border-green-400',
    },
    LOCAL_YELLOW: {
        label: 'LOCAL YELLOW',
        bgColor: 'bg-yellow-500',
        textColor: 'text-black',
        icon: '🟡',
        borderColor: 'border-yellow-400',
    },
    FULL_COURSE_YELLOW: {
        label: 'FULL COURSE YELLOW',
        bgColor: 'bg-yellow-400',
        textColor: 'text-black',
        icon: '🟨',
        borderColor: 'border-yellow-300',
    },
    REVIEW: {
        label: 'UNDER REVIEW',
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
        icon: '🔍',
        borderColor: 'border-orange-400',
    },
    POST_RACE_REVIEW: {
        label: 'POST-RACE REVIEW',
        bgColor: 'bg-purple-600',
        textColor: 'text-white',
        icon: '⏳',
        borderColor: 'border-purple-400',
    },
    NO_ACTION: {
        label: 'NO ACTION',
        bgColor: 'bg-slate-600',
        textColor: 'text-white',
        icon: '✓',
        borderColor: 'border-slate-500',
    },
};

interface RaceStatusBannerProps {
    compact?: boolean;
}

export function RaceStatusBanner({ compact = false }: RaceStatusBannerProps) {
    const { currentStatus, pendingRecommendations } = useRecommendationStore();
    const config = STATUS_CONFIG[currentStatus];
    const hasPending = pendingRecommendations.length > 0;

    if (compact) {
        return (
            <div className={`px-3 py-1 rounded-lg ${config.bgColor} ${config.textColor} font-bold text-sm flex items-center gap-2`}>
                <span>{config.icon}</span>
                <span>{config.label}</span>
                {hasPending && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
            </div>
        );
    }

    return (
        <div className={`rounded-xl border-2 ${config.borderColor} overflow-hidden`}>
            {/* Status Display */}
            <div className={`${config.bgColor} ${config.textColor} px-6 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                        <div className="text-xs uppercase tracking-wider opacity-75">ControlBox Status</div>
                        <div className="text-2xl font-bold tracking-wide">{config.label}</div>
                    </div>
                </div>

                {hasPending && (
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium">
                            {pendingRecommendations.length} Pending
                        </span>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-900 px-4 py-2">
                <p className="text-xs text-slate-500 text-center">
                    ⓘ Internal status for stewarding. Does not affect iRacing simulation flags.
                </p>
            </div>
        </div>
    );
}
