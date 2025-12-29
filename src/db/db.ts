import Dexie, { type Table } from 'dexie';
import type { Contact, Template } from '../types';

export class KinKeepDB extends Dexie {
    contacts!: Table<Contact, string>;
    templates!: Table<Template, string>;

    constructor() {
        super('KinKeepDB');
        this.version(1).stores({
            contacts: 'id, firstName, lastName, frequencyDays, lastContacted, birthday, snoozedUntil, isArchived, *tags',
            templates: 'id, category, isDefault'
        });

        this.on('populate', () => {
            this.templates.bulkAdd([
                { id: '1', category: 'birthday', text: 'Happy Birthday {NAME}! 🎂 Hope you have a wonderful day!', isDefault: true },
                { id: '2', category: 'casual', text: 'Hey {NAME}, long time no see! How have you been?', isDefault: true },
                { id: '3', category: 'casual', text: 'Thinking of you! We should catch up soon.', isDefault: false },
                { id: '4', category: 'religious', text: 'Eid Mubarak {NAME}! May this day bring you joy and peace.', isDefault: false },
                { id: '5', category: 'formal', text: 'Hi {NAME}, hope you are doing well. I would love to connect soon.', isDefault: true },
            ]);
        });
    }
}

export const db = new KinKeepDB();
