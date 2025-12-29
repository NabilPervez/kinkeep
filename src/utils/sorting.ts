import { addDays, differenceInDays, startOfDay, parse, getYear, setYear, isBefore } from 'date-fns';
import type { Contact } from '../types';

export function getDaysUntilBirthday(birthdayStr?: string): number {
    if (!birthdayStr) return 999;

    const today = startOfDay(new Date());
    let date: Date;

    // Handle MM-DD or YYYY-MM-DD
    if (birthdayStr.length === 5) {
        date = parse(birthdayStr, 'MM-dd', new Date());
        date = setYear(date, getYear(today));
    } else {
        date = parse(birthdayStr, 'yyyy-MM-dd', new Date());
        date = setYear(date, getYear(today));
    }

    if (isBefore(date, today)) {
        date = addDays(date, 365); // Next year
    }

    return differenceInDays(date, today);
}

export function sortContacts(contacts: Contact[]): Contact[] {
    const today = startOfDay(new Date());

    return contacts.map(c => {
        let score = 0;
        c.isBirthdayUpcoming = false;

        // 1. Check Snooze
        if (c.snoozedUntil && c.snoozedUntil > today.getTime()) {
            return { ...c, score: -1000 };
        }

        // 2. Birthday Logic
        const daysToBirthday = getDaysUntilBirthday(c.birthday);

        // Priority 1: Birthday is soon (within 7 days)
        if (daysToBirthday >= 0 && daysToBirthday <= 7) {
            score = 1000 - daysToBirthday; // Highest score (993-1000)
            c.isBirthdayUpcoming = true;
        }
        // Priority 2: Overdue for regular chat
        else {
            const lastContact = new Date(c.lastContacted);
            const nextInteraction = addDays(lastContact, c.frequencyDays);
            const daysOverdue = differenceInDays(today, nextInteraction);
            score = daysOverdue; // Higher number = More overdue. negative = not due yet.
        }

        return { ...c, score };
    }).sort((a, b) => (b.score || 0) - (a.score || 0)); // Descending
}
