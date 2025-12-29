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
        { path: '/settings', label: 'Settings', icon: 'settings' },
    ];

    return (
        <div className="flex flex-col min-h-screen font-body text-gray-900 dark:text-gray-100 bg-background-light dark:bg-background-dark max-w-lg mx-auto shadow-2xl overflow-hidden relative">
            <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
                {children}
            </div>

            <nav className="fixed bottom-0 w-full z-40 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 pb-safe">
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
                                {/* <span className="text-[10px] font-medium">{item.label}</span> */}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
