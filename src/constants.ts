
export const CATEGORIES = [
    {
        id: 'islamic',
        label: 'Islamic',
        colorClass: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        badgeColor: 'bg-emerald-500'
    },
    {
        id: 'friends',
        label: 'Friends',
        colorClass: 'bg-teal-950/60 text-teal-400 border border-teal-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(45,212,191,0.2)]',
        badgeColor: 'bg-teal-500'
    },
    {
        id: 'colleagues',
        label: 'Colleagues',
        colorClass: 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.2)]',
        badgeColor: 'bg-cyan-500'
    },
    {
        id: 'network',
        label: 'Network',
        colorClass: 'bg-slate-900/60 text-slate-300 border border-slate-600/30 backdrop-blur-md',
        badgeColor: 'bg-slate-500'
    },
    {
        id: 'other',
        label: 'Other',
        colorClass: 'bg-zinc-900/60 text-zinc-400 border border-zinc-700/30 backdrop-blur-md',
        badgeColor: 'bg-zinc-500'
    }
] as const;

export const TEMPLATE_CATEGORIES = [
    ...CATEGORIES,
    {
        id: 'birthday',
        label: 'Birthday',
        colorClass: 'bg-fuchsia-950/60 text-fuchsia-400 border border-fuchsia-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(232,121,249,0.2)]',
        badgeColor: 'bg-fuchsia-500'
    }
] as const;

export const FREQUENCIES = [
    { value: 1, label: 'Daily', colorClass: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' },
    { value: 3, label: 'Every 3 Days', colorClass: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' },
    { value: 7, label: 'Weekly', colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    { value: 14, label: 'Bi-Weekly', colorClass: 'bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300' },
    { value: 30, label: 'Monthly', colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    { value: 90, label: 'Quarterly', colorClass: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300' },
    { value: 180, label: 'Every 6 Months', colorClass: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300' },
    { value: 365, label: 'Yearly', colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
] as const;

export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun', fullLabel: 'Sunday', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
    { value: 1, label: 'Mon', fullLabel: 'Monday', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
    { value: 5, label: 'Fri', fullLabel: 'Friday', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' },
] as const;
