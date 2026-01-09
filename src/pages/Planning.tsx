import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { sounds } from '../utils/sounds';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { DAYS_OF_WEEK } from '../constants';
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
    const [currentStep, setCurrentStep] = useState<'frequency' | 'day'>('frequency');
    const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const currentContact = allContacts[currentIndex];

    // Reset step when contact changes
    useEffect(() => {
        setCurrentStep('frequency');
        setSelectedFrequency(null);
        setSelectedDay(null);
    }, [currentIndex]);

    const handleSave = async () => {
        if (!currentContact) return;

        // Start update object
        const updates: Partial<Contact> = {};

        if (selectedFrequency !== null) updates.frequencyDays = selectedFrequency;
        if (selectedDay !== null) updates.preferredDayOfWeek = selectedDay;

        if (Object.keys(updates).length > 0) {
            await db.contacts.update(currentContact.id, updates);
            sounds.play('success');
        } else {
            sounds.play('pop');
        }

        nextContact();
    };

    const nextContact = () => {
        if (currentIndex < allContacts.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finished
            navigate('/');
        }
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
        <div className="flex-1 flex flex-col h-screen bg-transparent p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 blur-[100px] rounded-full mix-blend-screen animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <header className="relative z-10 flex items-center justify-between p-4">
                <button onClick={() => navigate('/')} className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    {currentIndex + 1} / {allContacts.length}
                </div>
                <div className="size-10" />
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">

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

                {/* Interaction Area */}
                <div className="w-full space-y-6">
                    {currentStep === 'frequency' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="text-center text-white/80 font-bold text-lg">How often do you want to reach out?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Weekly', value: 7 },
                                    { label: 'Bi-Weekly', value: 14 },
                                    { label: 'Monthly', value: 30 },
                                    { label: 'Quarterly', value: 90 }
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            sounds.play('click');
                                            setSelectedFrequency(opt.value);
                                            setCurrentStep('day');
                                        }}
                                        className="h-16 rounded-2xl bg-white/5 hover:bg-white/20 border border-white/10 text-white font-bold transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 'day' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <h3 className="text-center text-white/80 font-bold text-lg">Which day works best?</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day.value}
                                        onClick={() => {
                                            sounds.play('click');
                                            setSelectedDay(day.value);
                                        }}
                                        className={clsx(
                                            "h-12 rounded-xl text-sm font-bold transition-all border",
                                            selectedDay === day.value
                                                ? "bg-primary text-white border-transparent shadow-[0_0_15px_rgba(79,124,172,0.5)]"
                                                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                        )}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={selectedDay === null}
                                className="w-full h-14 mt-4 rounded-2xl bg-white text-black font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Confirm & Next
                            </button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};
