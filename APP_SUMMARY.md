# KinKeep Application Summary

## Overview
**KinKeep** is a local-first Personal Relationship Management (PRM) application designed to help users thoughtfully maintain connections with friends, family, and their professional network. Unlike standard address books, KinKeep focuses on *maintenance*—allowing users to set specific contact frequencies, categorize relationships, and receive daily prompts on who to reach out to.

The application is built with a mobile-first philosophy but functions as a responsive web application. It emphasizes privacy and speed by storing all data locally on the user's device.

## Core Functionality

### 1. Dashboard (The "Command Center")
*   **Purpose:** Answers the daily question: *"Who do I need to connect with today?"*
*   **Smart Lists:** Automatically groups contacts into:
    *   **Attention Needed:** High-priority items like Birthdays and Overdue check-ins.
    *   **Upcoming:** Future scheduled interactions.
    *   **Snoozed:** Intentionally deferred contacts.
*   **Quick Actions:** Mark interactions as "Complete" or "Snooze" directly from the home screen.
*   **Filtering:** Users can filter their daily view by Status (Overdue, Upcoming) or Category (Islamic, Friends, Colleagues).

### 2. Contact Management
*   **Comprehensive Database:** A searchable, filterable list of all contacts.
*   **Rich Profiles:** Contacts store standard info (Name, Phone) plus unique PRM data:
    *   **Category:** (e.g., Islamic, Friends, Colleagues, Network).
    *   **Frequency:** How often to connect (Daily, Every 3 Days, Weekly, up to Yearly).
    *   **Preferred Day:** Specific days to connect (e.g., "Call on Sundays").
*   **Import Wizard:** A specialized tool to bulk-import contacts from CSV/VCF files and rapidly assign them to frequency tiers ("The Sorting Hat" for contacts).
*   **Export:** Full data ownership with CSV and VCard export options.

### 3. Templates & Outreach
*   **Template Library:** Users can create and manage pre-written message templates.
*   **Dynamic Variables:** Templates support `{NAME}` injection for personalized mass-messaging.
*   **Contextual Categories:** Templates are categorized (e.g., Birthday wishes, catch-up texts) for quick access during outreach.

### 4. Settings & Data
*   **Local-First Security:** All data resides in the user's browser (IndexedDB).
*   **Backup & Restore:** Full JSON export/import capabilities for data backup.
*   **"Nuke" Option:** Complete data reset functionality.

## Unique Features & Selling Points

### 🕌 Faith-Aligned Design
KinKeep features an "Islamic" category as a primary default, reflected in the UI's emerald-themed branding (in specific modes) and potential future integrations (e.g., prayer times, as hinted in development). This positions it uniquely for users who view maintaining kinship ("Silat ar-Rahim") as a spiritual duty.

### 📅 Granular "Cadence" Control
Unlike simple "favorites," KinKeep allows specific rhythms for every person in your life:
*   *Daily* for closest family.
*   *Weekly* for best friends.
*   *Every 6 Months* for distant acquaintances.
*   **Preferred Days:** The ability to specify "Fridays" or "Sundays" helps users batch their social time effective.

### 🔒 Privacy-Centric Architecture
In an era of cloud data leaks, KinKeep operates completely offline. User contact data never leaves their device, offering peace of mind for privacy-conscious users.

### ⚡ Gamified "Import Funnel"
The Import Wizard turns the tedious task of organizing contacts into a streamlined "funnel," moving users through stages (Daily -> Weekly -> Monthly) to quickly sort hundreds of contacts without overwhelm.

### 🎨 Neo-Dark Aesthetic
The application features a modern, high-contrast "Neo-dark" design with vibrant accents (Emerald, Purple, Blue) and glassmorphism effects, offering a premium "app-like" feel even in the browser.
