export interface Contact {
    id: string;               // UUID
    firstName: string;
    lastName: string;
    phoneNumber: string;      // E.164 format ideally
    avatarColor?: string;     // UI Hex code
    avatarImage?: string;     // URL or base64
    email?: string;           // Optional email address

    // Logic Fields
    frequencyDays: number;    // e.g., 7, 30, 90, 365
    lastContacted: number;    // Unix Timestamp
    birthday?: string;        // Format: "MM-DD" or "YYYY-MM-DD"

    // State Management
    snoozedUntil?: number;    // Unix Timestamp (ignore in sort until this passes)
    isArchived: boolean;

    tags: string[];           // ["Family", "Work"]
    preferredDayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
    notes?: string;

    // Computed fields (not necessarily in DB, but useful)
    score?: number;
    isBirthdayUpcoming?: boolean;
}

export interface Template {
    id: string;
    category: 'casual' | 'formal' | 'birthday' | 'religious';
    text: string;             // "Happy Birthday {NAME}!"
    isDefault: boolean;
}
