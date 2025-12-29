import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import clsx from 'clsx';
import { getDaysUntilBirthday } from '../utils/sorting';

interface ConnectModalProps {
    contactId: string | null;
    onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ contactId, onClose }) => {
    // We re-fetch to ensure freshness, but we must manually re-calc computed fields if needed
    const contactRaw = useLiveQuery(
        () => (contactId ? db.contacts.get(contactId) : undefined),
        [contactId]
    );

    // Compute derived state
    const isBirthdayUpcoming = contactRaw ? getDaysUntilBirthday(contactRaw.birthday) <= 7 : false;
    const contact = contactRaw ? { ...contactRaw, isBirthdayUpcoming } : undefined;

    const templates = useLiveQuery(() => db.templates.toArray()) || [];

    // Sort templates logic: Birthday first if birthday.
    const sortedTemplates = [...templates].sort((a, b) => {
        if (!contact) return 0;
        const isBday = contact.isBirthdayUpcoming;
        if (isBday) {
            if (a.category === 'birthday' && b.category !== 'birthday') return -1;
            if (a.category !== 'birthday' && b.category === 'birthday') return 1;
        } else {
            // De-prioritize birthday
            if (a.category === 'birthday' && b.category !== 'birthday') return 1;
            if (a.category !== 'birthday' && b.category === 'birthday') return -1;
        }
        return 0; // Default sort or add 'casual' priority
    });

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    if (!contactId || !contact) return null;

    const handleSend = () => {
        const template = templates.find(t => t.id === selectedTemplateId);
        const text = template ? template.text.replace('{NAME}', contact.firstName) : '';

        // Construct URI
        // Detect OS for '?' vs '&' separator? 
        // Modern iOS (15+) supports '?' well. Android usually '?'
        // Standard: sms:12345678?body=Hello

        const uri = `sms:${contact.phoneNumber}?body=${encodeURIComponent(text)}`;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        window.location.href = uri;

        // Log interaction? 
        // Ideally we ask: "Did you send it?" or auto-log.
        // PRD says: "Tap Send (Opens native app)".
        // Once they come back, we might want to log. But we can't detect return reliably.
        // Let's Log "marked as done" automatically or ask?
        // PRD: "Manually Logging... Or they called you? Tap Mark as Done".
        // Use case 3-tap: Tap Reminder -> Tap Template -> Tap Send.
        // Maybe we optimistically update lastContacted? 
        // Let's Just open sms for now. The user can mark done on dashboard if they want, 
        // OR better: Update lastContacted immediately when clicking "Send".
        // Let's do that for friction reduction.

        // eslint-disable-next-line react-hooks/rules-of-hooks
        db.contacts.update(contact.id, { lastContacted: Date.now() });
        onClose();
    };

    const handleSnooze = () => {
        // Snooze for 3 days
        // eslint-disable-next-line react-hooks/rules-of-hooks
        db.contacts.update(contact.id, { snoozedUntil: Date.now() + (3 * 24 * 60 * 60 * 1000) });
        onClose();
    };

    const handleMarkDone = () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        db.contacts.update(contact.id, { lastContacted: Date.now() });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-0" onClick={onClose}>
            <div
                className="bg-surface-light dark:bg-surface-dark w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-10 fade-in-20 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0 bg-gray-200" style={{ backgroundImage: contact.avatarImage ? `url(${contact.avatarImage})` : undefined }}>
                        {!contact.avatarImage && <div className="flex items-center justify-center w-full h-full text-gray-500 font-bold">{contact.firstName[0]}</div>}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">{contact.firstName} {contact.lastName}</h3>
                        <p className="text-sm text-gray-500">{contact.isBirthdayUpcoming ? '🎂 Birthday Soon' : 'Catch up time'}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Templates List */}
                <h4 className="text-xs uppercase font-bold text-gray-400 mb-2">Select Message</h4>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar mb-4">
                    {sortedTemplates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTemplateId(t.id)}
                            className={clsx(
                                "text-left p-3 rounded-xl border transition-all text-sm leading-relaxed",
                                selectedTemplateId === t.id
                                    ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary"
                                    : "bg-background-light dark:bg-background-dark border-transparent hover:border-gray-200 dark:hover:border-white/10"
                            )}
                        >
                            {t.text.replace('{NAME}', contact.firstName)}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <button onClick={handleSnooze} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">snooze</span>
                        Snooze
                    </button>
                    {selectedTemplateId ? (
                        <button onClick={handleSend} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]">
                            Send SMS
                            <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    ) : (
                        <button onClick={handleMarkDone} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">check</span>
                            Mark Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
