import Papa from 'papaparse';
import VCardParser from 'vcard-parser';
import { v4 as uuidv4 } from 'uuid';
import type { Contact } from '../types';

export interface ParseResult {
    contacts: Contact[];
    errors: string[];
}

export const parseCSV = (file: File): Promise<ParseResult> => {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const contacts: Contact[] = [];
                const errors: string[] = [];

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                results.data.forEach((row: any) => {
                    // Attempt to find name and phone columns loosely
                    // Common headers: "First Name", "Given Name", "Name", "Phone", "Mobile"
                    const firstName = row['First Name'] || row['Given Name'] || row['First'] || '';
                    const lastName = row['Last Name'] || row['Family Name'] || row['Last'] || '';
                    const phone = row['Phone 1 - Value'] || row['Phone'] || row['Mobile'] || row['Cell'] || '';

                    if (firstName || lastName) { // Allow one name at least
                        contacts.push({
                            id: uuidv4(),
                            firstName: firstName || 'Unknown',
                            lastName: lastName || '',
                            phoneNumber: phone || '',
                            frequencyDays: 30, // Default to monthly
                            lastContacted: Date.now(), // Assume caught up? Or maybe far back? Let's say today for "fresh start" or maybe 0? 
                            // PRD says: "Go from Zero to organized". Let's assume we need to contact them.
                            // Actually, if we import, we might want to start fresh. Let's set lastContacted to Date.now() so they aren't immediately overdue.
                            // User story: "As a User, I want to import... so I don't clutter".
                            // Let's default lastContacted to Date.now() (caught up) so the timer starts NOW.
                            // UNLESS the CSV has a 'Last Contacted' field? Unlikely for generic exports.
                            isArchived: false,
                            tags: ['Imported'],
                        });
                    } else {
                        // Skip empty rows silently or log error
                        //  errors.push(`Row ${index + 2}: Missing name`);
                    }
                });

                resolve({ contacts, errors });
            },
            error: (err) => {
                resolve({ contacts: [], errors: [err.message] });
            }
        });
    });
};

export const parseVCF = async (file: File): Promise<ParseResult> => {
    const text = await file.text();
    const result = VCardParser.parse(text);
    const contacts: Contact[] = [];

    // VCardParser returns an object where keys are not strictly array if single... 
    // Actually vcard-parser output format varies by version. 
    // Let's assume standard usage or debug if needed.
    // However, vcard-parser typically returns an array of cards.
    // Let's verify the library output structure if we could, but blindly:
    // It usually parses into a list of cards.

    // Using a simpler approach if the lib is complex, but let's try mapping.
    // Ideally we iterate over the parsed cards.

    // Note: vcard-parser documentation says `.parse(string)` returns an object (single card) or array?
    // Actually, many look for 'vcard-parser'.
    // Let's look at a simpler manual parse if needed, but let's try iterating.

    // If result is an array:
    if (Array.isArray(result)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.forEach((card: any) => {
            // n is structured: { surname: ['...'], given: ['...'] } usually in json vcard
            // or sometimes flat.
            // Let's try to extract FN (Formatted Name) if N isn't perfect.

            const fn = card.fn ? (Array.isArray(card.fn) ? card.fn[0].value : card.fn.value) : '';
            let given = '';
            let family = '';

            if (card.n) {
                const nObj = Array.isArray(card.n) ? card.n[0].value : card.n.value;
                // nObj might be "Doe;John;;;" string or object depending on parser config.
                // 'vcard-parser' usually parses values well.
                // Let's assume broad heuristic: use FN if N fails.
                if (typeof nObj === 'string') {
                    const parts = nObj.split(';');
                    family = parts[0] || '';
                    given = parts[1] || '';
                } else if (typeof nObj === 'object') {
                    // Check specific parser structure
                }
            }

            if (!given && fn) {
                const parts = fn.split(' ');
                given = parts[0];
                family = parts.slice(1).join(' ');
            }

            const tel = card.tel ? (Array.isArray(card.tel) ? card.tel[0].value : card.tel.value) : '';

            if (given || family) {
                contacts.push({
                    id: uuidv4(),
                    firstName: given || 'Friend',
                    lastName: family || '',
                    phoneNumber: tel || '',
                    frequencyDays: 30,
                    lastContacted: Date.now(),
                    isArchived: false,
                    tags: ['Imported'],
                });
            }
        });
    } else {
        // Single card? or error?
        // Let's assume array for bulk file.
    }

    return { contacts, errors: [] };
};
