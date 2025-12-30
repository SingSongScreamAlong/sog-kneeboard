// =====================================================================
// RulebookEditor Page
// Create and manage league rules and penalty configurations
// =====================================================================

import { useState } from 'react';
import { useRulebookStore } from '../stores/rulebook.store';
import { formatPenaltyType } from '@controlbox/common';
import { DEFAULT_PENALTY_MATRIX, DEFAULT_SETTINGS } from '../stores/rulebook.store';
import type { Rulebook, Rule, PenaltyType } from '@controlbox/common';

export function RulebookEditor() {
    const {
        rulebooks,
        selectedRulebook,
        selectRulebook,
        addRulebook,
        deleteRulebook,
        addRule,
        deleteRule,
        toggleRule,
    } = useRulebookStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddRuleModal, setShowAddRuleModal] = useState(false);

    const handleCreateRulebook = (name: string, leagueName: string) => {
        const newRulebook: Rulebook = {
            id: `rb-${Date.now()}`,
            name,
            leagueName,
            version: '1.0',
            rules: [],
            penaltyMatrix: DEFAULT_PENALTY_MATRIX,
            settings: DEFAULT_SETTINGS,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        addRulebook(newRulebook);
        selectRulebook(newRulebook);
        setShowCreateModal(false);
    };

    const handleAddRule = (rule: Omit<Rule, 'id'>) => {
        if (!selectedRulebook) return;
        addRule(selectedRulebook.id, {
            ...rule,
            id: `rule-${Date.now()}`,
        });
        setShowAddRuleModal(false);
    };

    return (
        <div className="h-full flex">
            {/* Sidebar - Rulebook List */}
            <div className="w-80 border-r border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white mb-3">Rulebooks</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary w-full"
                    >
                        + Create Rulebook
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {rulebooks.map((rb) => (
                        <RulebookCard
                            key={rb.id}
                            rulebook={rb}
                            isSelected={selectedRulebook?.id === rb.id}
                            onClick={() => selectRulebook(rb)}
                            onDelete={() => deleteRulebook(rb.id)}
                        />
                    ))}
                    {rulebooks.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <p>No rulebooks yet</p>
                            <p className="text-sm mt-1">Create one to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedRulebook ? (
                    <>
                        {/* Rulebook Header */}
                        <div className="p-6 border-b border-slate-700 bg-slate-800/30">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {selectedRulebook.name}
                                    </h2>
                                    <p className="text-slate-400 mt-1">
                                        {selectedRulebook.leagueName} • v{selectedRulebook.version}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowAddRuleModal(true)}
                                        className="btn btn-primary"
                                    >
                                        + Add Rule
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6 mt-4">
                                <div>
                                    <span className="text-2xl font-bold text-white">
                                        {selectedRulebook.rules.length}
                                    </span>
                                    <span className="text-slate-400 ml-2">Rules</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-green-400">
                                        {selectedRulebook.rules.filter(r => r.isActive).length}
                                    </span>
                                    <span className="text-slate-400 ml-2">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Rules List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedRulebook.rules.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedRulebook.rules.map((rule) => (
                                        <RuleCard
                                            key={rule.id}
                                            rule={rule}
                                            onToggle={() => toggleRule(selectedRulebook.id, rule.id)}
                                            onDelete={() => deleteRule(selectedRulebook.id, rule.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="text-lg">No rules defined</p>
                                    <p className="text-sm mt-1">Add rules to automate penalty decisions</p>
                                    <button
                                        onClick={() => setShowAddRuleModal(true)}
                                        className="btn btn-secondary mt-4"
                                    >
                                        Add First Rule
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Penalty Matrix */}
                        <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                            <h3 className="font-semibold text-white mb-3">Penalty Matrix</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {(['light', 'medium', 'heavy'] as const).map((severity) => (
                                    <div key={severity} className="bg-slate-700/30 rounded-lg p-3">
                                        <div className="text-sm text-slate-400 capitalize">{severity}</div>
                                        <div className="text-white font-medium">
                                            {formatPenaltyType(selectedRulebook.penaltyMatrix.severity[severity].type)}
                                            {selectedRulebook.penaltyMatrix.severity[severity].value &&
                                                ` (${selectedRulebook.penaltyMatrix.severity[severity].value})`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📖</div>
                            <h3 className="text-xl font-semibold text-white">Select a Rulebook</h3>
                            <p className="mt-2">Choose a rulebook from the sidebar or create a new one</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Rulebook Modal */}
            {showCreateModal && (
                <CreateRulebookModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateRulebook}
                />
            )}

            {/* Add Rule Modal */}
            {showAddRuleModal && (
                <AddRuleModal
                    onClose={() => setShowAddRuleModal(false)}
                    onAdd={handleAddRule}
                />
            )}
        </div>
    );
}

// --- Sub-components ---

function RulebookCard({
    rulebook,
    isSelected,
    onClick,
    onDelete
}: {
    rulebook: Rulebook;
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                ? 'bg-primary-500/20 border border-primary-500/50'
                : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{rulebook.name}</h4>
                    <p className="text-sm text-slate-400 truncate">{rulebook.leagueName}</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Delete"
                >
                    ✕
                </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className="badge bg-slate-700 text-slate-300">
                    {rulebook.rules.length} rules
                </span>
                <span className="text-xs text-slate-500">v{rulebook.version}</span>
            </div>
        </div>
    );
}

function RuleCard({
    rule,
    onToggle,
    onDelete
}: {
    rule: Rule;
    onToggle: () => void;
    onDelete: () => void;
}) {
    const penaltyColors: Record<string, string> = {
        warning: 'bg-blue-500/20 text-blue-400',
        time_penalty: 'bg-amber-500/20 text-amber-400',
        position_penalty: 'bg-orange-500/20 text-orange-400',
        drive_through: 'bg-red-500/20 text-red-400',
        stop_go: 'bg-red-500/20 text-red-400',
        disqualification: 'bg-red-600/30 text-red-300',
    };

    return (
        <div className={`bg-slate-800/50 rounded-lg p-4 border ${rule.isActive ? 'border-slate-700' : 'border-slate-700/50 opacity-60'
            }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">{rule.reference}</span>
                        <h4 className="font-medium text-white">{rule.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{rule.description}</p>

                    {/* Conditions preview */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {rule.conditions.map((cond, i) => (
                            <span key={i} className="badge bg-slate-700/50 text-slate-300 text-xs">
                                {cond.field} {cond.operator} {JSON.stringify(cond.value)}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                    <span className={`badge ${penaltyColors[rule.penalty.type] || 'bg-slate-600'}`}>
                        {formatPenaltyType(rule.penalty.type)}
                        {rule.penalty.value && ` ${rule.penalty.value}`}
                    </span>

                    {/* Toggle */}
                    <button
                        onClick={onToggle}
                        className={`w-10 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-slate-600'
                            }`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                    </button>

                    <button
                        onClick={onDelete}
                        className="text-slate-500 hover:text-red-400"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreateRulebookModal({
    onClose,
    onCreate
}: {
    onClose: () => void;
    onCreate: (name: string, leagueName: string) => void
}) {
    const [name, setName] = useState('');
    const [leagueName, setLeagueName] = useState('');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Create Rulebook</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Rulebook Name</label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="e.g., Official Race Rules"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">League Name</label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="e.g., Sunday Night Racing"
                            value={leagueName}
                            onChange={(e) => setLeagueName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={() => onCreate(name, leagueName)}
                        disabled={!name.trim()}
                        className="btn btn-primary"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddRuleModal({
    onClose,
    onAdd
}: {
    onClose: () => void;
    onAdd: (rule: Omit<Rule, 'id'>) => void;
}) {
    const [reference, setReference] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [conditionField, setConditionField] = useState('incident.type');
    const [conditionOperator, setConditionOperator] = useState<'eq' | 'neq' | 'in'>('eq');
    const [conditionValue, setConditionValue] = useState('contact');
    const [penaltyType, setPenaltyType] = useState<PenaltyType>('warning');
    const [penaltyValue, setPenaltyValue] = useState('');

    const handleSubmit = () => {
        onAdd({
            reference: reference || '1.0.0',
            title,
            description,
            conditions: [{
                field: conditionField,
                operator: conditionOperator,
                value: conditionValue,
            }],
            penalty: {
                type: penaltyType,
                value: penaltyValue || undefined,
            },
            priority: 50,
            isActive: true,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl w-full max-w-lg p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">Add Rule</h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Reference</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="3.1.1"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>
                        <div className="col-span-3">
                            <label className="block text-sm text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Rule title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Description</label>
                        <textarea
                            className="input w-full"
                            rows={2}
                            placeholder="When does this rule apply?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                        <label className="block text-sm text-slate-400 mb-2">Condition</label>
                        <div className="grid grid-cols-3 gap-2">
                            <select
                                className="input"
                                value={conditionField}
                                onChange={(e) => setConditionField(e.target.value)}
                            >
                                <option value="incident.type">Incident Type</option>
                                <option value="incident.contactType">Contact Type</option>
                                <option value="incident.severity">Severity</option>
                                <option value="incident.severityScore">Severity Score</option>
                            </select>
                            <select
                                className="input"
                                value={conditionOperator}
                                onChange={(e) => setConditionOperator(e.target.value as 'eq' | 'neq' | 'in')}
                            >
                                <option value="eq">equals</option>
                                <option value="neq">not equals</option>
                                <option value="in">in list</option>
                            </select>
                            <input
                                type="text"
                                className="input"
                                placeholder="value"
                                value={conditionValue}
                                onChange={(e) => setConditionValue(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                        <label className="block text-sm text-slate-400 mb-2">Penalty</label>
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                className="input"
                                value={penaltyType}
                                onChange={(e) => setPenaltyType(e.target.value as PenaltyType)}
                            >
                                <option value="warning">Warning</option>
                                <option value="reprimand">Reprimand</option>
                                <option value="time_penalty">Time Penalty</option>
                                <option value="position_penalty">Position Penalty</option>
                                <option value="drive_through">Drive Through</option>
                                <option value="stop_go">Stop & Go</option>
                                <option value="disqualification">Disqualification</option>
                            </select>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., 5 seconds"
                                value={penaltyValue}
                                onChange={(e) => setPenaltyValue(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="btn btn-primary"
                    >
                        Add Rule
                    </button>
                </div>
            </div>
        </div>
    );
}
