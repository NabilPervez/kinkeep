# KinKeep Application Summary

## Overview
**KinKeep** is a local-first Personal Relationship Management (PRM) application designed to help users thoughtfully maintain connections with friends, family, and their professional network. Unlike standard address books, KinKeep focuses on *maintenance*—allowing users to set specific contact frequencies, categorize relationships, and receive daily prompts on who to reach out to.

The application is built with a mobile-first philosophy but functions as a responsive web application. It emphasizes privacy and speed by storing all data locally on the user's device.

## Core Functionality

### 1. Dashboard (The "Command Center")
*   **Purpose:** Answers the daily question: *"Who do I need to connect with today?"*
*   **Smart Lists & Date-Based Queues:** automatically groups contacts into clear, date-specific sections (e.g., "Today," "Tomorrow," "Friday") so users can plan ahead.
*   **Quick Actions:** 
    *   **Connect Now:** Text-only button to immediately initiate contact.
    *   **Done/Snooze:** Rapidly log interactions or defer them.
*   **Streamlined View:** Recently optimized to remove low-value metrics (Network size, Velocity) and focus entirely on the daily action queue.

### 2. Planning Workflow
*   **Purpose:** A dedicated mode for rapidly organizing relationships.
*   **Consolidated Management:** A unified screen that allows users to simultaneously set:
    *   **Frequency:** (e.g., Daily, Weekly, Yearly).
    *   **Preferred Day:** (e.g., "Calls on Sundays").
    *   **Category:** (e.g., Friends, Family, Network).
*   **Efficiency:** Designed to let users "sort" their contacts quickly without navigating multiple menus.

### 3. Onboarding Experience
*   **New User Flow:** A specialized 4-screen journey for fresh accounts:
    1.  **Welcome:** Introduction to the KinKeep philosophy.
    2.  **Import:** Guidance on bringing in contacts (VCF/CSV).
    3.  **Templates:** Setup of initial outreach messages.
    4.  **Dashboard Outreach:** Immediate prompting to start the first connection.

### 4. Contact Management
*   **Comprehensive Database:** A searchable, filterable list of all contacts.
*   **Rich Profiles:** Contacts store standard info (Name, Phone) plus unique PRM data.
*   **Import Wizard:** A specialized tool to bulk-import contacts from CSV/VCF files.
*   **Export:** Full data ownership with CSV and VCard export options.

### 5. Templates & Outreach
*   **Template Library:** Users can create and manage pre-written message templates.
*   **Dynamic Variables:** Templates support `{NAME}` injection for personalized mass-messaging.
*   **Contextual Categories:** Templates are categorized (e.g., Birthday wishes, catch-up texts) for quick access during outreach.

### 6. Settings & Personalization
*   **Customization:** Users can set their "Wake Time" (determining when "Today" begins) and preferred Display Name.
*   **Data Management:** Full backup (JSON export) and restore capabilities, plus a "Nuke" option for a complete hard reset.
*   **Local-First Security:** All data resides in the user's browser (IndexedDB).

## UI/UX & Aesthetics

### 🎨 "Aurora" Design System
*   **Visual Style:** Features a modern, "Aurora" aesthetic with animated, blurred color blobs in the background, creating a high-premium feel.
*   **Glassmorphism:** Extensive use of translucent, blurred cards (`backdrop-blur`) to create depth and hierarchy.
*   **Motion:** Integrated **Framer Motion** for smooth page transitions and micro-interactions, making the app feel alive and responsive.
*   **Responsive:** Fully unified layouts that adapt seamlessly between mobile, tablet, and desktop views.

## Unique Features & Selling Points

### 📅 Granular "Cadence" Control
Unlike simple "favorites," KinKeep allows specific rhythms for every person in your life:
*   *Daily* for closest family.
*   *Weekly* for best friends.
*   *Every 6 Months* for distant acquaintances.
*   **Preferred Days:** The ability to specify "Fridays" or "Sundays" helps users batch their social time effectively.

### 🔒 Privacy-Centric Architecture
In an era of cloud data leaks, KinKeep operates completely offline. User contact data never leaves their device, offering peace of mind for privacy-conscious users.
