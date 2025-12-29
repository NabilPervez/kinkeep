import type { Contact } from '../types';

export const getNextDueDate = (contact: Contact): number => {
    const baseDueDate = contact.lastContacted + (contact.frequencyDays * 86400000);

    if (contact.preferredDayOfWeek === undefined || contact.preferredDayOfWeek === null) {
        return baseDueDate;
    }

    const date = new Date(baseDueDate);
    const currentDay = date.getDay();
    const targetDay = contact.preferredDayOfWeek;

    // Calculate days to add to reach the target day
    // e.g. Current=1 (Mon), Target=5 (Fri) -> Add 4 days
    // e.g. Current=5 (Fri), Target=1 (Mon) -> Add 3 days (next week)
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd < 0) {
        daysToAdd += 7;
    }

    // If we are strictly already on the day, baseDueDate is fine. 
    // But usually 'Weekly on Friday' means we push to the Next Friday if the interval lands on a Monday?
    // Actually, 'frequency' is the minimum gap.
    // If Frequency=7 (Weekly) and Last=Friday:
    // Base = Next Friday. Day matches. Result = Next Friday.

    // If Frequency=7 and Last=Saturday (I was late):
    // Base = Next Saturday. 
    // Target = Friday.
    // Current(Sat)=6, Target(Fri)=5. daysToAdd = -1 + 7 = 6.
    // Result = Next Saturday + 6 days = The Friday AFTER next Saturday. 
    // This effectively resets the rhythm to the preferred day.

    return baseDueDate + (daysToAdd * 86400000);
};

export const isOverdue = (contact: Contact): boolean => {
    return getNextDueDate(contact) < Date.now();
};
