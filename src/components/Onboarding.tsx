import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const steps = [
        {
            title: "Welcome to KinKeep",
            subtitle: "Your personal relationship assistant.",
            description: "Stay connected with the people who matter most. Private, local-first, and designed to help you be intentional.",
            icon: "favorite",
            color: "text-primary",
            bg: "bg-primary/10",
            actionLabel: "Let's Go",
            action: () => setStep(1)
        },
        {
            title: "Step 1: Bring Your People",
            subtitle: "Import from anywhere.",
            description: "Easily import your contacts via CSV or VCF files. Choose who you want to keep in touch with and set your frequency.",
            icon: "group_add",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            actionLabel: "Import Contacts",
            secondaryLabel: "Skip for now",
            action: () => navigate('/import'),
            secondaryAction: () => setStep(2)
        },
        {
            title: "Step 2: Perfect Templates",
            subtitle: "Say the right thing.",
            description: "Browse and customize message templates for birthdays, check-ins, and more. Never struggle with what to say again.",
            icon: "edit_note",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            actionLabel: "Next Step",
            action: () => setStep(3)
        },
        {
            title: "Step 3: Connect Instantly",
            subtitle: "Swipe, Tap, Send.",
            description: "Reach out via SMS, WhatsApp, or Telegram in seconds. We'll even remind you when it's time to reconnect.",
            icon: "send",
            color: "text-green-500",
            bg: "bg-green-500/10",
            actionLabel: "Get Started",
            action: () => {
                setIsExiting(true);
                setTimeout(onComplete, 300);
            }
        }
    ];

    const current = steps[step];

    return (
        <div className={clsx(
            "fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col transition-opacity duration-300",
            isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            {/* Progress Bar */}
            <div className="flex gap-1 p-4 absolute top-0 w-full z-10">
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={clsx(
                            "h-1 flex-1 rounded-full transition-all duration-500",
                            i <= step ? "bg-primary" : "bg-gray-200 dark:bg-white/10"
                        )}
                    />
                ))}
            </div>

            {/* Content Swiper */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-right-8 fade-in duration-300" key={step}>
                <div className={clsx("size-24 rounded-full flex items-center justify-center mb-8", current.bg)}>
                    <span className={clsx("material-symbols-outlined text-5xl", current.color)}>
                        {current.icon}
                    </span>
                </div>

                <h1 className="text-3xl font-black mb-2 tracking-tight text-gray-900 dark:text-white">
                    {current.title}
                </h1>
                <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-6">
                    {current.subtitle}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                    {current.description}
                </p>
            </div>

            {/* Footer Actions */}
            <div className="p-6 pb-safe">
                <button
                    onClick={current.action}
                    className="w-full h-14 rounded-2xl bg-primary text-black text-lg font-bold shadow-[0_4px_20px_rgba(70,236,19,0.3)] hover:bg-primary/90 hover:shadow-[0_4px_25px_rgba(70,236,19,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {current.actionLabel}
                    <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>

                {current.secondaryLabel ? (
                    <button
                        onClick={current.secondaryAction}
                        className="w-full h-12 mt-3 rounded-xl text-gray-500 font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        {current.secondaryLabel}
                    </button>
                ) : (
                    <div className="h-12 mt-3"></div> // Spacer
                )}
            </div>
        </div>
    );
};
