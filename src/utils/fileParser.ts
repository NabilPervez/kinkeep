import Papa from 'papaparse';

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
    let text = '';
    try {
        text = await file.text();
    } catch (e) {
        return { contacts: [], errors: ['Failed to read file text'] };
    }

    const contacts: Contact[] = [];
    const errors: string[] = [];

    // Normalize line endings
    const normalizedText = text.replace(/\r\n/g, '\n');

    // Split by BEGIN:VCARD
    const cards = normalizedText.split('BEGIN:VCARD');

    cards.forEach((cardContent) => {
        if (!cardContent.trim()) return;

        // Process each card
        const lines = cardContent.split('\n');
        let firstName = '';
        let lastName = '';
        let phone = '';
        let fn = '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Handle N field
            if (trimmed.startsWith('N:') || trimmed.startsWith('N;')) {
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex !== -1) {
                    const valuePart = trimmed.substring(colonIndex + 1);
                    const parts = valuePart.split(';');
                    lastName = parts[0]?.trim() || '';
                    firstName = parts[1]?.trim() || '';
                }
            }

            // Handle FN field
            if (trimmed.startsWith('FN:') || trimmed.startsWith('FN;')) {
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex !== -1) {
                    fn = trimmed.substring(colonIndex + 1).trim();
                }
            }

            // Handle TEL field
            if (trimmed.startsWith('TEL')) {
                const isCell = trimmed.toUpperCase().includes('CELL');
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex !== -1) {
                    const value = trimmed.substring(colonIndex + 1).trim();
                    if (isCell) {
                        phone = value;
                    } else if (!phone) {
                        phone = value;
                    }
                }
            }
        }

        // Fallback for name if N fields were empty but FN exists
        if (!firstName && !lastName && fn) {
            const parts = fn.split(' ');
            if (parts.length > 1) {
                firstName = parts[0];
                lastName = parts.slice(1).join(' ');
            } else {
                firstName = fn;
            }
        }

        if (firstName || lastName) {
            contacts.push({
                id: uuidv4(),
                firstName: firstName || 'Unknown',
                lastName: lastName || '',
                phoneNumber: phone || '',
                frequencyDays: 30,
                lastContacted: Date.now(),
                isArchived: false,
                tags: ['Imported'],
            });
        }
    });

    return { contacts, errors };
};
