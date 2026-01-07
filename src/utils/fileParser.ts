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

                    // Parser for Frequency
                    const freqRaw = row['Frequency'] || row['Cadence'] || row['Schedule'] || row['Frequency Days'] || '';
                    let freq = 30; // Default
                    if (freqRaw) {
                        const lower = freqRaw.toString().toLowerCase();
                        if (lower.includes('daily') || lower === '1') freq = 1;
                        else if (lower.includes('3 day') || lower === '3') freq = 3;
                        else if (lower.includes('weekly') || lower.includes('week') || lower === '7') freq = 7;
                        else if (lower.includes('bi') || lower === '14') freq = 14;
                        else if (lower.includes('month') || lower === '30') freq = 30;
                        else if (lower.includes('quarter') || lower === '90') freq = 90;
                        else if (lower.includes('year') || lower === '365') freq = 365;
                    }

                    if (firstName || lastName) { // Allow one name at least
                        contacts.push({
                            id: uuidv4(),
                            firstName: firstName || 'Unknown',
                            lastName: lastName || '',
                            phoneNumber: phone || '',
                            frequencyDays: freq,
                            snoozedUntil: undefined,
                            lastContacted: 0,
                            isArchived: false,
                            tags: ['Imported'],
                            email: row['E-mail Address'] || row['Email'] || row['Email Address'] || ''
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
        let email = '';
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

            // Handle EMAIL field
            if (trimmed.startsWith('EMAIL')) {
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex !== -1) {
                    const value = trimmed.substring(colonIndex + 1).trim();
                    if (!email) {
                        email = value;
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
                lastContacted: 0,
                isArchived: false,
                tags: ['Imported'],
                email: email || '',
            });
        }
    });

    return { contacts, errors };
};
