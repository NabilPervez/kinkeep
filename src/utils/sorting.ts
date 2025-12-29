import { addDays, differenceInDays, startOfDay, parse, getYear, setYear, isBefore } from 'date-fns';
import type { Contact } from '../types';
import { getNextDueDate } from './dateUtils';

// Helper for birthday calculation
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
        date = addDays(date, 365);
    }

    return differenceInDays(date, today);
}

export function sortContacts(contacts: Contact[]): Contact[] {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const now = Date.now();
    // ^ This is a utility function, not a hook, but `Date.now()` is effectful. Linter might complain if it thinks it's a hook component. Ideally pass 'now' as arg.
    // I'll just use Date.now() without suppression if outside component.

    return contacts.map(c => {
        let score = 0;
        c.isBirthdayUpcoming = false;

        // 1. Check Snooze
        if (c.snoozedUntil && c.snoozedUntil > now) {
            return { ...c, score: -100000 };
        }

        // 2. Birthday Logic
        const daysToBirthday = getDaysUntilBirthday(c.birthday);
        if (daysToBirthday >= 0 && daysToBirthday <= 14) { // Increased to 14 days for better awareness
            c.isBirthdayUpcoming = true;
            score = 20000 - daysToBirthday; // 20000, 19999... Top priority.
        } else {
            // 3. Due Date Logic (Smart Schedule)
            const dueDate = getNextDueDate(c);
            // Score = How many milliseconds past due?
            // Positive = Overdue. Negative = Upcoming.
            // We want High -> Low.
            const diff = now - dueDate;
            score = diff;
        }

        return { ...c, score };
    }).sort((a, b) => (b.score || 0) - (a.score || 0)); // Descending: Most overdue first
}
