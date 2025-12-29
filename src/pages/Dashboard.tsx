import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sortContacts, getDaysUntilBirthday } from '../utils/sorting';
import clsx from 'clsx';
import { ConnectModal } from '../components/ConnectModal';
import { Onboarding } from '../components/Onboarding';
import { getNextDueDate } from '../utils/dateUtils';
import { sounds } from '../utils/sounds';
import { format, differenceInCalendarDays, isToday, isTomorrow } from 'date-fns';
import type { Contact } from '../types';

export const Dashboard: React.FC = () => {
    const [filter, setFilter] = useState<'All' | 'Birthdays' | 'Overdue' | 'Upcoming'>('All');
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
        return localStorage.getItem('kinKeep_onboarding_done') === 'true';
    });

    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];
    const sortedContacts = sortContacts(contacts);

    const showOnboarding = contacts.length === 0 && !hasSeenOnboarding;

    const handleOnboardingComplete = () => {
        sounds.play('success');
        localStorage.setItem('kinKeep_onboarding_done', 'true');
        setHasSeenOnboarding(true);
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const now = Date.now();
    const criticalContacts = sortedContacts.filter(c => c.isBirthdayUpcoming || getNextDueDate(c) < now);
    const upcomingContacts = sortedContacts.filter(c => !criticalContacts.includes(c));

    const hasData = contacts.length > 0;

    const formatStatus = (c: Contact) => {
        if (c.isBirthdayUpcoming) {
            const days = getDaysUntilBirthday(c.birthday);
            return days === 0 ? 'Today!' : `in ${days} days`;
        }
        const due = getNextDueDate(c);
        const diff = differenceInCalendarDays(due, now);

        if (diff < 0) return `${Math.abs(diff)}d ago`;
        if (isToday(due)) return 'Today';
        if (isTomorrow(due)) return 'Tomorrow';
        if (diff < 7) return format(due, 'EEEE'); // Friday
        return format(due, 'MMM d');
    };

    const renderContactCard = (c: Contact, isCritical: boolean) => (
        <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-[#1E2130] border border-transparent dark:border-white/5 shadow-sm dark:shadow-neo-dark flex items-center justify-between group h-[88px]">
            <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 text-xl font-bold dark:text-gray-300 overflow-hidden shrink-0">
                    {c.avatarImage ? (
                        <img src={c.avatarImage} alt={c.firstName} className="size-full object-cover" />
                    ) : (
                        c.firstName[0]
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight dark:text-white truncate max-w-[150px] sm:max-w-xs">{c.firstName} {c.lastName}</h3>
                    <div className="flex flex-col mt-0.5">
                        <p className={clsx("text-xs font-bold flex items-center gap-1", isCritical ? "text-red-500" : "text-gray-400")}>
                            <span className="material-symbols-outlined text-[14px]">
                                {c.isBirthdayUpcoming ? 'cake' : 'event'}
                            </span>
                            {c.isBirthdayUpcoming ? 'Birthday' : (isCritical ? 'Overdue' : 'Next')}: {formatStatus(c)}
                        </p>
                        {c.lastContacted > 0 && (
                            <p className="text-[10px] text-gray-300 dark:text-gray-600 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[10px]">history</span>
                                {format(c.lastContacted, 'MMM d')}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <button
                onClick={() => {
                    setSelectedContactId(c.id);
                    sounds.play('click');
                }}
                className={clsx(
                    "size-10 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-95",
                    isCritical
                        ? "bg-primary text-white shadow-primary/30"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white"
                )}
            >
                <span className="material-symbols-outlined">send</span>
            </button>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 pb-2">
                <div className="flex items-center justify-between px-6 pt-12 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/25">
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">KinKeep</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to="/add-contact"
                            onClick={() => sounds.play('click')}
                            className="flex items-center px-4 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
                            Add
                        </Link>
                        <Link
                            to="/import"
                            onClick={() => sounds.play('click')}
                            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all shadow-sm border border-gray-200 dark:border-transparent active:scale-95"
                        >
                            <span className="material-symbols-outlined">upload_file</span>
                        </Link>
                        <Link
                            to="/templates"
                            onClick={() => sounds.play('click')}
                            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all shadow-sm border border-gray-200 dark:border-transparent active:scale-95"
                        >
                            <span className="material-symbols-outlined">description</span>
                        </Link>
                    </div>
                </div>

                <div className="px-6 pb-2 overflow-x-auto no-scrollbar flex gap-2">
                    {['All', 'Birthdays', 'Overdue', 'Upcoming'].map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setFilter(f as any);
                                sounds.play('pop');
                            }}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
                                filter === f
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/5"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            {!hasData ? (
                <div className="mt-20 flex flex-col items-center justify-center p-6 text-center opacity-60">
                    <span className="material-symbols-outlined text-6xl mb-4 text-gray-300 dark:text-gray-700">checklist</span>
                    <p className="text-base font-medium text-gray-500">No contacts yet.</p>
                    <p className="text-sm text-gray-400 mb-6">Add someone to start building better habits.</p>
                </div>
            ) : (
                <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-32 space-y-8">
                    {/* Critical Section */}
                    {criticalContacts.length > 0 && (filter === 'All' || filter === 'Overdue' || filter === 'Birthdays') && (
                        <section className="animate-in slide-in-from-bottom-5 fade-in duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-bold dark:text-white">Attention Needed</h2>
                                <span className="flex h-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 px-2 text-[10px] font-bold text-red-600 dark:text-red-400">
                                    {criticalContacts.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {criticalContacts.map(c => renderContactCard(c, true))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Section */}
                    {upcomingContacts.length > 0 && (filter === 'All' || filter === 'Upcoming') && (
                        <section className="animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-bold dark:text-white">Upcoming</h2>
                            </div>
                            <div className="space-y-3">
                                {upcomingContacts.map(c => renderContactCard(c, false))}
                            </div>
                        </section>
                    )}

                    {(criticalContacts.length === 0 && upcomingContacts.length === 0) && (
                        <div className="mt-10 flex flex-col items-center justify-center p-6 text-center opacity-60">
                            <span className="material-symbols-outlined text-4xl mb-2 text-gray-500">check_circle</span>
                            <p className="text-sm text-gray-500">You're all caught up for today!</p>
                        </div>
                    )}
                </main>
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
