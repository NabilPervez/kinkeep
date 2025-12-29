import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sortContacts } from '../utils/sorting';
import clsx from 'clsx';
import { ConnectModal } from '../components/ConnectModal';
import { Onboarding } from '../components/Onboarding';
import { getNextDueDate } from '../utils/dateUtils';
import { sounds } from '../utils/sounds';
// import { Contact } from '../types'; // Remove if not explicitly used, or use type import

export const Dashboard: React.FC = () => {
    const [filter, setFilter] = useState<'All' | 'Birthdays' | 'Overdue' | 'Upcoming'>('All');
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
        return localStorage.getItem('kinKeep_onboarding_done') === 'true';
    });

    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
    const sortedContacts = sortContacts(contacts);

    // Show onboarding if no contacts AND not explicitly dismissed? 
    // User request: "play if the user has not imported any contacts".
    // Does that mean EVERY time? No.
    // Let's use: If contacts == 0 AND !hasSeenOnboarding.
    const showOnboarding = contacts.length === 0 && !hasSeenOnboarding;

    const handleOnboardingComplete = () => {
        sounds.play('success');
        localStorage.setItem('kinKeep_onboarding_done', 'true');
        setHasSeenOnboarding(true);
    };

    /* 
    Filter Logic:
    - All: Show Critical (Overdue + Bday) first, then Upcoming.
    - Birthdays: Show only contacts with birthday in next 30 days.
    - Overdue: Show only overdue.
    - Upcoming: Show only upcoming non-critical.
  */

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const now = Date.now();
    const criticalContacts = sortedContacts.filter(c => c.isBirthdayUpcoming || getNextDueDate(c) < now);
    const upcomingContacts = sortedContacts.filter(c => !criticalContacts.includes(c));

    // Dummy data fallback for UI testing if empty
    const hasData = contacts.length > 0;

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 pb-2">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-black font-bold">
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">KinKeep</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to="/add-contact"
                            onClick={() => sounds.play('click')}
                            className="flex items-center px-3 h-10 rounded-full bg-primary text-black font-bold text-sm shadow-[0_0_15px_rgba(70,236,19,0.3)] hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
                            Add Contact
                        </Link>
                        <Link
                            to="/import"
                            onClick={() => sounds.play('click')}
                            className="flex items-center justify-center size-10 rounded-full bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm active:scale-95"
                        >
                            <span className="material-symbols-outlined">upload_file</span>
                        </Link>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="px-4 pb-2 overflow-x-auto no-scrollbar flex gap-2">
                    {['All', 'Birthdays', 'Overdue', 'Upcoming'].map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setFilter(f as any);
                                sounds.play('pop');
                            }}
                            className={clsx(
                                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
                                filter === f
                                    ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                                    : "bg-surface-light dark:bg-surface-dark text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            {!hasData ? (
                <div className="mt-8 flex flex-col items-center justify-center p-6 text-center opacity-60">
                    <span className="material-symbols-outlined text-4xl mb-2 text-gray-500">checklist</span>
                    <p className="text-sm text-gray-500">No contacts yet. Add some to get started!</p>
                </div>
            ) : (
                <>
                    {/* Critical Section */}
                    {criticalContacts.length > 0 && (filter === 'All' || filter === 'Overdue' || filter === 'Birthdays') && (
                        <section>
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold px-1 mb-3 flex items-center gap-2">
                                Critical
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-500">{criticalContacts.length}</span>
                            </h3>
                            <div className="flex flex-col gap-3">
                                {criticalContacts.map(contact => (
                                    <div key={contact.id} className="relative group overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 p-3">
                                        {/* Left accent bar */}
                                        <div className={clsx("absolute left-0 top-0 bottom-0 w-1", contact.isBirthdayUpcoming ? "bg-primary" : "bg-red-500")}></div>
                                        <div className="flex items-center gap-3 pl-2">
                                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-14 shrink-0 bg-gray-200" style={{ backgroundImage: contact.avatarImage ? `url(${contact.avatarImage})` : undefined }}>
                                                {!contact.avatarImage && <div className="flex items-center justify-center w-full h-full text-gray-500 font-bold">{contact.firstName[0]}</div>}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-base font-bold truncate">{contact.firstName} {contact.lastName}</h4>
                                                    {contact.isBirthdayUpcoming && <span className="material-symbols-outlined text-primary text-[18px]">cake</span>}
                                                </div>
                                                <p className={clsx("text-sm font-medium truncate", contact.isBirthdayUpcoming ? "text-primary" : "text-red-400")}>
                                                    {contact.isBirthdayUpcoming ? "Birthday Soon!" : "Overdue"}
                                                </p>
                                            </div>
                                            <div className="shrink-0">
                                                <button
                                                    onClick={() => setSelectedContactId(contact.id)}
                                                    className="flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-black text-sm font-bold shadow-[0_0_15px_rgba(70,236,19,0.2)] transition-all"
                                                >
                                                    Connect
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Section */}
                    {upcomingContacts.length > 0 && (filter === 'All' || filter === 'Upcoming') && (
                        <section>
                            <h3 className="text-gray-900 dark:text-white text-lg font-bold px-1 mb-3">Upcoming</h3>
                            <div className="flex flex-col gap-3">
                                {upcomingContacts.map(contact => (
                                    <div key={contact.id} className="relative group overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/5 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-14 shrink-0 bg-gray-200">
                                                {!contact.avatarImage && <div className="flex items-center justify-center w-full h-full text-gray-500 font-bold">{contact.firstName[0]}</div>}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h4 className="text-base font-bold truncate">{contact.firstName} {contact.lastName}</h4>
                                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                                    <p className="text-sm font-medium truncate">Catch up later</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <button
                                                    onClick={() => setSelectedContactId(contact.id)}
                                                    className="flex items-center justify-center h-9 px-4 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-medium transition-all"
                                                >
                                                    Connect
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {(criticalContacts.length === 0 && upcomingContacts.length === 0) && (
                        <div className="mt-4 flex flex-col items-center justify-center p-6 text-center opacity-60">
                            <span className="material-symbols-outlined text-4xl mb-2 text-gray-500">checklist</span>
                            <p className="text-sm text-gray-500">You're all caught up for today!</p>
                        </div>
                    )}
                </>
            )}

            {/* Connect Modal */}
            {selectedContactId && (
                <ConnectModal
                    contactId={selectedContactId}
                    onClose={() => setSelectedContactId(null)}
                />
            )}

            {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
        </div>
    );
};
