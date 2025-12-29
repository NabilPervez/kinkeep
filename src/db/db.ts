import Dexie, { type Table } from 'dexie';
import type { Contact, Template } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class KinKeepDB extends Dexie {
    contacts!: Table<Contact, string>;
    templates!: Table<Template, string>;

    constructor() {
        super('KinKeepDB');
        this.version(1).stores({
            contacts: 'id, firstName, lastName, frequencyDays, lastContacted, birthday, snoozedUntil, isArchived, *tags',
            templates: 'id, category, isDefault'
        });

        // Seed default templates
        this.on('populate', () => {
            this.templates.bulkAdd([
                // Religious (Islamic)
                { id: uuidv4(), category: 'religious', text: 'Salaam, Jummah Mubarak! Hope you have a blessed Friday.', isDefault: true },
                { id: uuidv4(), category: 'religious', text: 'Salaam {NAME}, keeping you in my duas. Hope all is well.', isDefault: true },

                // Casual
                { id: uuidv4(), category: 'casual', text: 'Hey {NAME}, long time no see! Coffee soon?', isDefault: true },
                { id: uuidv4(), category: 'casual', text: 'Thinking of you {NAME}, hope you\'re having a great week!', isDefault: true },

                // Birthday
                { id: uuidv4(), category: 'birthday', text: 'Happy Birthday {NAME}! Hope you have an amazing day!', isDefault: true },
                { id: uuidv4(), category: 'birthday', text: 'Wishing you the best on your special day {NAME}!', isDefault: true },

                // Formal
                { id: uuidv4(), category: 'formal', text: 'Hello {NAME}, I hope this message finds you well.', isDefault: true },
                { id: uuidv4(), category: 'formal', text: 'Hi {NAME}, it\'s been a while. Would love to catch up professionally soon.', isDefault: true },
            ]);
        });
    }
}

export const db = new KinKeepDB();
