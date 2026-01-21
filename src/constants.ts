
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
    { value: 1, label: 'Daily', colorClass: 'bg-red-950/60 text-red-400 border border-red-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(248,113,113,0.2)]' },
    { value: 3, label: 'Every 3 Days', colorClass: 'bg-orange-950/60 text-orange-400 border border-orange-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(251,146,60,0.2)]' },
    { value: 7, label: 'Weekly', colorClass: 'bg-amber-950/60 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(251,191,36,0.2)]' },
    { value: 14, label: 'Bi-Weekly', colorClass: 'bg-lime-950/60 text-lime-400 border border-lime-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(163,230,53,0.2)]' },
    { value: 30, label: 'Monthly', colorClass: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(52,211,153,0.2)]' },
    { value: 90, label: 'Quarterly', colorClass: 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.2)]' },
    { value: 180, label: 'Every 6 Months', colorClass: 'bg-sky-950/60 text-sky-400 border border-sky-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(56,189,248,0.2)]' },
    { value: 365, label: 'Yearly', colorClass: 'bg-blue-950/60 text-blue-400 border border-blue-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(96,165,250,0.2)]' },
] as const;

export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sun', fullLabel: 'Sunday', colorClass: 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.2)]' },
    { value: 1, label: 'Mon', fullLabel: 'Monday', colorClass: 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.2)]' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday', colorClass: 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.2)]' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday', colorClass: 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.2)]' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday', colorClass: 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.2)]' },
    { value: 5, label: 'Fri', fullLabel: 'Friday', colorClass: 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.2)]' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday', colorClass: 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(129,140,248,0.2)]' },
] as const;
