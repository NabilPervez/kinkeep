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
    const [showEmailOptions, setShowEmailOptions] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [templateFilter, setTemplateFilter] = useState<any>('all');

    if (!contactId || !contact) return null;

    const filteredTemplates = sortedTemplates.filter(t => templateFilter === 'all' || t.category === templateFilter);

    const sanitizePhone = (phone: string) => {
        // Remove all non-digits. If it starts with +, keep it? 
        // WhatsApp needs country code. If user didn't enter it, we might have issues. 
        // We assume user stores numbers in international format or local compatible.
        return phone.replace(/[^0-9+]/g, '');
    };

    //... (omitting unmodified sanitizePhone function content for brevity if possible, or include it) 
    // Actually, I should use StartLine/EndLine to target the "Select a Message" label area to insert buttons.

    // Let's restructure. I will update the state definition first, then the buttons.

    /* Splitting into chunks because of size */
    // Remove all non-digits. If it starts with +, keep it? 
    // WhatsApp needs country code. If user didn't enter it, we might have issues. 
    // We assume user stores numbers in international format or local compatible.
    return phone.replace(/[^0-9+]/g, '');
};

const handleSendVia = (app: 'sms' | 'whatsapp' | 'telegram' | 'email', provider: 'default' | 'gmail' | 'yahoo' = 'default') => {
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
        case 'email':
            // Email handling
            // eslint-disable-next-line no-case-declarations
            const subject = "Catching up";
            if (provider === 'gmail') {
                uri = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email || '')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
            } else if (provider === 'yahoo') {
                uri = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(contact.email || '')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
            } else {
                uri = `mailto:${contact.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
            }
            setShowEmailOptions(false);
            break;
        case 'sms':
        default:
            // iOS uses & for separator in strict interpretation but ? is widely supported. 
            // Let's use ? for broad compatibility.
            uri = `sms:${contact.phoneNumber}?body=${encodeURIComponent(text)}`;
            break;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (app !== 'telegram' && app !== 'email') {
        // For non-telegram, we rely on the link opening. 
    }

    if (uri) window.location.assign(uri);

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
    <div className="fixed inset-0 z-[1000] bg-background-light dark:bg-background-dark flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 shadow-sm dark:shadow-white/5">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-xl shadow-lg shadow-primary/30">
                    {contact.firstName[0]}
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight dark:text-white leading-none mb-1">{contact.firstName} {contact.lastName}</h2>
                    <div className="flex gap-2">
                        {isBirthdayUpcoming && <span className="text-[10px] font-bold bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded-full">🎂 Birthday Soon</span>}
                        {!isBirthdayUpcoming && contact.snoozedUntil && <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full">Snoozed</span>}
                    </div>
                </div>
            </div>
            <button
                onClick={onClose}
                className="size-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        {/* Content - Scrollable Templates */}
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-48 space-y-3 no-scrollbar content-scroll-mask">
            <div className="flex items-center justify-between mb-4 mt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Select a Message</p>
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 max-w-[200px] sm:max-w-none">
                    {['all', 'casual', 'formal', 'religious', 'birthday'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setTemplateFilter(cat)}
                            className={clsx(
                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap",
                                templateFilter === cat
                                    ? "bg-primary text-white border-primary"
                                    : "bg-transparent border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-primary/50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredTemplates.map(t => (
                <button
                    key={t.id}
                    onClick={() => {
                        setSelectedTemplateId(t.id);
                    }}
                    className={clsx(
                        "w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                        selectedTemplateId === t.id
                            ? "border-primary/50 relative z-10"
                            : "bg-white dark:bg-[#1E2130] border-transparent shadow-sm dark:shadow-neo-dark hover:scale-[1.01]"
                    )}
                >
                    {selectedTemplateId === t.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 z-0" />
                    )}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className={clsx(
                                "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md",
                                t.category === 'birthday' && "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300",
                                t.category === 'casual' && "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
                                t.category === 'religious' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                                t.category === 'formal' && "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300"
                            )}>
                                {t.category}
                            </span>
                            {selectedTemplateId === t.id && (
                                <span className="material-symbols-outlined text-primary text-xl animate-in zoom-in spin-in-180 duration-300">check_circle</span>
                            )}
                        </div>
                        <p className={clsx("text-base leading-relaxed", selectedTemplateId === t.id ? "text-gray-900 dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400 font-medium")}>
                            {t.text.replace('{NAME}', contact.firstName)}
                        </p>
                    </div>
                </button>
            ))}

            {filteredTemplates.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-10">No templates found for this category.</p>
            )}
        </div>

        {/* Bottom Actions - Lifted Higher */}
        <div className="fixed bottom-0 left-0 right-0 p-6 pb-20 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark/95 dark:to-transparent z-50">
            {/* Preview Interaction */}
            {selectedTemplateId && (
                <div className="text-center mb-3 animate-in slide-in-from-bottom-2 fade-in">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Send via</span>
                </div>
            )}

            <div className="grid grid-cols-[auto_1fr] gap-4 max-w-md mx-auto">
                <button onClick={handleSnooze} className="size-[58px] flex items-center justify-center rounded-2xl bg-white dark:bg-[#252836] text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm dark:shadow-neo-dark active:scale-95" title="Snooze">
                    <span className="material-symbols-outlined text-[28px]">snooze</span>
                </button>
                {selectedTemplateId ? (
                    <div className="flex gap-2 min-w-0">
                        <button onClick={() => handleSendVia('sms')} className="flex-1 flex items-center justify-center rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-all font-bold group shadow-lg active:scale-95" title="SMS">
                            <span className="material-symbols-outlined text-[24px]">sms</span>
                        </button>
                        <button onClick={() => handleSendVia('whatsapp')} className="flex-1 flex items-center justify-center rounded-2xl bg-[#25D366] text-white hover:scale-105 transition-all font-bold group shadow-lg active:scale-95" title="WhatsApp">
                            <span className="material-symbols-outlined text-[24px]">chat</span>
                        </button>
                        <button onClick={() => setShowEmailOptions(true)} className="flex-1 flex items-center justify-center rounded-2xl bg-blue-500 text-white hover:scale-105 transition-all font-bold group shadow-lg active:scale-95" title="Email">
                            <span className="material-symbols-outlined text-[24px]">mail</span>
                        </button>
                    </div>
                ) : (
                    <button onClick={handleMarkDone} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 active:scale-95">
                        <span className="material-symbols-outlined text-[22px]">check</span>
                        Mark Done
                    </button>
                )}
            </div>

            {/* Email Options Modal */}
            {showEmailOptions && (
                <div className="absolute bottom-24 left-6 right-6 p-4 bg-white dark:bg-[#2C2F40] rounded-2xl shadow-xl animate-in slide-in-from-bottom-5 fade-in z-50 border border-gray-100 dark:border-white/5">
                    <h3 className="text-center font-bold mb-3 dark:text-white">Choose Email App</h3>
                    <div className="space-y-2">
                        <button onClick={() => handleSendVia('email', 'default')} className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-bold text-sm">Default App</button>
                        <button onClick={() => handleSendVia('email', 'gmail')} className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-bold text-sm text-red-500">Gmail</button>
                        <button onClick={() => handleSendVia('email', 'yahoo')} className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-bold text-sm text-purple-500">Yahoo</button>
                        <button onClick={() => setShowEmailOptions(false)} className="w-full py-2 text-xs text-gray-400 font-medium">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};
