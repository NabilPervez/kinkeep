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

    const sanitizePhone = (phone: string) => {
        // Remove all non-digits. If it starts with +, keep it? 
        // WhatsApp needs country code. If user didn't enter it, we might have issues. 
        // We assume user stores numbers in international format or local compatible.
        return phone.replace(/[^0-9+]/g, '');
    };

    const handleSendVia = (app: 'sms' | 'whatsapp' | 'telegram') => {
        const template = templates.find(t => t.id === selectedTemplateId);
        const text = template ? template.text.replace('{NAME}', contact.firstName) : '';
        const cleanPhone = sanitizePhone(contact.phoneNumber);

        let uri = '';
        switch (app) {
            case 'whatsapp':
                // Check if number has country code? If not, WA might complain.
                // We pass it raw sans symbols.
                uri = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
                break;
            case 'telegram':
                // Telegram handling. t.me/+number
                // Telegram doesn't officially support pre-filling text via web link effortlessly for new chats.
                // We will copy text to clipboard for them.
                navigator.clipboard.writeText(text);
                uri = `https://t.me/${cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone}`;
                alert('Message text copied to clipboard! (Telegram does not support auto-fill)');
                break;
            case 'sms':
            default:
                // iOS uses & for separator in strict interpretation but ? is widely supported. 
                // Let's use ? for broad compatibility.
                uri = `sms:${contact.phoneNumber}?body=${encodeURIComponent(text)}`;
                break;
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
        if (app !== 'telegram') {
            // For non-telegram, we rely on the link opening. 
            // Ideally we might copy for WA too if it fails? No, WA link is robust.
        }

        window.location.assign(uri);

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
        <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100 dark:border-white/5 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary-dark dark:text-primary font-bold text-lg">
                        {contact.firstName[0]}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight">{contact.firstName} {contact.lastName}</h2>
                        {isBirthdayUpcoming && <p className="text-xs text-purple-600 font-bold">🎂 Birthday Soon</p>}
                        {!isBirthdayUpcoming && contact.snoozedUntil && <p className="text-xs text-orange-500 font-bold">Snoozed</p>}
                    </div>
                </div>
                <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Content - Scrollable Templates */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select a Message</p>
                {sortedTemplates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => {
                            setSelectedTemplateId(t.id);
                            // sounds.play('click'); // Optional: feedback on selection
                        }}
                        className={clsx(
                            "w-full text-left p-4 rounded-xl border transition-all active:scale-[0.99]",
                            selectedTemplateId === t.id
                                ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(70,236,19,0.15)]"
                                : "bg-surface-light dark:bg-surface-dark border-transparent hover:border-gray-200 dark:hover:border-white/10"
                        )}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className={clsx(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                t.category === 'birthday' && "bg-purple-100 text-purple-800",
                                t.category === 'casual' && "bg-blue-100 text-blue-800",
                                t.category === 'religious' && "bg-green-100 text-green-800",
                                t.category === 'formal' && "bg-gray-100 text-gray-800"
                            )}>
                                {t.category}
                            </span>
                            {selectedTemplateId === t.id && (
                                <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                            )}
                        </div>
                        <p className={clsx("text-sm leading-relaxed", selectedTemplateId === t.id ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-300")}>
                            {t.text.replace('{NAME}', contact.firstName)}
                        </p>
                    </button>
                ))}
            </div>

            {/* Bottom Actions - Fixed */}
            <div className="p-4 pb-safe bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-100 dark:border-white/5 space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                {/* Preview Interaction */}
                {selectedTemplateId && (
                    <div className="text-center mb-2">
                        <span className="text-xs text-gray-400">Send via</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleSnooze} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">snooze</span>
                        Snooze
                    </button>
                    {selectedTemplateId ? (
                        <div className="flex gap-2 min-w-0">
                            <button onClick={() => handleSendVia('sms')} className="flex-1 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all font-bold group shadow-lg" title="SMS">
                                <span className="material-symbols-outlined text-[20px]">sms</span>
                            </button>
                            <button onClick={() => handleSendVia('whatsapp')} className="flex-1 flex items-center justify-center rounded-xl bg-[#25D366] text-white hover:opacity-90 transition-all font-bold group shadow-lg" title="WhatsApp">
                                <span className="material-symbols-outlined text-[20px]">chat</span>
                            </button>
                            <button onClick={() => handleSendVia('telegram')} className="flex-1 flex items-center justify-center rounded-xl bg-[#0088cc] text-white hover:opacity-90 transition-all font-bold group shadow-lg" title="Telegram">
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleMarkDone} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold hover:bg-green-200 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">check</span>
                            Mark Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
