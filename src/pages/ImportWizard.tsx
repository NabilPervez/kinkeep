import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { parseCSV, parseVCF } from '../utils/fileParser'; // Implement this
import type { Contact } from '../types';
import clsx from 'clsx';

export const ImportWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    // const [file, setFile] = useState<File | null>(null); // Unused state removed
    const [parsedContacts, setParsedContacts] = useState<Contact[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isParsing, setIsParsing] = useState(false);
    const [bulkFrequency, setBulkFrequency] = useState(30);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            // setFile(f); 
            await processFile(f);
        }
    };

    const processFile = async (f: File) => {
        setIsParsing(true);
        try {
            let result;
            if (f.name.endsWith('.csv')) {
                result = await parseCSV(f);
            } else if (f.name.endsWith('.vcf') || f.name.endsWith('.vcard')) {
                result = await parseVCF(f); // To be improved
            } else {
                alert("Unsupported file type");
                setIsParsing(false);
                return;
            }

            if (result && result.contacts.length > 0) {
                setParsedContacts(result.contacts);
                // Auto-select all by default for now, or maybe only those with phone numbers?
                // Let's select all that have a valid looking name
                const validIds = result.contacts.map(c => c.id);
                setSelectedIds(new Set(validIds));
                setStep(2);
            } else {
                alert("No contacts found in file.");
            }
        } catch (err) {
            console.error(err);
            alert("Error parsing file");
        } finally {
            setIsParsing(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === parsedContacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(parsedContacts.map(c => c.id)));
        }
    };

    const handleImport = async () => {
        const toImport = parsedContacts
            .filter(c => selectedIds.has(c.id))
            .map(c => ({
                ...c,
                frequencyDays: bulkFrequency // Apply bulk frequency setting
            }));

        if (toImport.length === 0) return;

        await db.contacts.bulkAdd(toImport);
        navigate('/');
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between px-4 py-4">
                    <button onClick={() => {
                        if (step === 1) navigate(-1);
                        else setStep(prev => (prev - 1) as 1 | 2 | 3);
                    }} className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors -ml-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-base font-bold leading-tight tracking-tight">
                            {step === 1 ? 'Upload File' : 'Select Contacts'}
                        </h2>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className={clsx("h-1.5 w-1.5 rounded-full", step >= 1 ? "bg-primary" : "bg-gray-300 dark:bg-gray-600")}></span>
                            <span className={clsx("h-1.5 w-1.5 rounded-full", step >= 2 ? "bg-primary" : "bg-gray-300 dark:bg-gray-600")}></span>
                        </div>
                    </div>
                    <div className="w-10"></div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col p-4 overflow-hidden">
                {step === 1 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div
                            className="size-48 rounded-full bg-surface-light dark:bg-surface-dark border-4 border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 cursor-pointer hover:border-primary transition-colors hover:text-primary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <span className="material-symbols-outlined text-6xl mb-2">upload_file</span>
                            <span className="font-medium text-sm">Tap to Upload</span>
                            <span className="text-xs opacity-70 mt-1">.CSV or .VCF</span>
                        </div>
                        <input
                            type="file"
                            accept=".csv,.vcf,.vcard"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        {isParsing && <p className="text-primary font-bold animate-pulse">Parsing file...</p>}

                        <div className="max-w-xs text-center text-sm text-gray-500">
                            <p>Export your contacts from Google, iCloud, or Outlook as a CSV or vCard file, then upload it here.</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Search or Info (Optional) */}
                        <div className="flex justify-between items-center mb-2 px-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Found {parsedContacts.length} Contacts</p>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-32">
                            {parsedContacts.map(contact => (
                                <label key={contact.id} className={clsx(
                                    "group flex items-center gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-xl border shadow-sm transition-all cursor-pointer",
                                    selectedIds.has(contact.id) ? "border-primary/50" : "border-gray-100 dark:border-white/5 opacity-75 hover:opacity-100"
                                )}>
                                    <div className="relative shrink-0">
                                        <div className="flex items-center justify-center rounded-full size-12 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold text-lg">
                                            {contact.firstName[0]}
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <h4 className="text-base font-bold truncate">{contact.firstName} {contact.lastName}</h4>
                                        <p className="text-gray-500 text-xs truncate">{contact.phoneNumber || 'No Phone'}</p>
                                    </div>
                                    <div className="shrink-0 pr-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(contact.id)}
                                            onChange={() => toggleSelection(contact.id)}
                                            className="size-5 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-white/5 text-primary focus:ring-offset-0 focus:ring-primary transition-colors"
                                        />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Actions (Step 2 Only) */}
            {step === 2 && (
                <section className="fixed bottom-0 w-full z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 rounded-t-2xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] pb-safe">
                    <div className="p-4 flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Frequency for selected</label>
                                <span className="text-xs text-primary font-medium">{bulkFrequency} Days</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {[30, 90, 365, 7].map(freq => (
                                    <button
                                        key={freq}
                                        onClick={() => setBulkFrequency(freq)}
                                        className={clsx(
                                            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                            bulkFrequency === freq
                                                ? "bg-primary text-black font-bold shadow-[0_0_10px_rgba(70,236,19,0.3)] border border-primary"
                                                : "bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        {freq === 30 ? 'Monthly' : freq === 90 ? 'Quarterly' : freq === 7 ? 'Weekly' : 'Yearly'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-px w-full bg-gray-200 dark:bg-white/10"></div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2.5 cursor-pointer pl-1 group">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === parsedContacts.length && parsedContacts.length > 0}
                                    onChange={toggleAll}
                                    className="size-5 rounded border-gray-300 dark:border-gray-500 text-primary focus:ring-primary bg-transparent"
                                />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Select All</span>
                            </label>
                            <button
                                onClick={handleImport}
                                className="flex-1 h-12 bg-primary hover:bg-primary/90 active:scale-[0.98] text-black font-bold rounded-xl shadow-[0_4px_15px_rgba(70,236,19,0.2)] flex items-center justify-center gap-2 transition-all"
                            >
                                Import {selectedIds.size} Contacts
                                <span className="material-symbols-outlined text-[20px]">check</span>
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};
