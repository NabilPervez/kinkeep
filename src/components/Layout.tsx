import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden">
            {children}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-white/5 pb-safe">
                <div className="flex justify-around items-center h-16 px-2">
                    <Link to="/" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}>
                        <span className="material-symbols-outlined text-[26px] fill-current">home</span>
                        <span className="text-[10px] font-medium">Home</span>
                    </Link>
                    <Link to="/contacts" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/contacts') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}>
                        <span className="material-symbols-outlined text-[26px]">groups</span>
                        <span className="text-[10px] font-medium">Contacts</span>
                    </Link>
                    <Link to="/templates" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/templates') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}>
                        <span className="material-symbols-outlined text-[26px]">chat</span>
                        <span className="text-[10px] font-medium">Templates</span>
                    </Link>
                    <Link to="/settings" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive('/settings') ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} transition-colors`}>
                        <span className="material-symbols-outlined text-[26px]">settings</span>
                        <span className="text-[10px] font-medium">Settings</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};
