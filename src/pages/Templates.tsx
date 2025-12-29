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
    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
    const [newTemplate, setNewTemplate] = useState<Partial<Template>>({ category: 'casual', text: '', isDefault: false });

    // Reset form helper
    const resetForm = () => {
        setTemplateToEdit(null);
        setNewTemplate({ category: 'casual', text: '' });
        setIsCreating(false);
    };

    // Populate form in handleEditClick, not effect

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

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 pb-2">
                <div className="flex items-center justify-between px-6 pt-12 pb-2">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 -ml-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-xl font-bold leading-tight tracking-tight dark:text-white">Templates</h1>
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            sounds.play('click');
                        }}
                        className="flex items-center justify-center size-10 -mr-2 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>

                {/* Filter Chips */}
                <div className="px-6 pb-2 overflow-x-auto no-scrollbar flex gap-2">
                    {['All', 'Casual', 'Birthday', 'Formal', 'Religious'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setFilter(cat as any);
                                sounds.play('pop');
                            }}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
                                filter === cat
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-6 pt-4 space-y-4">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="group relative p-5 rounded-3xl bg-white dark:bg-[#1E2130] border border-transparent dark:border-white/5 shadow-sm dark:shadow-neo-dark hover:scale-[1.01] transition-all duration-300">
                        <p className="text-base font-medium leading-relaxed text-gray-800 dark:text-gray-200 pr-0 mb-3">
                            "{template.text}"
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md">
                                {template.category}
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
                    <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom-10 fade-in-20">
                        <h3 className="text-xl font-black dark:text-white mb-6">
                            {templateToEdit ? 'Edit Template' : 'New Template'}
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Category</label>
                                <select
                                    className="w-full h-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
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
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
                                <textarea
                                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 h-32 text-base leading-relaxed text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    placeholder="Hey {NAME}, ..."
                                    value={newTemplate.text}
                                    onChange={e => setNewTemplate({ ...newTemplate, text: e.target.value })}
                                />
                                <p className="text-xs text-gray-400 mt-2 font-medium">Use <code>{`{NAME}`}</code> as a placeholder.</p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={resetForm}
                                    className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-white/10 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
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

        </div>
    );
};
