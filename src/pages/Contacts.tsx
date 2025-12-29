import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link, useNavigate } from 'react-router-dom';
import { ConnectModal } from '../components/ConnectModal'; // Re-use this for quick access
import type { Contact } from '../types';

export const Contacts: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

    const contacts = useLiveQuery(() =>
        db.contacts
            .orderBy('firstName')
            .filter(c => !c.isArchived)
            .toArray()
    ) || [];

    // Filter by search
    const filteredContacts = contacts.filter(c => {
        const full = `${c.firstName} ${c.lastName}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    // Group by First Letter
    const groupedContacts: { [key: string]: Contact[] } = {};
    filteredContacts.forEach(c => {
        const letter = (c.firstName[0] || '?').toUpperCase();
        if (!groupedContacts[letter]) groupedContacts[letter] = [];
        groupedContacts[letter].push(c);
    });

    const sortedLetters = Object.keys(groupedContacts).sort();

    return (
        <div className="flex-1 flex flex-col h-screen bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 pb-2">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <h1 className="text-2xl font-black leading-tight tracking-tight">Contacts</h1>
                    <Link to="/add-contact" className="flex items-center justify-center size-10 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined font-bold">add</span>
                    </Link>
                </div>
                <div className="px-4 pb-2">
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
                                    {groupedContacts[letter].map(contact => (
                                        <div key={contact.id} className="group flex items-center justify-between p-3 rounded-2xl bg-surface-light dark:bg-surface-dark active:scale-[0.99] transition-all hover:shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                                            <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setSelectedContactId(contact.id)}>
                                                <div className="flex items-center justify-center rounded-full size-12 font-bold text-lg bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-300 shrink-0">
                                                    {contact.firstName[0]}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <h4 className="font-bold text-base truncate pr-2">{contact.firstName} {contact.lastName}</h4>
                                                    <p className="text-xs text-gray-500 truncate">{contact.phoneNumber || 'No phone'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/add-contact/${contact.id}`); }}
                                                    className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedContactId(contact.id); }}
                                                    className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
