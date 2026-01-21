
export const CATEGORIES = [
    {
        id: 'islamic',
        label: 'Islamic',
        colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
        badgeColor: 'bg-emerald-600'
    },
    {
        id: 'friends',
        label: 'Friends',
        colorClass: 'bg-secondary-100 text-secondary-900 dark:bg-secondary-500/20 dark:text-secondary-100',
        badgeColor: 'bg-secondary-500'
    },
    {
        id: 'colleagues',
        label: 'Colleagues',
        colorClass: 'bg-primary-100 text-primary-900 dark:bg-primary-500/20 dark:text-primary-100',
        badgeColor: 'bg-primary-500'
    },
    {
        id: 'network',
        label: 'Network',
        colorClass: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-500/20 dark:text-neutral-100',
        badgeColor: 'bg-neutral-500'
    },
    {
        id: 'other',
        label: 'Other',
        colorClass: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-500/20 dark:text-neutral-100',
        badgeColor: 'bg-neutral-400'
    }
] as const;

export const TEMPLATE_CATEGORIES = [
    ...CATEGORIES,
    {
        id: 'birthday',
        label: 'Birthday',
        colorClass: 'bg-warning/20 text-warning dark:bg-warning/10 dark:text-warning',
        badgeColor: 'bg-warning'
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
