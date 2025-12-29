import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import type { Template } from '../types';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export const Templates: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'All' | 'Casual' | 'Birthday' | 'Formal' | 'Religious'>('All');

    // Simple state for creating new template (inline or modal? let's do inline for simplicity)
    const [isCreating, setIsCreating] = useState(false);
    const [newTemplate, setNewTemplate] = useState<Partial<Template>>({ category: 'casual', text: '', isDefault: false });

    const templates = useLiveQuery(() => db.templates.toArray()) || [];

    const filteredTemplates = templates.filter(t => {
        if (filter === 'All') return true;
        return t.category.toLowerCase() === filter.toLowerCase();
    });

    const handleDelete = (id: string) => {
        if (confirm('Delete this template?')) {
            db.templates.delete(id);
        }
    };

    const handleCreate = async () => {
        if (!newTemplate.text) return;
        await db.templates.add({
            id: uuidv4(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            category: newTemplate.category as any, // Dexie will handle type check, or enforce stricter type in state
            text: newTemplate.text,
            isDefault: newTemplate.isDefault || false
        });
        setIsCreating(false);
        setNewTemplate({ category: 'casual', text: '' });
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 pb-2">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 -ml-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold leading-tight tracking-tight">Message Templates</h1>
                    <div className="size-10"></div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 pb-32 max-w-lg mx-auto w-full">
                <div className="w-full mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                        {['All', 'Casual', 'Birthday', 'Formal', 'Religious'].map(cat => (
                            <button
                                key={cat}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onClick={() => setFilter(cat as any)}
                                className={clsx(
                                    "px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors",
                                    filter === cat
                                        ? "bg-primary text-black font-semibold shadow-sm"
                                        : "bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredTemplates.map(template => (
                        <article key={template.id} className="p-4 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/5 shadow-sm transition-transform active:scale-[0.99]">
                            <div className="flex justify-between items-start mb-3">
                                <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                                    template.category === 'birthday' && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800/30",
                                    template.category === 'casual' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30",
                                    template.category === 'formal' && "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
                                    template.category === 'religious' && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/30"
                                )}>
                                    {template.category}
                                </span>
                                <div className="flex gap-1 -mr-2">
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                                {template.text}
                            </p>
                        </article>
                    ))}
                </div>
            </main>

            {/* Create Modal / Form Overlay - Keeping it simple for now, using a full overlay if creating */}
            {isCreating && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0">
                    <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in-20">
                        <h3 className="text-lg font-bold mb-4">New Template</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="w-full rounded-lg border-gray-200 dark:border-white/10 bg-background-light dark:bg-background-dark py-2 px-3"
                                    value={newTemplate.category}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                                >
                                    <option value="casual">Casual</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="formal">Formal</option>
                                    <option value="religious">Religious</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    className="w-full rounded-lg border-gray-200 dark:border-white/10 bg-background-light dark:bg-background-dark py-2 px-3 h-24"
                                    placeholder="Hey {NAME}, ..."
                                    value={newTemplate.text}
                                    onChange={e => setNewTemplate({ ...newTemplate, text: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Use <code>{`{NAME}`}</code> as a placeholder.</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-white/10 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 py-2 rounded-lg bg-primary text-black font-bold"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 w-full z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 p-4 pb-safe">
                <button
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-black text-base font-bold shadow-[0_0_20px_rgba(70,236,19,0.3)] transition-all transform active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined font-bold">add</span>
                    New Template
                </button>
            </div>
        </div>
    );
};
