import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link, useNavigate } from 'react-router-dom';
import { ConnectModal } from '../components/ConnectModal'; // Re-use this for quick access
import type { Contact } from '../types';
import { sounds } from '../utils/sounds';
import Papa from 'papaparse';
import clsx from 'clsx';

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
        { val: '1', label: 'Daily' },
        { val: '3', label: 'Every 3 Days' },
        { val: '7', label: 'Weekly' },
        { val: '14', label: 'Bi-Weekly' },
        { val: '30', label: 'Monthly' },
        { val: '90', label: 'Quarterly' },
        { val: '365', label: 'Yearly' },
    ];

    // Valid categories
    const categoryOptions = [
        { val: 'all', label: 'All Categories' },
        { val: 'islamic', label: 'Islamic' },
        { val: 'friends', label: 'Friends' },
        { val: 'colleagues', label: 'Colleagues' },
        { val: 'network', label: 'Network' },
        { val: 'other', label: 'Other' },
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
        if (days === 1) return { label: 'Daily', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' };
        if (days === 3) return { label: 'Every 3d', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' };
        if (days === 7) return { label: 'Weekly', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' };
        if (days === 14) return { label: 'Bi-Weekly', color: 'bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300' };
        if (days === 30) return { label: 'Monthly', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' };
        if (days === 90) return { label: 'Quarterly', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300' };
        return { label: 'Yearly', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' };
    };

    const getDayLabel = (day?: number) => {
        if (day === undefined) return null;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return { label: days[day], color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' };
    };

    const getCategoryStyle = (cat?: string) => {
        switch (cat) {
            case 'islamic': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
            case 'friends': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
            case 'colleagues': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300';
            case 'network': return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
        }
    };

    const handleExport = (type: 'csv' | 'vcf') => {
        if (type === 'csv') handleExportCSV();
        else handleExportVCF();
        setShowExportMenu(false);
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 pb-2">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <h1 className="text-2xl font-black leading-tight tracking-tight">Contacts</h1>
                    <div className="flex gap-2 relative">
                        {/* Export Button with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center justify-center size-10 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all active:scale-95 shadow-sm"
                            >
                                <span className="material-symbols-outlined font-bold">download</span>
                            </button>

                            {showExportMenu && (
                                <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-[#1E2130] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">csv</span> CSV
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-white/5"></div>
                                    <button
                                        onClick={() => handleExport('vcf')}
                                        className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
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

                        <Link to="/import" className="flex items-center justify-center size-10 rounded-full bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all active:scale-95 shadow-sm">
                            <span className="material-symbols-outlined font-bold">upload_file</span>
                        </Link>
                        <Link to="/add-contact" className="flex items-center justify-center size-10 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all active:scale-95">
                            <span className="material-symbols-outlined font-bold">add</span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="px-4 pb-2 space-y-2">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light dark:bg-surface-dark border-transparent focus:border-primary focus:ring-0 text-sm font-medium transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                        >
                            {categoryOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                        </select>
                        <select
                            value={filterFrequency}
                            onChange={e => setFilterFrequency(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap"
                        >
                            {frequencyOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
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
                                <h3 className="sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-2 py-1 text-xs font-bold text-gray-500 uppercase z-10 w-full mb-2">
                                    {letter}
                                </h3>
                                <div className="space-y-2">
                                    {groupedContacts[letter].map(contact => {
                                        const freq = getFrequencyLabel(contact.frequencyDays);
                                        const dayInfo = getDayLabel(contact.preferredDayOfWeek);
                                        return (
                                            <div key={contact.id} className="group flex items-center justify-between p-3 rounded-2xl bg-surface-light dark:bg-surface-dark active:scale-[0.99] transition-all hover:shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                                                <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setSelectedContactId(contact.id)}>
                                                    <div className={clsx(
                                                        "flex items-center justify-center rounded-full size-12 font-bold text-lg shrink-0 text-white",
                                                        contact.category === 'islamic' ? "bg-emerald-500" :
                                                            contact.category === 'friends' ? "bg-blue-500" :
                                                                contact.category === 'colleagues' ? "bg-purple-500" :
                                                                    "bg-gray-400"
                                                    )}>
                                                        {contact.firstName[0]}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 gap-1.5">
                                                        <h4 className="font-bold text-base truncate leading-none pt-0.5">{contact.firstName} {contact.lastName}</h4>
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {/* Category Label */}
                                                            <span className={clsx("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded", getCategoryStyle(contact.category))}>
                                                                {contact.category || 'Other'}
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
