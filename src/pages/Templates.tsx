import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';
import type { Template } from '../types';
import { sounds } from '../utils/sounds';
import { useNavigate } from 'react-router-dom';
import { TEMPLATE_CATEGORIES } from '../constants';

export const Templates: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<string>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Simple state for creating new template (inline or modal? let's do inline for simplicity)
    // Standard Edit/Create State
    const [isCreating, setIsCreating] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
    const [newTemplate, setNewTemplate] = useState<Partial<Template>>({ category: 'friends', text: '', isDefault: false });

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardData, setWizardData] = useState<Record<string, string>>({});

    const createDefaultPrompt = (categoryId: string) => {
        switch (categoryId) {
            case 'islamic': return "Salaam {NAME}, hope you're doing well!";
            case 'friends': return "Hey {NAME}, what's up?";
            case 'colleagues': return "Hi {NAME}, hope work is going well.";
            case 'birthday': return "Happy Birthday {NAME}! Hope you have a great day.";
            default: return "Hi {NAME}, decided to reach out!";
        }
    };

    // Reset form helper
    const resetForm = () => {
        setTemplateToEdit(null);
        setNewTemplate({ category: 'friends', text: '' });
        setIsCreating(false);
    };

    const startWizard = () => {
        setWizardStep(0);
        setWizardData({});
        setIsWizardOpen(true);
        sounds.play('click');
    };

    const handleWizardNext = async () => {
        const currentCategory = TEMPLATE_CATEGORIES[wizardStep];
        const currentText = wizardData[currentCategory.id] || '';

        if (!currentText.trim()) {
            alert('Please enter a template message.');
            return;
        }

        if (wizardStep < TEMPLATE_CATEGORIES.length - 1) {
            setWizardStep(prev => prev + 1);
            sounds.play('click');
        } else {
            // Finish
            const newTemplates: Template[] = Object.entries(wizardData).map(([catId, text]) => ({
                id: uuidv4(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                category: catId as any,
                text: text,
                isDefault: false
            }));

            // Add the last one too since state update might be laggy if we didn't update wizardData yet? 
            // Actually better to just use the value from the input or ensure state is updated. 
            // React state updates are scheduled.
            // Let's rely on the fact that onChange updates `wizardData`.
            // Wait, the current text input needs to be saved to `wizardData` BEFORE moving next or finishing.
            // My onChange implementation will update `wizardData` directly.

            await db.templates.bulkAdd(newTemplates);
            sounds.play('success');
            setIsWizardOpen(false);
        }
    };


    const templates = useLiveQuery(() => db.templates.toArray()) || [];

    const filteredTemplates = templates.filter(t => {
        if (filter === 'all') return true;
        return t.category.toLowerCase() === filter.toLowerCase();
    });

    const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this template?')) {
            await db.templates.delete(id);
            sounds.play('delete');
        }
    };

    const handleEditClick = (t: Template, e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplateToEdit(t);
        setNewTemplate(t);
        setIsCreating(true);
        sounds.play('click');
    };

    const handleSave = async () => {
        if (!newTemplate.text) return;

        if (templateToEdit) {
            await db.templates.update(templateToEdit.id, {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                category: newTemplate.category as any,
                text: newTemplate.text,
            });
        } else {
            await db.templates.add({
                id: uuidv4(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                category: newTemplate.category as any,
                text: newTemplate.text,
                isDefault: false
            });
        }
        sounds.play('success');
        resetForm();
    };

    const handleExport = async () => {
        const allTemplates = await db.templates.toArray();
        const json = JSON.stringify(allTemplates, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kinkeep_templates.json';
        a.click();
        URL.revokeObjectURL(url);
        sounds.play('pop');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const content = ev.target?.result as string;
                const imported = JSON.parse(content);
                if (!Array.isArray(imported)) throw new Error('Invalid format');

                // Add with new IDs to avoid conflicts
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newTemplates = imported.map((t: any) => ({
                    ...t,
                    id: uuidv4() // Always new ID
                }));

                await db.templates.bulkAdd(newTemplates);
                sounds.play('success');
                // clear input
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
                alert('Failed to import templates. Invalid JSON.');
            }
        };
        reader.readAsText(file);
    };

    const filterOptions = [{ id: 'all', label: 'All' }, ...TEMPLATE_CATEGORIES];

    return (

        <div className="flex-1 flex flex-col h-screen bg-transparent">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
            />
            <header className="sticky top-0 z-50 glass-panel border-b-0 pb-2">
                <div className="flex items-center justify-between px-6 pt-12 pb-2">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 -ml-2 rounded-full text-gray-900 dark:text-white hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold leading-tight tracking-tight dark:text-white">Templates</h1>
                    <div className="flex gap-2 -mr-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center size-10 rounded-full glass-input hover:bg-white/20 text-gray-900 dark:text-gray-300 transition-all"
                            title="Export Templates"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                        </button>
                        <button
                            onClick={handleImportClick}
                            className="flex items-center justify-center size-10 rounded-full glass-input hover:bg-white/20 text-gray-900 dark:text-gray-300 transition-all"
                            title="Import Templates"
                        >
                            <span className="material-symbols-outlined text-[20px]">upload</span>
                        </button>
                        <button
                            onClick={startWizard}
                            className="flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95"
                            title="Personalize Templates Wizard"
                        >
                            <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
                            <span className="text-sm font-bold hidden sm:inline">Wizard</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsCreating(true);
                                sounds.play('click');
                            }}
                            className="flex items-center justify-center size-10 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="px-6 pb-2 overflow-x-auto no-scrollbar flex gap-2">
                    {filterOptions.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setFilter(cat.id);
                                sounds.play('pop');
                            }}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
                                filter === cat.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "glass-input text-gray-500 hover:bg-white/20 border-transparent dark:text-gray-300"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-6 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="group relative p-5 rounded-3xl glass-card hover:scale-[1.01] transition-all duration-300 break-inside-avoid">
                        <p className="text-base font-medium leading-relaxed text-gray-800 dark:text-gray-200 pr-0 mb-3">
                            "{template.text}"
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100/50 dark:bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                                {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label || template.category}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => handleEditClick(template, e)}
                                    className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                    onClick={(e) => handleDeleteTemplate(template.id, e)}
                                    className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* Create/Edit Modal - Lifted */}
            {isCreating && (
                <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center">
                    <div className="glass-panel w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom-10 fade-in-20 !bg-white/90 dark:!bg-[#1C1C1E]/90">
                        <h3 className="text-xl font-black dark:text-white mb-6">
                            {templateToEdit ? 'Edit Template' : 'New Template'}
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                                <select
                                    className="w-full h-12 rounded-xl border border-gray-200 dark:border-white/10 glass-input px-4 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newTemplate.category}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                                >
                                    {TEMPLATE_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id} className="text-black dark:text-white bg-white dark:bg-gray-800">{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
                                <textarea
                                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 glass-input p-4 h-32 text-base leading-relaxed text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    placeholder="Hey {NAME}, ..."
                                    value={newTemplate.text}
                                    onChange={e => setNewTemplate({ ...newTemplate, text: e.target.value })}
                                />
                                <p className="text-xs text-gray-400 mt-2 font-medium">Use <code>{`{NAME}`}</code> as a placeholder.</p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Wizard Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-[1001] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-300 !bg-white/95 dark:!bg-[#1C1C1E]/95 relative overflow-hidden">

                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-white/5">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${((wizardStep + 1) / TEMPLATE_CATEGORIES.length) * 100}%` }}
                            />
                        </div>

                        <div className="mb-8 mt-2">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                    Step {wizardStep + 1} of {TEMPLATE_CATEGORIES.length}
                                </span>
                                <button
                                    onClick={() => setIsWizardOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                                {TEMPLATE_CATEGORIES[wizardStep].label}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                How would you reach out to your {TEMPLATE_CATEGORIES[wizardStep].label.toLowerCase()} contacts?
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <textarea
                                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-white/5 p-6 h-48 text-xl leading-relaxed text-gray-900 dark:text-white outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 transition-all resize-none shadow-inner"
                                    placeholder={`e.g., Hey {NAME}, just thinking of you! How have you been?`}
                                    value={wizardData[TEMPLATE_CATEGORIES[wizardStep].id] || ''}
                                    onChange={e => setWizardData({ ...wizardData, [TEMPLATE_CATEGORIES[wizardStep].id]: e.target.value })}
                                    autoFocus
                                />
                                <div className="absolute bottom-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => setWizardData({ ...wizardData, [TEMPLATE_CATEGORIES[wizardStep].id]: createDefaultPrompt(TEMPLATE_CATEGORIES[wizardStep].id) })}
                                        className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        title="Use AI Suggestion (Simulation)"
                                    >
                                        Use Suggestion
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">info</span>
                                Pro tip: Use <code>{`{NAME}`}</code> to automatically insert the contact's name.
                            </p>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        if (wizardStep > 0) {
                                            setWizardStep(prev => prev - 1);
                                            sounds.play('click');
                                        }
                                    }}
                                    disabled={wizardStep === 0}
                                    className="px-8 h-14 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleWizardNext}
                                    className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {wizardStep === TEMPLATE_CATEGORIES.length - 1 ? 'Finish & Save' : 'Next Category'}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
