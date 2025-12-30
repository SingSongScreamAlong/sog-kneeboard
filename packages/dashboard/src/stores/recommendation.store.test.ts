// =====================================================================
// Recommendation Store Tests
// Unit tests for recommendation engine core functionality
// =====================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { useRecommendationStore } from './recommendation.store';

describe('useRecommendationStore', () => {
    beforeEach(() => {
        // Reset to initial state
        const store = useRecommendationStore.getState();
        store.clearPending();
        store.setCurrentStatus('GREEN');
    });

    describe('setCurrentStatus', () => {
        it('should change the current status', () => {
            const store = useRecommendationStore.getState();

            store.setCurrentStatus('FULL_COURSE_YELLOW');

            expect(useRecommendationStore.getState().currentStatus).toBe('FULL_COURSE_YELLOW');
        });

        it('should accept all valid status values', () => {
            const statuses = ['GREEN', 'LOCAL_YELLOW', 'FULL_COURSE_YELLOW', 'REVIEW', 'POST_RACE_REVIEW', 'NO_ACTION'] as const;

            statuses.forEach(status => {
                useRecommendationStore.getState().setCurrentStatus(status);
                expect(useRecommendationStore.getState().currentStatus).toBe(status);
            });
        });
    });

    describe('setSteward', () => {
        it('should update steward information', () => {
            useRecommendationStore.getState().setSteward('steward-123', 'Head Steward');

            const state = useRecommendationStore.getState();
            expect(state.currentStewardId).toBe('steward-123');
            expect(state.currentStewardName).toBe('Head Steward');
        });
    });

    describe('toggleAutoAnalysis', () => {
        it('should toggle the auto analysis setting', () => {
            const initial = useRecommendationStore.getState().autoAnalysisEnabled;

            useRecommendationStore.getState().toggleAutoAnalysis();
            expect(useRecommendationStore.getState().autoAnalysisEnabled).toBe(!initial);

            useRecommendationStore.getState().toggleAutoAnalysis();
            expect(useRecommendationStore.getState().autoAnalysisEnabled).toBe(initial);
        });
    });

    describe('clearPending', () => {
        it('should clear pending recommendations', () => {
            // Ensure we start clean
            useRecommendationStore.getState().clearPending();

            expect(useRecommendationStore.getState().pendingRecommendations).toHaveLength(0);
        });
    });

    describe('initial state', () => {
        it('should have correct initial values', () => {
            const state = useRecommendationStore.getState();

            expect(state.currentStatus).toBeDefined();
            expect(state.pendingRecommendations).toBeDefined();
            expect(state.decidedRecommendations).toBeDefined();
            expect(typeof state.autoAnalysisEnabled).toBe('boolean');
        });
    });
});
