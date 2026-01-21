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
    const criticalContacts = sortedContacts.filter(c => {
        const due = getNextDueDate(c);
        const isDueForToday = due < now || isToday(due);

        return (
            (c.isBirthdayUpcoming || isDueForToday) &&
            !contactedToday.includes(c) &&
            !snoozedContacts.includes(c)
        );
    });
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

    // Bento Grid Dashboard Implementation
    const renderBentoGrid = () => {
        // Zone A: Focus Contact (Highest Priority - Only Today/Overdue)
        const focusContact = criticalContacts[0];

        // Zone D: List Feed (Remaining Upcoming) - Now includes everyone NOT the focus contact
        const feedContacts = [...criticalContacts, ...upcomingContacts].filter(c => c.id !== focusContact?.id);

        // Group feed contacts by status label
        const groupedFeed = feedContacts.reduce((acc, contact) => {
            const status = formatStatus(contact);
            if (!acc[status]) acc[status] = [];
            acc[status].push(contact);
            return acc;
        }, {} as Record<string, Contact[]>);

        return (
            <div className="flex flex-col gap-6 p-4 pb-32 max-w-lg mx-auto w-full">

                {/* Zone A: Focus Contact */}
                {focusContact ? (
                    <div className="glass-card rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between min-h-[350px] animate-in slide-in-from-bottom-5 duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <span className="material-symbols-outlined text-[100px] text-white/5 -rotate-12 translate-x-4 -translate-y-4">
                                {focusContact.isBirthdayUpcoming ? 'cake' : 'star'}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wide backdrop-blur-md">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Focus
                                </span>
                                {(() => {
                                    const catObj = CATEGORIES.find(cat => cat.id === focusContact.category) || CATEGORIES.find(cat => cat.id === 'other');
                                    return (
                                        <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded shadow-sm", catObj?.colorClass)}>
                                            {catObj?.label || focusContact.category || 'Other'}
                                        </span>
                                    );
                                })()}
                                <span className="text-white/60 text-xs font-semibold">{formatStatus(focusContact)}</span>
                            </div>

                            <div className="flex flex-col items-center text-center mt-6">
                                <div className="size-28 rounded-full bg-gradient-to-br from-white/10 to-white/5 p-1 mb-5 shadow-2xl ring-1 ring-white/20">
                                    <div className="size-full rounded-full overflow-hidden bg-zinc-800">
                                        {focusContact.avatarImage ? (
                                            <img src={focusContact.avatarImage} alt={focusContact.firstName} className="size-full object-cover" />
                                        ) : (
                                            <div className="size-full flex items-center justify-center text-3xl font-bold text-white/80">
                                                {focusContact.firstName[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                                    {focusContact.firstName}
                                    <span className="block text-white/40 font-medium text-lg mt-1">{focusContact.lastName}</span>
                                </h2>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                onClick={() => {
                                    setSelectedContactId(focusContact.id);
                                    sounds.play('click');
                                }}
                                className="w-full py-4 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Connect Now
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center text-white min-h-[350px] animate-in zoom-in-95 duration-500">
                        <div className="size-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30">
                            <span className="material-symbols-outlined text-5xl text-emerald-400">check</span>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">All Done!</h2>
                        <p className="text-white/50 text-lg font-medium max-w-[200px]">You've completed your checklist for today.</p>
                    </div>
                )}

                {/* Zone D: List Feed (Grouped) */}
                <div className="flex flex-col gap-6">
                    {Object.entries(groupedFeed).map(([status, contactsInGroup]) => (
                        <div key={status} className="flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest pl-1 sticky top-[80px] z-10 py-2 mix-blend-overlay">
                                {status}
                            </h3>
                            {contactsInGroup.map((c, i) => (
                                <div
                                    key={c.id}
                                    onClick={() => {
                                        setSelectedContactId(c.id);
                                        sounds.play('click');
                                    }}
                                    className="glass-card p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 cursor-pointer transition-all active:scale-[0.98] animate-in slide-in-from-bottom-4 fade-in duration-500"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {c.avatarImage ? (
                                            <img src={c.avatarImage} alt={c.firstName} className="size-full rounded-full object-cover" />
                                        ) : c.firstName[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold truncate">{c.firstName} {c.lastName}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {(() => {
                                                const catObj = CATEGORIES.find(cat => cat.id === c.category) || CATEGORIES.find(cat => cat.id === 'other');
                                                return (
                                                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded shadow-sm", catObj?.colorClass)}>
                                                        {catObj?.label || c.category || 'Other'}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <button className="size-8 rounded-full bg-white/5 hover:bg-primary text-white/60 hover:text-white flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}

                    {feedContacts.length === 0 && !focusContact && (
                        <div className="p-8 text-center text-white/40 text-sm font-medium">No other upcoming contacts</div>
                    )}
                </div>
            </div>
        );
    };

    const categoryOptions = [{ id: 'all', label: 'All' }, ...CATEGORIES];

    return (
        <div className="flex-1 flex flex-col h-screen bg-transparent no-scrollbar overflow-y-auto">
            {/* Header with full bleed on mobile (-mx-4 to counteract Layout padding) -> Now standard */}
            <header className="sticky top-0 z-50 glass-panel border-b-0 pb-2 px-4">
                <div className="flex items-center justify-between pt-12 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-white">KinKeep</h1>
                    </div>
                    <Link
                        to="/settings"
                        onClick={() => sounds.play('click')}
                        className="flex items-center justify-center size-10 rounded-full glass-input hover:bg-white/20 text-white transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </Link>
                </div>
                {/* Horizontal Category Filter */}
                <div className="pb-2 overflow-x-auto no-scrollbar flex gap-2 w-full">
                    {categoryOptions.map(c => {
                        const styleClass = 'colorClass' in c ? (c as any).colorClass : "bg-white text-black border-transparent shadow-lg shadow-white/10";
                        const isActive = categoryFilter === c.id;
                        return (
                            <button
                                key={c.id}
                                onClick={() => {
                                    setCategoryFilter(c.id);
                                    sounds.play('pop');
                                }}
                                className={clsx(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap border backdrop-blur-md shrink-0 flex-1 md:flex-none text-center",
                                    isActive
                                        ? styleClass
                                        : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {c.label}
                            </button>
                        )
                    })}
                </div>
            </header>

            {/* Main Content Area - Bento Grid */}
            <main className="px-4">
                {!hasData ? (
                    <div className="mt-20 flex flex-col items-center justify-center p-6 text-center opacity-60">
                        <span className="material-symbols-outlined text-6xl mb-4 text-white/20">checklist</span>
                        <p className="text-base font-medium text-white/60">No contacts yet.</p>
                        <p className="text-sm text-white/40 mb-6">Add someone to start building better habits.</p>
                    </div>
                ) : (
                    renderBentoGrid()
                )}
            </main>

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
