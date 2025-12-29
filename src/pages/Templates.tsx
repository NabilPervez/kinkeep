import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';
import type { Template } from '../types';
import { sounds } from '../utils/sounds';
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

    const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this template?')) {
            await db.templates.delete(id);
            sounds.play('delete');
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
        sounds.play('success');
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
                    <h1 className="text-lg font-bold leading-tight tracking-tight">Templates</h1>
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            sounds.play('click');
                        }}
                        className="flex items-center justify-center size-10 -mr-2 rounded-full bg-primary text-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>

                {/* Filter Chips */}
                <div className="px-4 pb-2 overflow-x-auto no-scrollbar flex gap-2">
                    {['All', 'Casual', 'Birthday', 'Formal', 'Religious'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setFilter(cat as any);
                                sounds.play('pop');
                            }}
                            className={clsx(
                                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
                                filter === cat
                                    ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                                    : "bg-surface-light dark:bg-surface-dark text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-4 pt-4 space-y-3">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="group relative p-4 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-all">
                        <p className="text-sm font-medium leading-relaxed dark:text-gray-200 pr-8">"{template.text}"</p>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                {template.category}
                            </span>
                            <button
                                onClick={(e) => handleDeleteTemplate(template.id, e)}
                                className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </main>

            {/* Create Modal / Form Overlay */}
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
        </div>
    );
};
