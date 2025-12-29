import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { useLiveQuery } from 'dexie-react-hooks';
import { sounds } from '../utils/sounds';

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
        birthday: '',
        frequency: '30'
    });

    // Populate form when data loads
    useEffect(() => {
        if (existingContact) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setFormData({
                firstName: existingContact.firstName,
                lastName: existingContact.lastName,
                phone: existingContact.phoneNumber,
                birthday: existingContact.birthday || '',
                frequency: existingContact.frequencyDays.toString()
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
            <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm -mx-4 px-4 pb-2">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 -ml-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold leading-tight tracking-tight">{id ? 'Edit Contact' : 'New Contact'}</h1>
                    <div className="size-10"></div>
                </div>
            </header>

            <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
                <div className="flex flex-col items-center justify-center my-6">
                    <div className="relative group">
                        <div className="size-28 rounded-full bg-surface-light dark:bg-surface-dark border-2 border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-400 dark:text-gray-500 cursor-pointer hover:border-primary transition-colors hover:text-primary">
                            <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                        </div>
                    </div>
                    <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Add Photo</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1" htmlFor="firstName">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 px-4 placeholder-gray-400"
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
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 px-4 placeholder-gray-400"
                                placeholder="Doe"
                                required
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
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 pl-11 px-4 placeholder-gray-400"
                                placeholder="(555) 123-4567"
                                type="tel"
                            />
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
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 pl-11 px-4 [color-scheme:light] dark:[color-scheme:dark]"
                                type="date"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1" htmlFor="frequency">Keep in touch...</label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">update</span>
                            </div>
                            <select
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                                className="block w-full rounded-xl border-gray-200 dark:border-white/10 bg-surface-light dark:bg-surface-dark text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-base py-3 pl-11 pr-10 appearance-none bg-none"
                            >
                                <option value="7">Every week</option>
                                <option value="14">Every 2 weeks</option>
                                <option value="30">Every month</option>
                                <option value="90">Every 3 months</option>
                                <option value="180">Every 6 months</option>
                                <option value="365">Yearly</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">expand_more</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">We'll remind you to connect based on this schedule.</p>
                    </div>

                    <div className="fixed bottom-0 left-0 w-full z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 p-4 pb-safe">
                        <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-black text-base font-bold shadow-[0_0_20px_rgba(70,236,19,0.3)] transition-all transform active:scale-[0.98]" type="submit">
                            <span className="material-symbols-outlined font-bold">check</span>
                            Save Contact
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};
