import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { parseCSV, parseVCF } from '../utils/fileParser';
import type { Contact } from '../types';
import clsx from 'clsx';

interface FrequencyStage {
    label: string;
    days: number;
    description: string;
}

const STAGES: FrequencyStage[] = [
    { label: 'Daily', days: 1, description: 'People you want to talk to every single day.' },
    { label: '3 Days', days: 3, description: 'People you want to catch up with every few days.' },
    { label: 'Weekly', days: 7, description: 'People you want to connect with once a week.' },
    { label: 'Monthly', days: 30, description: 'People you want to verify relationships with once a month.' },
    { label: 'Quarterly', days: 90, description: 'Close friends or family you see every season.' },
    { label: 'Yearly', days: 365, description: 'Distant relatives or old friends to check in on annually.' },
];

export const ImportWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    // All contacts parsed from file
    const [parsedContacts, setParsedContacts] = useState<Contact[]>([]);

    // IDs of contacts that have been assigned a frequency
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

    // IDs currently selected for the *current stage*
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Final list of contacts to import with their assigned frequencies
    const [finalImportList, setFinalImportList] = useState<Contact[]>([]);

    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    // Derived: Contacts that haven't been processed yet, filtered by search and sorted alphabetically
    const remainingContacts = useMemo(() => {
        let contacts = parsedContacts.filter(c => !processedIds.has(c.id));

        // Filter by search
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            contacts = contacts.filter(c =>
                c.firstName.toLowerCase().includes(lowerQuery) ||
                c.lastName.toLowerCase().includes(lowerQuery)
            );
        }

        // Sort alphabetically
        return contacts.sort((a, b) => {
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [parsedContacts, processedIds, searchQuery]);

    const currentStage = STAGES[currentStageIndex];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
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
                result = await parseVCF(f);
            } else {
                alert("Unsupported file type");
                setIsParsing(false);
                return;
            }

            if (result && result.contacts.length > 0) {
                setParsedContacts(result.contacts);
                // Start with NO contacts selected
                setSelectedIds(new Set());
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
        if (selectedIds.size === remainingContacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(remainingContacts.map(c => c.id)));
        }
    };

    const handleConfirmStage = () => {
        // Find contacts selected in the current filtered view
        // Note: Currently selectedIds might contain IDs not in visible view if search is active?
        // Let's assume user operates on what they see or what they've selected.
        // We need to move ALL selected IDs to processed, regardless of search view.

        const contactsToMove = parsedContacts.filter(c => selectedIds.has(c.id));

        // Add selected to final list with current frequency
        const newImportItems = contactsToMove.map(c => ({
            ...c,
            frequencyDays: currentStage.days
        }));

        setFinalImportList(prev => [...prev, ...newImportItems]);

        // Mark these IDs as processed
        const newProcessed = new Set(processedIds);
        selectedIds.forEach(id => newProcessed.add(id));
        setProcessedIds(newProcessed);

        // Clear selection and search for next stage
        setSelectedIds(new Set());
        setSearchQuery('');
        setIsSearchVisible(false);

        // Move to next stage or finish
        if (currentStageIndex < STAGES.length - 1) {
            setCurrentStageIndex(prev => prev + 1);
            // If no contacts left, we could arguably skip or just show empty list?
            // User might want to skip stages even if contacts remain, so we just proceed.
        } else {
            // Finished all stages
            setStep(3);
        }
    };

    const handleNextSkipping = () => {
        // Skip selecting anyone for this stage
        setSelectedIds(new Set());
        setSearchQuery('');
        setIsSearchVisible(false);
        if (currentStageIndex < STAGES.length - 1) {
            setCurrentStageIndex(prev => prev + 1);
        } else {
            setStep(3);
        }
    };

    const finalizeImport = async () => {
        if (finalImportList.length === 0) {
            alert("No contacts selected to import.");
            return;
        }

        await db.contacts.bulkAdd(finalImportList);
        navigate('/');
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between px-4 py-4">
                    <button onClick={() => {
                        if (step === 1) navigate(-1);
                        else if (step === 2 && currentStageIndex > 0) {
                            // Go back to previous stage (need to un-process contacts from that stage?)
                            // This is complex. For now, simple back button resets or goes back to start?
                            // Simplest: Go back to upload if step 2.
                            // Or ideally, "Undo" last stage.
                            // Let's just allow going back to previous stage logic if feasible,
                            // but implementing 'undo' implies removing from finalImportList.
                            // For simplicity given instructions, let's treat "Back" as "Cancel Flow" or go back to upload for now.
                            // Or better: Allow aborting.
                            if (confirm("Restart import process?")) {
                                setStep(1);
                                setParsedContacts([]);
                                setProcessedIds(new Set());
                                setFinalImportList([]);
                                setCurrentStageIndex(0);
                            }
                        } else {
                            navigate(-1);
                        }
                    }} className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors -ml-2">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-base font-bold leading-tight tracking-tight">
                            {step === 1 ? 'Upload File' : step === 3 ? 'Complete Import' : `Assign: ${currentStage.label}`}
                        </h2>
                        {step === 2 && (
                            <div className="flex items-center gap-1 mt-1">
                                {STAGES.map((_, idx) => (
                                    <span key={idx} className={clsx(
                                        "h-1.5 w-1.5 rounded-full transition-colors",
                                        idx === currentStageIndex ? "bg-primary" : idx < currentStageIndex ? "bg-primary/50" : "bg-gray-300 dark:bg-gray-600"
                                    )}></span>
                                ))}
                            </div>
                        )}
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
                            <p>Export your contacts from Google, iCloud, or Outlook as a CSV or vCard file.</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Stage Description */}
                        <div className="mb-4 text-center px-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{currentStage.label} ({currentStage.days} Day{currentStage.days > 1 ? 's' : ''})</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{currentStage.description}</p>
                            <div className="mt-2 inline-flex items-center justify-center px-3 py-1 bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-full text-xs font-semibold">
                                {remainingContacts.length} contacts remaining
                            </div>
                        </div>

                        {/* Actions Row (Select All) */}
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline" onClick={toggleAll}>
                                <div className={clsx("size-4 border rounded flex items-center justify-center", selectedIds.size === remainingContacts.length && remainingContacts.length > 0 ? "bg-primary border-primary text-black" : "border-gray-400")}>
                                    {selectedIds.size === remainingContacts.length && remainingContacts.length > 0 && <span className="material-symbols-outlined text-[10px] font-bold">check</span>}
                                </div>
                                Select All
                            </label>
                            <span className="text-xs text-gray-400">Selected: {selectedIds.size}</span>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-32">
                            {remainingContacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">done_all</span>
                                    <p>{searchQuery ? 'No contacts match search' : 'No remaining contacts to assign!'}</p>
                                </div>
                            ) : (
                                remainingContacts.map(contact => (
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
                                ))
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6 text-center">
                        <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                            <span className="material-symbols-outlined text-5xl">check_circle</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">All Set!</h2>
                            <p className="text-gray-500">You have categorized {finalImportList.length} contacts.</p>
                            {remainingContacts.length > 0 && (
                                <p className="text-red-400 text-sm mt-2">
                                    ({remainingContacts.length} contacts were not assigned and will be skipped)
                                </p>
                            )}
                        </div>
                        <div className="w-full max-w-sm bg-surface-light dark:bg-surface-dark rounded-xl p-4 text-left space-y-2 border border-white/5">
                            {STAGES.map(stage => {
                                const count = finalImportList.filter(c => c.frequencyDays === stage.days).length;
                                if (count === 0) return null;
                                return (
                                    <div key={stage.label} className="flex justify-between text-sm">
                                        <span className="text-gray-400">{stage.label}</span>
                                        <span className="font-bold">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={finalizeImport}
                            className="w-full max-w-sm h-14 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            Import Contacts
                            <span className="material-symbols-outlined">download_done</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Footer Actions (Step 2 Only) */}
            {step === 2 && (
                <section className="fixed bottom-0 w-full z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 rounded-t-2xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] pb-safe">
                    <div className="p-4 flex flex-col gap-4">
                        {isSearchVisible ? (
                            <div className="flex items-center gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-white/10 px-4 border-none focus:ring-2 focus:ring-primary"
                                />
                                <button onClick={() => setIsSearchVisible(false)} className="size-12 rounded-xl bg-gray-200 dark:bg-white/5 flex items-center justify-center">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ) : null}

                        <div className="flex items-center gap-4">
                            {!isSearchVisible && (
                                <button
                                    onClick={() => setIsSearchVisible(true)}
                                    className="size-12 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined">search</span>
                                </button>
                            )}
                            <button
                                onClick={handleNextSkipping}
                                className="px-6 h-12 rounded-xl text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleConfirmStage}
                                disabled={selectedIds.size === 0}
                                className={clsx(
                                    "flex-1 h-12 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg",
                                    selectedIds.size > 0
                                        ? "bg-primary hover:bg-primary/90 text-black shadow-[0_4px_15px_rgba(70,236,19,0.2)]"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {selectedIds.size > 0 ? `Save` : 'Save'}
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

