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
            subtitle: "Your personal relationship manager.",
            description: "KinKeep helps you stay connected with your network by simplifying follow-ups and tracking important dates. Use it to build better habits and never lose touch with the people who matter most.",
            icon: "favorite",
            color: "text-primary",
            bg: "bg-primary/10",
            actionLabel: "Get Started",
            action: () => setStep(1)
        },
        {
            title: "Step 1: Import Contacts",
            subtitle: "Build your network.",
            description: "Import your contacts using VCF or CSV files, or add them manually. You can set a custom communication cadence—from daily to yearly—to suit each relationship.",
            icon: "group_add",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            actionLabel: "Next",
            secondaryLabel: "Import Now",
            action: () => setStep(2),
            secondaryAction: () => navigate('/import')
        },
        {
            title: "Step 2: Update Templates",
            subtitle: "Make it personal.",
            description: "Review and customize your message templates. Whether it's a birthday wish or a casual check-in, set up messages that sound like you across all your categories.",
            icon: "edit_note",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            actionLabel: "Next",
            secondaryLabel: "View Templates",
            action: () => setStep(3),
            secondaryAction: () => navigate('/templates')
        },
        {
            title: "Step 3: Start Connecting",
            subtitle: "Your daily dashboard.",
            description: "Use your dashboard to see who you need to contact each day. It prioritizes your outreach so you can focus on connecting with zero stress.",
            icon: "dashboard",
            color: "text-green-500",
            bg: "bg-green-500/10",
            actionLabel: "Go to Dashboard",
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
            <div className="p-6 pb-24 flex flex-col gap-3">
                {current.secondaryLabel && (
                    <button
                        onClick={current.secondaryAction}
                        className="w-full py-2 text-sm text-gray-400 dark:text-gray-500 font-bold hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {current.secondaryLabel}
                    </button>
                )}
                <button
                    onClick={current.action}
                    className="w-full h-14 rounded-2xl bg-primary text-black text-lg font-bold shadow-[0_4px_20px_rgba(70,236,19,0.3)] hover:bg-primary/90 hover:shadow-[0_4px_25px_rgba(70,236,19,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {current.actionLabel}
                    <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};
