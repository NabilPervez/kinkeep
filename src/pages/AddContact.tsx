import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { useLiveQuery } from 'dexie-react-hooks';
import { sounds } from '../utils/sounds';
import clsx from 'clsx';
import { CATEGORIES, FREQUENCIES, DAYS_OF_WEEK } from '../constants';

export const AddContact: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Load existing data if editing
    const existingContact = useLiveQuery(
        () => (id ? db.contacts.get(id) : undefined),
        [id]
    );

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        frequency: '14', // Default to 2 weeks
        birthday: '',
        preferredDayOfWeek: '' as string, // "0"-"6" or ""
        category: 'friends' // default
    });

    // Populate form when data loads
    useEffect(() => {
        if (existingContact) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setFormData({
                firstName: existingContact.firstName,
                lastName: existingContact.lastName,
                phone: existingContact.phoneNumber || '',
                frequency: existingContact.frequencyDays.toString(),
                birthday: existingContact.birthday || '',
                preferredDayOfWeek: existingContact.preferredDayOfWeek !== undefined ? existingContact.preferredDayOfWeek.toString() : '',
                category: existingContact.category || 'friends'
            });
        }
    }, [existingContact]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName) return;

        const contactData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phone,
            frequencyDays: parseInt(formData.frequency),
            birthday: formData.birthday || undefined,
            preferredDayOfWeek: formData.preferredDayOfWeek ? parseInt(formData.preferredDayOfWeek) : undefined,
            category: formData.category as any,
            // Preserve existing logic fields if editing
            lastContacted: existingContact ? existingContact.lastContacted : Date.now(),
            isArchived: existingContact ? existingContact.isArchived : false,
            tags: existingContact ? existingContact.tags : [],
        };

        if (id) {
            await db.contacts.update(id, contactData);
        } else {
            await db.contacts.add({
                id: uuidv4(),
                ...contactData,
                lastContacted: Date.now(),
                isArchived: false,
                tags: [],
            });
        }
        sounds.play('success');
        navigate(-1); // Go back
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex-1 flex flex-col gap-6 p-4 pb-24">

            <header className="flex items-center justify-between p-4 sticky top-0 z-50 glass-panel border-b-0">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 flex items-center justify-center rounded-full text-gray-900 dark:text-white hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold">{id ? 'Edit Contact' : 'New Contact'}</h1>
                <div className="size-10"></div> {/* Spacer for removed save button */}
            </header>

            <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
                {/* Photo upload removed per user request */}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1" htmlFor="firstName">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 glass-input text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 px-4 placeholder-gray-400"
                                placeholder="Jane"
                                required
                                type="text"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1" htmlFor="lastName">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 glass-input text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 px-4 placeholder-gray-400"
                                placeholder="Doe"
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1" htmlFor="phone">Phone Number</label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">call</span>
                            </div>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 glass-input text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 pl-11 px-4 placeholder-gray-400"
                                placeholder="(555) 123-4567"
                                type="tel"
                            />
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor="category">Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                    className={clsx(
                                        "py-2.5 rounded-xl text-sm font-bold capitalize transition-all border",
                                        formData.category === cat.id
                                            ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow"
                                            : "glass-input border-gray-200 dark:border-white/10 text-gray-500 hover:bg-white/10"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="birthday">Birthday</label>
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-center">Optional</span>
                        </div>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">cake</span>
                            </div>
                            <input
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 glass-input text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 pl-11 px-4 [color-scheme:light] dark:[color-scheme:dark]"
                                type="date"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Check-in Frequency
                        </label>
                        <select
                            name="frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            className="w-full h-12 rounded-xl border border-gray-200 dark:border-white/10 glass-input px-4 font-medium appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        >
                            {FREQUENCIES.map(f => (
                                <option key={f.value} value={f.value} className="text-black dark:text-white bg-white dark:bg-gray-800">{f.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preferred Day */}
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Preferred Day (Optional)
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => {
                                        sounds.play('click');
                                        setFormData(prev => ({
                                            ...prev,
                                            preferredDayOfWeek: prev.preferredDayOfWeek === day.value.toString() ? '' : day.value.toString()
                                        }));
                                    }}
                                    className={clsx(
                                        "h-10 rounded-lg text-xs font-bold transition-all border",
                                        formData.preferredDayOfWeek === day.value.toString()
                                            ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow-md"
                                            : "glass-input border-gray-200 dark:border-white/10 text-gray-500 hover:bg-white/10"
                                    )}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                            We'll try to schedule follow-ups on this day.
                        </p>
                    </div>

                    <div className="fixed bottom-0 right-0 left-0 md:left-64 z-40 glass-panel border-t-0 p-4 pb-safe flex flex-col gap-3">
                        <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-black text-base font-bold shadow-[0_0_20px_rgba(242,87,87,0.3)] transition-all transform active:scale-[0.98]" type="submit">
                            <span className="material-symbols-outlined font-bold">check</span>
                            Save Contact
                        </button>

                        {id && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (confirm('Are you sure you want to delete this contact?')) {
                                        await db.contacts.delete(id);
                                        sounds.play('delete');
                                        navigate('/');
                                    }
                                }}
                                className="w-full h-10 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm transition-colors"
                            >
                                Delete Contact
                            </button>
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
};
