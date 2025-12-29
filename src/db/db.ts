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
    }
}

export const db = new KinKeepDB();
