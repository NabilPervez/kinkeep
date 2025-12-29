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
                { id: uuidv4(), category: 'religious', text: 'Salaam {NAME}, Jummah Mubarak to you and the family.', isDefault: true },
                { id: uuidv4(), category: 'religious', text: 'Salaam {NAME}, keeping you in my duas. Hope all is well.', isDefault: true },
                { id: uuidv4(), category: 'religious', text: 'Salaam, just checking in. May Allah bless your day.', isDefault: true },
                { id: uuidv4(), category: 'religious', text: 'Salaam {NAME}, may Allah shower His blessings upon you and your family.', isDefault: true },
                { id: uuidv4(), category: 'religious', text: 'Salaam! Hope you\'re having a peaceful week.', isDefault: true },

                // Casual
                { id: uuidv4(), category: 'casual', text: 'Hey {NAME}, long time no see! Coffee soon?', isDefault: true },
                { id: uuidv4(), category: 'casual', text: 'Thinking of you {NAME}, hope you\'re having a great week!', isDefault: true },
                { id: uuidv4(), category: 'casual', text: 'Hi {NAME}, just wanted to say hello!', isDefault: true },
                { id: uuidv4(), category: 'casual', text: 'Hey {NAME}! It\'s been too long. How are things?', isDefault: true },
                { id: uuidv4(), category: 'casual', text: 'Yo {NAME}, what\'s good? Let\'s link up.', isDefault: true },

                // Birthday
                { id: uuidv4(), category: 'birthday', text: 'Happy Birthday {NAME}! Hope you have an amazing day!', isDefault: true },
                { id: uuidv4(), category: 'birthday', text: 'Happy Birthday! Wishing you a year full of blessings.', isDefault: true },
                { id: uuidv4(), category: 'birthday', text: 'Happy B-day {NAME}! Let\'s celebrate soon.', isDefault: true },
                { id: uuidv4(), category: 'birthday', text: 'Wishing you the best on your special day {NAME}!', isDefault: true },

                // Formal
                { id: uuidv4(), category: 'formal', text: 'Hello {NAME}, I hope this message finds you well.', isDefault: true },
                { id: uuidv4(), category: 'formal', text: 'Hi {NAME}, it\'s been a while. Would love to catch up professionally soon.', isDefault: true },
                { id: uuidv4(), category: 'formal', text: 'Dear {NAME}, thinking of you and hope your projects are going well.', isDefault: true },
                { id: uuidv4(), category: 'formal', text: 'Greetings {NAME}, best wishes to you.', isDefault: true },
            ]);
        });
    }
}

export const db = new KinKeepDB();
