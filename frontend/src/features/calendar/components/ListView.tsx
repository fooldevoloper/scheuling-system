import { useState, useMemo, useCallback, useEffect } from 'react';
import { CalendarEvent } from '../types/calendar.types';
import { ClassListTable } from './ClassListTable';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, Clock } from 'lucide-react';

interface ListViewProps {
    events: CalendarEvent[];
    onStatusChange: () => void;
    onFetchRange?: (start: string, end: string) => void;
}

type ListViewType = 'day' | 'week' | 'month';

export function ListView({ events, onStatusChange, onFetchRange }: ListViewProps) {
    const [viewType, setViewType] = useState<ListViewType>('week');
    const [displayedDate, setDisplayedDate] = useState(new Date());

    // Get the displayed month start and end
    const displayedMonth = useMemo(() => startOfMonth(displayedDate), [displayedDate]);
    const displayedMonthEnd = useMemo(() => endOfMonth(displayedDate), [displayedDate]);

    // Get current week range (based on displayedDate)
    const currentWeekRange = useMemo(() => {
        const weekStart = startOfWeek(displayedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(displayedDate, { weekStartsOn: 1 });

        return {
            start: weekStart,
            end: weekEnd,
            label: `Week ${format(weekStart, 'd')} - ${format(weekEnd, 'MMM d, yyyy')}`,
            shortLabel: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
        };
    }, [displayedDate]);

    // Get fetch date range
    const fetchRange = useMemo(() => {
        if (viewType === 'month') {
            return {
                start: format(displayedMonth, 'yyyy-MM-dd'),
                end: format(displayedMonthEnd, 'yyyy-MM-dd')
            };
        }

        if (viewType === 'day') {
            return {
                start: format(displayedDate, 'yyyy-MM-dd'),
                end: format(displayedDate, 'yyyy-MM-dd')
            };
        }

        // Week view - fetch week range
        return {
            start: format(currentWeekRange.start, 'yyyy-MM-dd'),
            end: format(currentWeekRange.end, 'yyyy-MM-dd')
        };
    }, [viewType, displayedDate, displayedMonth, displayedMonthEnd, currentWeekRange]);

    // Fetch data when fetchRange changes
    useEffect(() => {
        if (onFetchRange) {
            onFetchRange(fetchRange.start, fetchRange.end);
        }
    }, [fetchRange, onFetchRange]);

    // Filter events for month view
    const monthEvents = useMemo(() => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= displayedMonth && eventDate <= displayedMonthEnd;
        });
    }, [events, displayedMonth, displayedMonthEnd]);

    // Filter events for day view
    const dayEvents = useMemo(() => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return format(eventDate, 'yyyy-MM-dd') === format(displayedDate, 'yyyy-MM-dd');
        });
    }, [events, displayedDate]);

    // Filter events for week view
    const weekEvents = useMemo(() => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= currentWeekRange.start && eventDate <= currentWeekRange.end;
        });
    }, [events, currentWeekRange]);

    // Navigation handlers
    const goToPreviousDay = useCallback(() => {
        setDisplayedDate(subDays(displayedDate, 1));
    }, [displayedDate]);

    const goToNextDay = useCallback(() => {
        setDisplayedDate(addDays(displayedDate, 1));
    }, [displayedDate]);

    const goToPreviousWeek = useCallback(() => {
        setDisplayedDate(subWeeks(displayedDate, 1));
    }, [displayedDate]);

    const goToNextWeek = useCallback(() => {
        setDisplayedDate(addWeeks(displayedDate, 1));
    }, [displayedDate]);

    const goToPreviousMonth = useCallback(() => {
        setDisplayedDate(subMonths(displayedDate, 1));
    }, [displayedDate]);

    const goToNextMonth = useCallback(() => {
        setDisplayedDate(addMonths(displayedDate, 1));
    }, [displayedDate]);

    const goToToday = useCallback(() => {
        setDisplayedDate(new Date());
    }, []);

    const handleViewChange = useCallback((newViewType: ListViewType) => {
        setViewType(newViewType);
        // Always reset to today when switching views
        setDisplayedDate(new Date());
    }, []);

    const getNavigationLabel = () => {
        switch (viewType) {
            case 'day':
                return format(displayedDate, 'EEEE, MMMM d, yyyy');
            case 'week':
                return currentWeekRange.label;
            case 'month':
                return format(displayedDate, 'MMMM yyyy');
        }
    };

    const handlePrev = () => {
        switch (viewType) {
            case 'day':
                return goToPreviousDay();
            case 'week':
                return goToPreviousWeek();
            case 'month':
                return goToPreviousMonth();
        }
    };

    const handleNext = () => {
        switch (viewType) {
            case 'day':
                return goToNextDay();
            case 'week':
                return goToNextWeek();
            case 'month':
                return goToNextMonth();
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg shadow">
                {/* View Type Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => handleViewChange('day')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewType === 'day'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Day
                    </button>
                    <button
                        onClick={() => handleViewChange('week')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewType === 'week'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        Week
                    </button>
                    <button
                        onClick={() => handleViewChange('month')}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewType === 'month'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Month
                    </button>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={goToToday}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isToday(displayedDate)
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                            }`}
                    >
                        Today
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <span className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                            {getNavigationLabel()}
                        </span>

                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Day View */}
            {viewType === 'day' && (
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {format(displayedDate, 'EEEE, MMMM d, yyyy')}
                        </h2>
                    </div>
                    <ClassListTable events={dayEvents} onStatusChange={onStatusChange} />
                </div>
            )}

            {/* Week View - Show current week only */}
            {viewType === 'week' && (
                <div className="space-y-4">
                    {/* Week Header */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {currentWeekRange.label}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {format(currentWeekRange.start, 'EEEE, MMMM d, yyyy')} - {format(currentWeekRange.end, 'EEEE, MMMM d, yyyy')}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {weekEvents.length} classes
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Total Classes</div>
                            <div className="text-2xl font-bold text-gray-900">{weekEvents.length}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Scheduled</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {weekEvents.filter(e => e.status === 'scheduled').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Completed</div>
                            <div className="text-2xl font-bold text-green-600">
                                {weekEvents.filter(e => e.status === 'completed').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Cancelled</div>
                            <div className="text-2xl font-bold text-red-600">
                                {weekEvents.filter(e => e.status === 'cancelled').length}
                            </div>
                        </div>
                    </div>

                    <ClassListTable events={weekEvents} onStatusChange={onStatusChange} />
                </div>
            )}

            {/* Month View - Table format */}
            {viewType === 'month' && (
                <div className="space-y-4">
                    {/* Month Header */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {format(displayedDate, 'MMMM yyyy')}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {format(displayedMonth, 'MMMM d')} - {format(displayedMonthEnd, 'MMMM d, yyyy')}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {monthEvents.length} classes
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Total Classes</div>
                            <div className="text-2xl font-bold text-gray-900">{monthEvents.length}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Scheduled</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {monthEvents.filter(e => e.status === 'scheduled').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Completed</div>
                            <div className="text-2xl font-bold text-green-600">
                                {monthEvents.filter(e => e.status === 'completed').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-500">Cancelled</div>
                            <div className="text-2xl font-bold text-red-600">
                                {monthEvents.filter(e => e.status === 'cancelled').length}
                            </div>
                        </div>
                    </div>

                    {/* Month Table - Shows all classes for the month */}
                    <ClassListTable events={monthEvents} onStatusChange={onStatusChange} />
                </div>
            )}
        </div>
    );
}
