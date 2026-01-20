import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sounds } from '../utils/sounds';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { DAYS_OF_WEEK, CATEGORIES } from '../constants';
import type { Contact } from '../types';

export const Planning: React.FC = () => {
    const navigate = useNavigate();
    const allContacts = useLiveQuery(() => db.contacts.toArray()) || [];

    // Filter contacts that might need planning (e.g., default frequency or no preferred day)
    // For now, let's just cycle through everyone to be safe, or maybe just "other" category text
    // The user said: "the app will select a person on your list of contacts"
    // Let's plan for everyone, or maybe allow skipping.

    // State to track progress
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [category, setCategory] = useState<string | null>(null);

    const currentContact = allContacts[currentIndex];

    // Reset step when contact changes
    useEffect(() => {
        setSelectedFrequency(currentContact?.frequencyDays || null); // Pre-fill if exists
        setSelectedDay(currentContact?.preferredDayOfWeek ?? null);
        setCategory(currentContact?.category || null);
    }, [currentContact]);

    const handleSave = async () => {
        if (!currentContact) return;

        // Start update object
        const updates: Partial<Contact> = {};

        if (selectedFrequency !== null) updates.frequencyDays = selectedFrequency;
        if (selectedDay !== null) updates.preferredDayOfWeek = selectedDay;
        if (category) updates.category = category as Contact['category'];

        if (Object.keys(updates).length > 0) {
            await db.contacts.update(currentContact.id, updates);
            sounds.play('success');
        } else {
            sounds.play('pop');
        }

        nextContact();
    };

    const nextContact = () => {
        // Just move to next index. If it goes out of bounds, 
        // currentContact becomes undefined and the 'All Done' screen renders.
        setCurrentIndex(prev => prev + 1);
    };

    if (!allContacts.length) return null;

    if (!currentContact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-4">All Done!</h2>
                <p className="opacity-60 mb-8">You've planned your outreach for all contacts.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-full bg-transparent relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[100px] rounded-full mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-12 pb-2">
                <button onClick={() => navigate('/')} className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider backdrop-blur-md px-2 py-1 rounded-full bg-black/10">
                    {currentIndex + 1} / {allContacts.length}
                </div>
                <div className="size-10" />
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 pt-4">

                {/* Contact Card */}
                <div className="glass-card w-full p-8 rounded-[40px] flex flex-col items-center text-center mb-8 animate-in zoom-in-95 duration-500">
                    <div className="size-32 rounded-full p-1 bg-gradient-to-br from-white/20 to-white/5 mb-6 shadow-2xl">
                        <div className="size-full rounded-full overflow-hidden bg-zinc-800">
                            {currentContact.avatarImage ? (
                                <img src={currentContact.avatarImage} alt={currentContact.firstName} className="size-full object-cover" />
                            ) : (
                                <div className="size-full flex items-center justify-center text-4xl font-bold text-white/50">
                                    {currentContact.firstName[0]}
                                </div>
                            )}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-1">
                        {currentContact.firstName}
                    </h2>
                    <p className="text-white/50 font-medium text-lg">{currentContact.lastName}</p>
                </div>

                {/* Interaction Area (Single Screen) */}
                <div className="w-full space-y-6 pb-20">
                    {/* 1. Category */}
                    <div className="space-y-2">
                        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest pl-1">Category</h3>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setCategory(cat.id);
                                        sounds.play('click');
                                    }}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                        category === cat.id
                                            ? "bg-white text-black border-transparent shadow-lg scale-105"
                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Frequency */}
                    <div className="space-y-2">
                        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest pl-1">Frequency</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Daily', value: 1 },
                                { label: 'Weekly', value: 7 },
                                { label: 'Bi-Weekly', value: 14 },
                                { label: 'Monthly', value: 30 },
                                { label: 'Quarterly', value: 90 },
                                { label: 'Yearly', value: 365 }
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        sounds.play('click');
                                        setSelectedFrequency(opt.value);
                                    }}
                                    className={clsx(
                                        "h-10 rounded-xl text-xs font-bold transition-all border",
                                        selectedFrequency === opt.value
                                            ? "bg-white text-black border-transparent shadow-lg scale-105"
                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Preferred Day */}
                    <div className="space-y-2">
                        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest pl-1">Preferred Day</h3>
                        <div className="grid grid-cols-7 gap-1">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day.value}
                                    onClick={() => {
                                        sounds.play('click');
                                        setSelectedDay(day.value);
                                    }}
                                    className={clsx(
                                        "h-10 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center",
                                        selectedDay === day.value
                                            ? "bg-primary text-white border-transparent shadow-lg scale-110 z-10"
                                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                    )}
                                >
                                    {day.label[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={selectedFrequency === null || selectedDay === null || !category}
                        className="w-full h-14 rounded-2xl bg-white text-black font-black text-lg shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none mt-4"
                    >
                        Save & Next
                    </button>
                </div>

            </main>
        </div>
    );
};
