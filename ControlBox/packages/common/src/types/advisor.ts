// =====================================================================
// Steward Advisor Types
// AI-assisted advisory guidance for incident review
// =====================================================================

/**
 * Types of advisory flags that indicate special conditions
 */
export type AdvisorFlagType =
    | 'CONFLICTING_RULE'   // Multiple rules apply with different outcomes
    | 'LOW_DATA'           // Insufficient data for confident decision
    | 'AMBIGUITY'          // Rule interpretation is ambiguous
    | 'SEVERITY_MISMATCH'; // Severity doesn't match rule expectations

/**
 * Confidence level for advisor recommendations
 */
export type AdvisorConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Advisory flag with contextual message
 */
export interface AdvisorFlag {
    type: AdvisorFlagType;
    message: string;
}

/**
 * Alternative outcome suggestion
 */
export interface AlternativeOutcome {
    label: string;
    description: string;
    consequence: string;
}

/**
 * Structured advice from steward advisor
 * Advisors NEVER apply penalties or control flags — they only advise
 */
export interface StewardAdvice {
    /** Unique advice identifier */
    id: string;
    /** Brief summary of the advice */
    summary: string;
    /** Distilled reasoning (no raw chain-of-thought) */
    reasoning: string;
    /** References to applicable RAID rulebook entries */
    applicableRules: string[];
    /** Confidence level of the advice */
    confidence: AdvisorConfidence;
    /** Alternative interpretations and outcomes */
    alternatives: AlternativeOutcome[];
    /** Flags indicating special conditions */
    flags: AdvisorFlag[];
    /** ISO timestamp when advice was generated */
    generatedAt: string;
}

/**
 * Request to generate steward advice
 */
export interface GenerateAdviceRequest {
    incidentId: string;
}

/**
 * Response containing steward advice
 */
export interface GenerateAdviceResponse {
    success: boolean;
    data?: StewardAdvice[];
    error?: string;
}

/**
 * Audit log entry for advisor generation
 */
export interface AdvisorAuditEntry {
    type: 'ADVISOR_GENERATED';
    incidentId: string;
    ruleIdsUsed: string[];
    confidenceLevels: AdvisorConfidence[];
    timestamp: Date;
    stewardUserId: string;
}
