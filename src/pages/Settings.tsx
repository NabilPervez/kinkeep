import React from 'react';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
    const navigate = useNavigate();

    const handleExport = async () => {
        const contacts = await db.contacts.toArray();
        const templates = await db.templates.toArray();
        const data = {
            version: 1,
            timestamp: new Date().toISOString(),
            contacts,
            templates
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kinkeep-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleNuke = async () => {
        if (confirm('⚠️ ARE YOU SURE? ⚠️\n\nThis will permanently delete ALL contacts and templates. This action cannot be undone.')) {
            if (confirm('Really really sure? Last chance.')) {
                await db.contacts.clear();
                await db.templates.clear();
                alert('All data has been deleted.');
                window.location.reload();
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 pb-2">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 -ml-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold leading-tight tracking-tight">Settings</h1>
                    <div className="size-10"></div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">

                {/* Data Management */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 pl-1">Data Management</h2>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
                        <button
                            onClick={handleExport}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left border-b border-gray-100 dark:border-white/5 last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Export Backup</h4>
                                    <p className="text-xs text-gray-500">Save your data as JSON</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <h2 className="text-xs font-bold text-red-500 uppercase tracking-wide mb-3 pl-1">Danger Zone</h2>
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-red-100 dark:border-red-900/30 overflow-hidden">
                        <button
                            onClick={handleNuke}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-red-600 dark:text-red-400">Delete All Data</h4>
                                    <p className="text-xs text-gray-500">Reset app to factory state</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* About */}
                <section className="pt-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-2xl">favorite</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">KinKeep</h3>
                    <p className="text-xs text-gray-500">Version 1.0.0</p>
                    <p className="text-xs text-gray-400 mt-4 max-w-xs mx-auto">
                        Designed to help you stay connected with the people who matter most.
                    </p>
                </section>

            </main>
        </div>
    );
};
