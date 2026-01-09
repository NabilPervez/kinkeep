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
        { path: '/templates', label: 'Templates', icon: 'edit_note' },
    ];

    return (
        <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-background-light dark:bg-background-dark max-w-lg md:max-w-none mx-auto shadow-2xl relative overflow-hidden">

            {/* Desktop Navigation Rail */}
            <nav className="hidden md:flex w-64 shrink-0 z-50 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-r border-gray-200 dark:border-white/5 flex-col py-6 px-4 gap-2">
                <div className="flex items-center gap-3 mb-8 px-4">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/25">
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
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
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

            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-0">
                {children}
            </div>

            {/* Mobile Navigation Bar */}
            <nav className="md:hidden w-full shrink-0 z-50 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 pb-safe">
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
                                    isActive ? "text-primary" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
