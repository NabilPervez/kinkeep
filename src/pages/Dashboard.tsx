import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sortContacts } from '../utils/sorting';
import clsx from 'clsx';
// import { Contact } from '../types'; // Remove if not explicitly used, or use type import

export const Dashboard: React.FC = () => {
    const [filter, setFilter] = useState<'All' | 'Birthdays' | 'Overdue' | 'Upcoming'>('All');

    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
    const sortedContacts = sortContacts(contacts);

    /* 
    Filter Logic:
    We filter purely for display sections below based on the 'filter' state.
    'sortedContacts' is the master list.
  */

    const criticalContacts = sortedContacts.filter(c => (c.score || 0) > 0 || c.isBirthdayUpcoming);
    const upcomingContacts = sortedContacts.filter(c => (c.score || 0) <= 0 && !c.isBirthdayUpcoming && (c.score || 0) > -100); // Filter out snoozed or far future if negative score logic changes

    // Dummy data fallback for UI testing if empty
    const hasData = contacts.length > 0;

    return (
        <div className="flex-1 flex flex-col gap-6 p-4 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm -mx-4 px-4 pb-2">
                <div className="flex items-center justify-between pt-4 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20 bg-gray-200" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDQe-l0A3Pm-KVgm7HUU2kSHdyLsRD3q0Gr4FqwC7MUsTSgbh3aTWEvt8c6cvdJV-2P0o7kVORsmnlIqCH-nTdtpDToOKItXDxhZy14_q49h8VidfqQFHmj0yDBD6Xv8rVfQDtWvH1sVfg0PIKNu0XPHXDBuPCLQW6O3uTH1-43NjNIMhFRhlp17444YjM6-7WSlaTwMb_dskKfuTttI0NTx38MVMA67cAqYSCYOYPHs77CBTKN-EuIznAMB9ttTuDROMl6kdOGKVSK")' }}>
                            </div>
                            <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-background-light dark:border-background-dark"></div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold leading-tight tracking-tight">Good Morning</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">You have {criticalContacts.length} critical updates</p>
                        </div>
                    </div>
                    <Link to="/add-contact" className="flex items-center justify-center size-10 rounded-full bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shadow-sm">
                        <span className="material-symbols-outlined">add</span>
                    </Link>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-3 py-2 overflow-x-auto no-scrollbar">
                    {(['All', 'Birthdays', 'Overdue', 'Upcoming'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={clsx(
                                "flex h-8 shrink-0 items-center justify-center rounded-full px-4 transition-all",
                                filter === f
                                    ? "bg-primary text-black font-semibold shadow-[0_0_10px_rgba(70,236,19,0.3)]"
                                    : "bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-medium"
                            )}
                        >
                            <p className="text-sm">{f}</p>
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
                                                <button className="flex items-center justify-center h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-black text-sm font-bold shadow-[0_0_15px_rgba(70,236,19,0.2)] transition-all">
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
                                                <button className="flex items-center justify-center h-9 px-4 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-medium transition-all">
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
        </div>
    );
};
