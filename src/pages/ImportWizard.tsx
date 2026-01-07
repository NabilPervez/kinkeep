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

    // Auto-select contacts matching current stage frequency
    React.useEffect(() => {
        if (step === 2) {
            const available = parsedContacts.filter(c => !processedIds.has(c.id));
            const matches = available.filter(c => c.frequencyDays === currentStage.days);
            if (matches.length > 0) {
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    matches.forEach(m => next.add(m.id));
                    return next;
                });
            }
        }
    }, [currentStageIndex, step, parsedContacts, processedIds, currentStage.days]);


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

        console.log(`Confirming Stage: ${currentStage.label} (${currentStage.days} days). Selected: ${contactsToMove.length}`);

        // Add selected to final list with current frequency
        const newImportItems = contactsToMove.map(c => ({
            ...c,
            // Ensure days is a number
            frequencyDays: parseInt(currentStage.days.toString())
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
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 transition-all">
                {isSearchVisible && step === 2 ? (
                    <div className="flex items-center gap-2 px-4 py-3 animate-in fade-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-gray-400">search</span>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search names..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 p-0"
                        />
                        <button
                            onClick={() => {
                                setIsSearchVisible(false);
                                setSearchQuery('');
                            }}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                            <span className="material-symbols-outlined text-gray-500">close</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between px-4 py-3">
                        {/* Left: Back */}
                        <div className="flex-1 flex items-center justify-start">
                            <button onClick={() => {
                                if (step === 1) navigate(-1);
                                else if (step === 2 && currentStageIndex > 0) {
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
                            }} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 -ml-2 transition-colors text-gray-900 dark:text-white">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        </div>

                        {/* Center: Title */}
                        <div className="flex-[2] flex flex-col items-center justify-center">
                            <h2 className="text-base font-bold leading-tight tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
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

                        {/* Right: Actions */}
                        <div className="flex-1 flex items-center justify-end gap-1">
                            {step === 2 && (
                                <>
                                    <button
                                        onClick={() => setIsSearchVisible(true)}
                                        className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[22px]">search</span>
                                    </button>

                                    {selectedIds.size > 0 ? (
                                        <button
                                            onClick={handleConfirmStage}
                                            className="px-4 h-9 rounded-full bg-primary text-black font-bold text-sm shadow-sm hover:opacity-90 transition-all active:scale-95"
                                        >
                                            Save
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNextSkipping}
                                            className="px-3 h-9 rounded-full text-gray-500 font-medium text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                        >
                                            Skip
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Sticky Sub-header for Step 2 */}
                {step === 2 && !isSearchVisible && (
                    <div className="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-white/5 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
                        <div className="text-center mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 px-4">{currentStage.description}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                {remainingContacts.length} Left
                            </div>
                            <label className="flex items-center gap-2 text-sm text-primary font-bold cursor-pointer" onClick={toggleAll}>
                                <div className={clsx("size-5 border-2 rounded flex items-center justify-center transition-all",
                                    selectedIds.size === remainingContacts.length && remainingContacts.length > 0
                                        ? "bg-primary border-primary text-black"
                                        : "border-gray-300 dark:border-gray-600"
                                )}>
                                    {selectedIds.size === remainingContacts.length && remainingContacts.length > 0 && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                                </div>
                                Select All
                            </label>
                        </div>
                    </div>
                )}
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
                        {/* List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-10">
                            {remainingContacts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">done_all</span>
                                    <p>{searchQuery ? 'No contacts match search' : 'No remaining contacts to assign!'}</p>
                                </div>
                            ) : (
                                remainingContacts.map(contact => (
                                    <label key={contact.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleSelection(contact.id);
                                        }}
                                        className={clsx(
                                            "group flex items-center gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-xl border shadow-sm transition-all cursor-pointer",
                                            selectedIds.has(contact.id) ? "border-primary/50 bg-primary/5" : "border-gray-100 dark:border-white/5 opacity-80 hover:opacity-100"
                                        )}>
                                        <div className="relative shrink-0">
                                            <div className="flex items-center justify-center rounded-full size-12 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold text-lg">
                                                {contact.firstName[0]}
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <h4 className="text-base font-bold truncate text-gray-900 dark:text-white">{contact.firstName} {contact.lastName}</h4>
                                            <p className="text-gray-500 text-xs truncate">{contact.phoneNumber || contact.email || 'No Contact Info'}</p>
                                        </div>
                                        <div className="shrink-0 pr-1">
                                            <div className={clsx("size-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                selectedIds.has(contact.id)
                                                    ? "bg-primary border-primary text-black"
                                                    : "border-gray-300 dark:border-gray-600 bg-transparent"
                                            )}>
                                                {selectedIds.has(contact.id) && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                            </div>
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
        </div>
    );
};
