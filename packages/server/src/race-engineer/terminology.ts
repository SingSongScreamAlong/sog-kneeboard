// =====================================================================
// Terminology Realignment (Week 15)
// Strict rename table and positioning.
// =====================================================================

// =====================================================================
// Canonical Positioning
// =====================================================================

/**
 * THE positioning statement. Use everywhere.
 */
export const POSITIONING_STATEMENT =
    'Ok, Box Box delivers live race execution feedback and situational awareness — the pit wall, in your ear.';

// =====================================================================
// Rename Table
// =====================================================================

/**
 * Terms that must NEVER be used.
 */
export const BANNED_TERMS = [
    'AI coaching',
    'AI coach',
    'coaching engine',
    'coach hint',
    'coach tips',
    'driver improvement',
    'training mode',
    'lesson',
    'teaching',
    'tutor',
    'learn',
    'improve your',
    'get better at',
];

/**
 * Replacement terms.
 */
export const TERM_REPLACEMENTS: Record<string, string> = {
    // Core terminology
    'coaching': 'execution feedback',
    'coach': 'race engineer',
    'AI Coach': 'Race Engineer',
    'coaching engine': 'Race Intelligence Engine',
    'coach hint': 'race call',
    'driver improvement': 'execution quality',
    'training': 'practice session',

    // UI labels
    'Coaching Panel': 'Race Calls',
    'Coach Settings': 'Race Engineer Settings',
    'Enable Coaching': 'Enable Voice Calls',
    'Coaching Mode': 'Feedback Mode',
    'Coaching History': 'Call History',

    // Severity labels
    'Coaching Alert': 'Race Call',
    'Coach Warning': 'Caution',

    // Feature names
    'AI Coaching': 'Race Intelligence',
    'Real-time Coaching': 'Live Execution Feedback',
    'Post-race Coaching': 'Session Review',
};

// =====================================================================
// UI Category Names
// =====================================================================

export const UI_CATEGORIES = {
    // BlackBox (Driver)
    execution: {
        label: 'CAR — EXECUTION',
        description: 'Real-time feedback on car state and inputs',
        examples: ['Gear selection', 'Brake balance', 'Traction'],
    },
    context: {
        label: 'RACE — CONTEXT',
        description: 'Situational awareness of the field',
        examples: ['Gaps', 'Battles', 'Incidents', 'Strategy'],
    },
};

// =====================================================================
// Voice Tone Guidelines
// =====================================================================

export const VOICE_TONE_GUIDELINES = {
    required: [
        'Neutral professional tone',
        'Concise and direct',
        'Factual, not instructional',
        'Present tense for current state',
        'No emotional language',
    ],
    forbidden: [
        'Instructional phrasing ("you should...")',
        'Post-hoc advice ("you could have...")',
        'Encouraging language ("great job!")',
        'Negative judgments ("that was bad")',
        'Personal pronouns except "you" sparingly',
    ],
    examples: {
        bad: [
            'You should brake earlier into turn 3',
            'Try to carry more speed through the apex',
            'Great overtake! Keep it up!',
            'You lost time there, do better next lap',
        ],
        good: [
            'Battle forming ahead, two cars',
            'Gap ahead shrinking, under a second',
            'Yellow flag sector two',
            'Contact behind, hold position',
        ],
    },
};

// =====================================================================
// Call Kind Descriptions
// =====================================================================

export const CALL_KIND_DESCRIPTIONS = {
    execution: {
        name: 'Execution Feedback',
        definition: 'Descriptive, factual observations about car state and driver inputs',
        intent: 'Keep driver informed of car behavior without instruction',
        notIntent: 'Telling driver what to do or how to improve',
        examples: [
            'Traction limited, rear stepping out',
            'Brake balance forward',
            'Fuel load light',
        ],
    },
    context: {
        name: 'Race Context',
        definition: 'Situational awareness of field state, incidents, and strategy',
        intent: 'Keep driver aware of surroundings like a pit wall radio',
        notIntent: 'Coaching or advising on racing decisions',
        examples: [
            'Gap ahead three seconds, closing',
            'Incident ahead, stay left',
            'Leader pitting, you inherit track position',
        ],
    },
};

// =====================================================================
// Validation Helper
// =====================================================================

/**
 * Check text for banned terminology.
 */
export function containsBannedTerminology(text: string): {
    hasBanned: boolean;
    found: string[];
} {
    const lower = text.toLowerCase();
    const found = BANNED_TERMS.filter(term => lower.includes(term.toLowerCase()));
    return { hasBanned: found.length > 0, found };
}

/**
 * Apply terminology replacements to text.
 */
export function applyTermReplacements(text: string): string {
    let result = text;
    for (const [from, to] of Object.entries(TERM_REPLACEMENTS)) {
        const regex = new RegExp(from, 'gi');
        result = result.replace(regex, to);
    }
    return result;
}

// =====================================================================
// Module Index
// =====================================================================

export const terminology = {
    POSITIONING_STATEMENT,
    BANNED_TERMS,
    TERM_REPLACEMENTS,
    UI_CATEGORIES,
    VOICE_TONE_GUIDELINES,
    CALL_KIND_DESCRIPTIONS,
    containsBannedTerminology,
    applyTermReplacements,
};
