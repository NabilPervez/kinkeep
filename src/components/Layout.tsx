import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { sounds } from '../utils/sounds';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Home', icon: 'favorite' },
        { path: '/contacts', label: 'Contacts', icon: 'people' },
        { path: '/planning', label: 'Planning', icon: 'calendar_month' },
        { path: '/templates', label: 'Templates', icon: 'edit_note' },
    ];

    return (
        <div className="h-[100dvh] w-full flex flex-col md:flex-row max-w-lg md:max-w-none mx-auto shadow-2xl relative overflow-hidden bg-gray-50 dark:bg-[#0f1115]">

            {/* Aurora Background Layer */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-400/30 dark:bg-purple-900/40 rounded-full blur-[80px] animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/30 dark:bg-blue-900/40 rounded-full blur-[80px] animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-emerald-400/30 dark:bg-emerald-900/40 rounded-full blur-[80px] animate-blob animation-delay-4000" />
            </div>

            {/* Desktop Navigation Rail */}
            <nav className="hidden md:flex w-64 shrink-0 z-50 glass-panel border-r border-white/20 flex-col py-6 px-4 gap-2">
                <div className="flex items-center gap-3 mb-8 px-4">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-primary/90 text-white font-bold shadow-lg shadow-primary/25 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                    </div>
                    <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">KinKeep</span>
                </div>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => isActive ? null : sounds.play('click')}
                            className={clsx(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all active:scale-95 group",
                                isActive
                                    ? "bg-primary/90 text-white shadow-lg shadow-primary/25 backdrop-blur-sm"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <span className={clsx("material-symbols-outlined transition-all", isActive ? "font-bold" : "")}>
                                {item.icon}
                            </span>
                            <span className="font-bold text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 p-4">
                {children}
            </div>

            {/* Mobile Navigation Bar */}
            <nav className="md:hidden w-full shrink-0 z-50 glass-panel border-t border-white/20 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => isActive ? null : sounds.play('click')}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all active:scale-95",
                                    isActive ? "text-primary dark:text-primary-light drop-shadow-sm" : "text-gray-500 dark:text-gray-400"
                                )}
                            >
                                <span className={clsx("material-symbols-outlined transition-all", isActive ? "font-bold text-[28px]" : "text-[24px]")}>
                                    {item.icon}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
