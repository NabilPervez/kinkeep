import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link, useNavigate } from 'react-router-dom';
import { ConnectModal } from '../components/ConnectModal'; // Re-use this for quick access
import type { Contact } from '../types';
import { sounds } from '../utils/sounds';
import Papa from 'papaparse';
import clsx from 'clsx';
import { CATEGORIES, FREQUENCIES, DAYS_OF_WEEK } from '../constants';

export const Contacts: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterFrequency, setFilterFrequency] = useState<string>('all');

    const contacts = useLiveQuery(() =>
        db.contacts
            .orderBy('firstName')
            .filter(c => !c.isArchived)
            .toArray()
    ) || [];

    // Filter logic
    const filteredContacts = contacts.filter(c => {
        const full = `${c.firstName} ${c.lastName}`.toLowerCase();
        const matchesSearch = full.includes(search.toLowerCase());
        const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
        const matchesFrequency = filterFrequency === 'all' || c.frequencyDays.toString() === filterFrequency;

        return matchesSearch && matchesCategory && matchesFrequency;
    });

    // Valid schedule options
    const frequencyOptions = [
        { val: 'all', label: 'All Schedules' },
        ...FREQUENCIES.map(f => ({ val: f.value.toString(), label: f.label }))
    ];

    // Valid categories
    const categoryOptions = [
        { val: 'all', label: 'All Categories' },
        ...CATEGORIES.map(c => ({ val: c.id, label: c.label }))
    ];

    // Group by First Letter
    const groupedContacts: { [key: string]: Contact[] } = {};
    filteredContacts.forEach(c => {
        const letter = (c.firstName[0] || '?').toUpperCase();
        if (!groupedContacts[letter]) groupedContacts[letter] = [];
        groupedContacts[letter].push(c);
    });

    const sortedLetters = Object.keys(groupedContacts).sort();

    const handleExportCSV = () => {
        sounds.play('click');
        const csv = Papa.unparse(filteredContacts.map(c => ({
            FirstName: c.firstName,
            LastName: c.lastName,
            Phone: c.phoneNumber,
            Category: c.category,
            Frequency: c.frequencyDays,
            Birthday: c.birthday
        })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'contacts_export.csv';
        link.click();
    };

    const handleExportVCF = () => {
        sounds.play('click');
        let vcardString = '';
        filteredContacts.forEach(c => {
            vcardString += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.firstName} ${c.lastName}\nN:${c.lastName};${c.firstName};;;\nTEL;TYPE=CELL:${c.phoneNumber}\nCATEGORIES:${c.category}\nEND:VCARD\n`;
        });
        const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'contacts_export.vcf';
        link.click();
    };

    const [showExportMenu, setShowExportMenu] = useState(false);

    // Helpers for display
    const getFrequencyLabel = (days: number) => {
        const freq = FREQUENCIES.find(f => f.value === days);
        return {
            label: freq?.label ?? 'Unknown',
            color: freq?.colorClass ?? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
        };
    };

    const getDayLabel = (day?: number) => {
        if (day === undefined) return null;
        const dayObj = DAYS_OF_WEEK.find(d => d.value === day);
        return {
            label: dayObj?.label ?? '?',
            color: dayObj?.colorClass ?? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
        };
    };

    const getCategoryStyle = (catId?: string) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return cat?.colorClass ?? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
    };

    const getCategoryBadgeColor = (catId?: string) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return cat?.badgeColor ?? 'bg-gray-400';
    };

    const handleExport = (type: 'csv' | 'vcf') => {
        if (type === 'csv') handleExportCSV();
        else handleExportVCF();
        setShowExportMenu(false);
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-transparent relative">
            <header className="sticky top-0 z-40 glass-panel border-b-0 pb-2">
                <div className="flex items-center justify-between px-4 pt-12 pb-2">
                    <h1 className="text-2xl font-black leading-tight tracking-tight">Contacts</h1>
                    <div className="flex gap-2 relative">
                        {/* Export Button with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center justify-center size-10 rounded-full glass-input hover:bg-white/20 text-gray-900 dark:text-white transition-all active:scale-95 shadow-sm"
                            >
                                <span className="material-symbols-outlined font-bold">download</span>
                            </button>

                            {showExportMenu && (
                                <div className="absolute top-full right-0 mt-2 w-32 glass-panel rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">csv</span> CSV
                                    </button>
                                    <div className="h-px bg-white/10"></div>
                                    <button
                                        onClick={() => handleExport('vcf')}
                                        className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-white/10 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">contact_page</span> VCF
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Back overlay to close menu */}
                        {showExportMenu && (
                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowExportMenu(false)}></div>
                        )}

                        <Link to="/import" className="flex items-center justify-center size-10 rounded-full glass-input hover:bg-white/20 text-gray-900 dark:text-white transition-all active:scale-95 shadow-sm">
                            <span className="material-symbols-outlined font-bold">upload_file</span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="px-4 pb-2 space-y-2">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500">search</span>
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input focus:ring-0 text-sm font-medium transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                        >
                            {categoryOptions.map(o => <option key={o.val} value={o.val} className="text-black dark:text-white bg-white dark:bg-gray-800">{o.label}</option>)}
                        </select>
                        <select
                            value={filterFrequency}
                            onChange={e => setFilterFrequency(e.target.value)}
                            className="px-3 py-1.5 rounded-lg glass-input text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                        >
                            {frequencyOptions.map(o => <option key={o.val} value={o.val} className="text-black dark:text-white bg-white dark:bg-gray-800">{o.label}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-32 px-4">
                {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">person_off</span>
                        <p className="text-gray-500 font-medium">No contacts found</p>
                    </div>
                ) : (
                    <div className="space-y-6 pt-4">
                        {sortedLetters.map(letter => (
                            <div key={letter} className="relative">
                                <h3 className="sticky top-0 glass-panel px-2 py-1 text-xs font-bold text-gray-500 uppercase z-10 w-full mb-2 rounded-lg">
                                    {letter}
                                </h3>
                                <div className="space-y-2">
                                    {groupedContacts[letter].map(contact => {
                                        const freq = getFrequencyLabel(contact.frequencyDays);
                                        const dayInfo = getDayLabel(contact.preferredDayOfWeek);
                                        return (
                                            <div key={contact.id} className="group flex items-center justify-between p-3 rounded-2xl glass-card active:scale-[0.99] transition-all hover:shadow-md">
                                                <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setSelectedContactId(contact.id)}>
                                                    <div className={clsx(
                                                        "flex items-center justify-center rounded-full size-12 font-bold text-lg shrink-0 text-white",
                                                        getCategoryBadgeColor(contact.category)
                                                    )}>
                                                        {contact.firstName[0]}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 gap-1.5">
                                                        <h4 className="font-bold text-base truncate leading-none pt-0.5">{contact.firstName} {contact.lastName}</h4>
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {/* Category Label */}
                                                            <span className={clsx("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded", getCategoryStyle(contact.category))}>
                                                                {CATEGORIES.find(c => c.id === contact.category)?.label || 'Other'}
                                                            </span>
                                                            {/* Frequency Label */}
                                                            <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded", freq.color)}>
                                                                {freq.label}
                                                            </span>
                                                            {/* Day Label */}
                                                            {dayInfo && (
                                                                <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded", dayInfo.color)}>
                                                                    {dayInfo.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            sounds.play('click');
                                                            navigate(`/add-contact/${contact.id}`);
                                                        }}
                                                        className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            sounds.play('pop');
                                                            setSelectedContactId(contact.id);
                                                        }}
                                                        className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Action Button for Add Contact */}
            <Link
                to="/add-contact"
                onClick={() => sounds.play('click')}
                className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center size-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-110 active:scale-95"
            >
                <span className="material-symbols-outlined text-[28px]">add</span>
            </Link>

            {/* Connect Modal for quick detail/action */}
            {selectedContactId && (
                <ConnectModal
                    contactId={selectedContactId}
                    onClose={() => setSelectedContactId(null)}
                />
            )}
        </div>
    );
};
