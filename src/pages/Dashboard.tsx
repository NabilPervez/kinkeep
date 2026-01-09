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
import { CATEGORIES } from '../constants';

export const Dashboard: React.FC = () => {
    const [filter, setFilter] = useState<'All' | 'Birthdays' | 'Overdue' | 'Upcoming'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
        return localStorage.getItem('kinKeep_onboarding_done') === 'true';
    });

    const contacts = useLiveQuery(() => db.contacts.toArray()) || [];

    // Filter by category first - normalize category checks
    const filteredByCat = contacts.filter(c => categoryFilter === 'all' || c.category === categoryFilter);
    const sortedContacts = sortContacts(filteredByCat);

    const showOnboarding = contacts.length === 0 && !hasSeenOnboarding;

    const handleOnboardingComplete = () => {
        sounds.play('success');
        localStorage.setItem('kinKeep_onboarding_done', 'true');
        setHasSeenOnboarding(true);
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const now = Date.now();

    const contactedToday = sortedContacts.filter(c => isToday(c.lastContacted));
    const snoozedContacts = sortedContacts.filter(c => c.snoozedUntil && c.snoozedUntil > now && !contactedToday.includes(c));

    // Exclude contacted (handled) and snoozed from critical
    const criticalContacts = sortedContacts.filter(c =>
        (c.isBirthdayUpcoming || getNextDueDate(c) < now) &&
        !contactedToday.includes(c) &&
        !snoozedContacts.includes(c)
    );
    // Include contactedToday in upcoming, but exclude snoozed
    const upcomingContacts = sortedContacts.filter(c =>
        !criticalContacts.includes(c) &&
        !snoozedContacts.includes(c)
    );

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

    const renderContactCard = (c: Contact, isCritical: boolean, isContacted: boolean = false, isSnoozed: boolean = false) => (
        <div key={c.id} className="p-4 rounded-2xl glass-card flex items-center justify-between group h-[88px] animate-in fade-in zoom-in-95 duration-300 break-inside-avoid shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex items-center justify-center size-12 rounded-2xl bg-white/40 dark:bg-white/10 text-xl font-bold dark:text-gray-300 overflow-hidden shrink-0 backdrop-blur-sm">
                    {c.avatarImage ? (
                        <img src={c.avatarImage} alt={c.firstName} className="size-full object-cover" />
                    ) : (
                        c.firstName[0]
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg leading-tight dark:text-white truncate">{c.firstName} {c.lastName}</h3>
                    <div className="flex flex-col mt-0.5">
                        <p className={clsx("text-xs font-bold flex items-center gap-1", isCritical ? "text-red-500" : "text-gray-500 dark:text-gray-300")}>
                            <span className="material-symbols-outlined text-[14px]">
                                {c.isBirthdayUpcoming ? 'cake' : 'event'}
                            </span>
                            {c.isBirthdayUpcoming ? 'Birthday' : (isSnoozed ? 'Snoozed' : (isCritical ? 'Overdue' : 'Next'))}: {isSnoozed && c.snoozedUntil ? format(c.snoozedUntil, 'MMM d') : formatStatus(c)}
                        </p>
                        {c.lastContacted > 0 && !isContacted && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[10px]">history</span>
                                {format(c.lastContacted, 'MMM d')}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                {/* Visual Indicator */}
                <div className={clsx(
                    "size-6 flex items-center justify-center rounded-full border transition-colors",
                    isContacted ? "bg-green-500 border-green-500 text-white" :
                        isSnoozed ? "bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-500/50 text-orange-500" :
                            "border-gray-300 dark:border-white/10 text-transparent"
                )}>
                    {isContacted && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                    {isSnoozed && <span className="material-symbols-outlined text-[16px]">snooze</span>}
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
                            : "bg-white/50 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white backdrop-blur-sm"
                    )}
                >
                    <span className="material-symbols-outlined">send</span>
                </button>
            </div>
        </div>
    );

    const categoryOptions = [{ id: 'all', label: 'All' }, ...CATEGORIES];

    return (
        <div className="flex-1 flex flex-col h-screen bg-transparent">
            <header className="sticky top-0 z-50 glass-panel border-b-0 pb-2">
                <div className="flex items-center justify-between px-6 pt-12 pb-2">
                    <div className="flex items-center gap-2 md:hidden"> {/* Only show KinKeep on mobile header if sidebar is hidden */}
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/25">
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">KinKeep</h1>
                    </div>
                    {/* Spacer for desktop alignment if needed or just hidden title */}
                    <div className="hidden md:block">
                        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            to="/settings"
                            onClick={() => sounds.play('click')}
                            className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all shadow-sm border border-gray-200 dark:border-transparent active:scale-95"
                        >
                            <span className="material-symbols-outlined">settings</span>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 pb-2">
                    {/* Status Filters */}
                    <div className="px-6 overflow-x-auto no-scrollbar flex gap-2">
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

                    {/* Category Filters */}
                    <div className="px-6 overflow-x-auto no-scrollbar flex gap-2">
                        {categoryOptions.map(c => (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setCategoryFilter(c.id);
                                    sounds.play('pop');
                                }}
                                className={clsx(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap border",
                                    categoryFilter === c.id
                                        ? "bg-gray-900 dark:bg-white text-white dark:text-black border-transparent"
                                        : "bg-transparent text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-400"
                                )}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
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

                    {/* Snoozed Section */}
                    {snoozedContacts.length > 0 && filter === 'All' && (
                        <section className="animate-in slide-in-from-bottom-5 fade-in duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-bold dark:text-white">Snoozed</h2>
                                <span className="flex h-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 px-2 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                    {snoozedContacts.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max opacity-90">
                                {snoozedContacts.map(c => renderContactCard(c, false, false, true))}
                            </div>
                        </section>
                    )}

                    {/* Critical Section */}
                    {criticalContacts.length > 0 && (filter === 'All' || filter === 'Overdue' || filter === 'Birthdays') && (
                        <section className="animate-in slide-in-from-bottom-5 fade-in duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-bold dark:text-white">Attention Needed</h2>
                                <span className="flex h-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 px-2 text-[10px] font-bold text-red-600 dark:text-red-400">
                                    {criticalContacts.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max">
                                {criticalContacts.map(c => renderContactCard(c, true))}
                            </div>
                        </section>
                    )}

                    {/* Upcoming Section Grouped by Date */}
                    {upcomingContacts.length > 0 && (filter === 'All' || filter === 'Upcoming') && (
                        <section className="animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100 flex flex-col gap-6">
                            {Array.from(new Set(upcomingContacts.map(c => formatStatus(c)))).map(label => {
                                const contactsInGroup = upcomingContacts.filter(c => formatStatus(c) === label);
                                return (
                                    <div key={label}>
                                        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider pl-1 mb-3">
                                            {label}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-max">
                                            {contactsInGroup.map(c => renderContactCard(c, false, isToday(c.lastContacted)))}
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    )}

                    {(criticalContacts.length === 0 && upcomingContacts.length === 0 && contactedToday.length === 0 && snoozedContacts.length === 0) && (
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
