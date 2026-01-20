# KinKeep - Design & Aesthetic Guidelines

## Overview
**KinKeep** defines itself through a **"Soft Modern, Privacy-First"** aesthetic. The visual language should feel personal, calm, and organized—like a well-kept journal—while using modern glassmorphism and soft gradients to feel premium and "alive."

Since the app is a "Second Brain" for relationships, the design should reduce cognitive load. It should be clean but not sterile, using color semantically to guide attention without overwhelming the user.

---

## 1. Core Visual Pillars
1.  **Glassmorphism (Frosted Clarity)**: The UI heavily uses backdrop blurs (`backdrop-blur-md`) to create depth. Surfaces are not just flat solid colors but semi-transparent layers that sit on top of the background.
    *   *Usage*: Headers, sticky navs, and modals should feel like frosted glass floating above the content.
2.  **Soft & Rounded (Friendly Geometry)**: There are almost *no* sharp corners. Everything is `rounded-2xl` or `rounded-3xl`. This makes the app feel organic and approachable, not corporate.
3.  **Semantic Color Coding**: Color is used for *meaning*, not just decoration. Relationships and urgencies are color-coded (Red for overdue, Green for contacted, specific pastels for categories like Friends/Family).
4.  **Dark Mode First Philosophy**: While it supports light mode, the design really shines in Dark Mode with high-contrast text on deep backgrounds (`#1E2130` or similar), glowing accents, and subtle borders.

---

## 2. Color Palette

### Primary & Action
*   **Primary Brand Color**: A soft but vibrant **Red/Coral** (implied by `bg-primary`, `text-red-500`). It signals "heart/love" but also "action needed" without being aggressive.
*   **Secondary Accents**:
    *   **Emerald/Green**: Success, Completed, Islamic Category.
    *   **Blue**: Friends, Yearly tasks.
    *   **Purple**: Colleagues.
    *   **Orange**: Snoozed, Warning.

### Neutrals (The Canvas)
*   **Light Mode Background**: `bg-background-light` (likely a very soft off-white or pale gray).
*   **Dark Mode Background**: `bg-background-dark` (Deep Navy/Charcoal, e.g., `#162521` "Jet Black" or `#1E2130`).
*   **Surface Colors**:
    *   Light: `bg-white` or `bg-gray-50`.
    *   Dark: `bg-white/5` or `bg-[#1E2130]`.

### Specific Hex Variables (from Codebase)
*   **Steel Blue**: `#4f7cacff`
*   **Frozen Water (Teal-ish)**: `#c0e0deff`
*   **Jet Black**: `#162521ff`
*   **Iron Grey**: `#3c474bff`
*   **Soft Cyan**: `#9eefe5ff`

*Note for Developer: Use these specific hex codes for backgrounds/accents to match the app exactly.*

---

## 3. Typography
*   **Font Family**: Use a modern, geometric sans-serif. The app uses `font-display` (likely configured to **Inter**, **Outfit**, or **SF Pro Display**).
*   **Characteristics**:
    *   **Bold Headings**: `font-black`, `tracking-tight`. Headings should be heavy and compact.
    *   **Readable Body**: Standard weights for readability, but use high contrast (Gray-900 or White).
    *   **Uppercase Labels**: Small utility labels (e.g., category tags) are often `text-[10px] uppercase font-bold tracking-wide`.

---

## 4. UI Components & Elements

### Cards
*   **Shape**: `rounded-2xl` or `rounded-3xl`.
*   **Style**:
    *   *Light*: White background, very subtle shadow (`shadow-sm`), thin border (`border-gray-100`).
    *   *Dark*: Semi-transparent white (`bg-white/5`), subtle white border (`border-white/5`), faint glow shadow.
*   **Interaction**: Slight scale up on hover (`active:scale-95` or `hover:scale-105`), smooth transitions (`duration-300`).

### Buttons
*   **Primary Action**: Full color background, white text, `rounded-full` or `rounded-xl`. Often has a colored shadow (`shadow-primary/30`).
*   **Secondary/Icon Buttons**: `rounded-full`, often gray/transparent background that turns colored on hover.
*   **Floating Action Button (FAB)**: Large, circular, dropshadow, bottom-right placement.

### Effects & Animations
*   **Entrance**: Elements should not just appear; they should slide in or fade in (`animate-in slide-in-from-bottom-5`).
*   **Micro-interactions**: Buttons should have a tactile "click" feel (scaling down slightly when pressed).
*   **Blobs**: Use the provided `@keyframes blob` animation for background elements to create a "living" gradient background that moves slowly.

---

## 5. Layout & Spacing
*   **Mobile-First**: The design is optimized for handheld usage. Touch targets are large (min `size-10` or `44px`).
*   **Breathing Room**: Use generous padding (`p-4`, `p-6`). Don't crowd informaton.
*   **Sticky Elements**: Headers and bottom actions are often sticky with glassmorphism backgrounds to maintain context while scrolling.

---

## Summary for Marketing Site
The marketing site should mirror the app's clean, distraction-free environment.
1.  **Hero Section**: Use the **"Jet Black"** or **"Steel Blue"** as a base. Show the app interface inside a sleek device frame.
2.  **Feature Sections**: Use **Cards** with the same rounded corners (`rounded-3xl`) and glass borders to explain features.
3.  **Vibe**: It should feel intimate and personal. Avoid corporate "blue and white" SaaS tropes. Lean into the **warmth** of the primary red/coral and the **calmness** of the dark mode palette.
