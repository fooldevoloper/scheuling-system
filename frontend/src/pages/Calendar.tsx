import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO, addDays } from 'date-fns';
import { useCalendar } from '@/hooks';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    room?: string;
    instructor?: string;
    courseCode?: string;
    classType: string;
}

export function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    // Format dates for API call
    const startDateStr = format(monthStart, 'yyyy-MM-dd');
    const endDateStr = format(monthEnd, 'yyyy-MM-dd');

    // Fetch calendar data from API
    const { data: calendarData, isLoading, error } = useCalendar({
        startDate: startDateStr,
        endDate: endDateStr,
    });

    // Transform API data to calendar events - handle date-keyed object format
    const eventsMap = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};

        if (!calendarData?.data) return map;

        const data = calendarData.data as Record<string, unknown[]>;

        Object.entries(data).forEach(([dateKey, events]) => {
            if (Array.isArray(events)) {
                map[dateKey] = events.map((event: unknown, index: number) => {
                    const e = event as {
                        _id?: string;
                        id?: string;
                        name?: string;
                        instanceDate?: string;
                        instanceStartTime?: string;
                        instanceEndTime?: string;
                        startTime?: string;
                        endTime?: string;
                        room?: { name?: string };
                        instructor?: { firstName?: string; lastName?: string; fullName?: string };
                        courseCode?: string;
                        classType?: string;
                    };

                    // Use instanceDate if available, otherwise use the dateKey
                    const eventDate = e.instanceDate ? parseISO(e.instanceDate) : parseISO(dateKey);

                    return {
                        id: e._id || e.id || `${dateKey}-${index}`,
                        title: e.name || 'Class',
                        date: eventDate,
                        startTime: e.instanceStartTime || e.startTime || '00:00',
                        endTime: e.instanceEndTime || e.endTime || '00:00',
                        room: e.room?.name,
                        instructor: e.instructor?.fullName || (e.instructor ? `${e.instructor.firstName} ${e.instructor.lastName}` : undefined),
                        courseCode: e.courseCode,
                        classType: e.classType || 'single',
                    };
                });
            }
        });

        return map;
    }, [calendarData]);

    // Get all days in the calendar view
    const days = useMemo(() => {
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [calendarStart, calendarEnd]);

    // Get events for a specific day
    const getEventsForDay = useCallback((date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return eventsMap[dateKey] || [];
    }, [eventsMap]);

    const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

    // Get event color based on class type
    const getEventColor = (classType: string) => {
        if (classType === 'recurring') {
            return 'bg-purple-100 text-purple-700 border-purple-200';
        }
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-500">View and manage your class schedule</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-3 card overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 border-b border-gray-200">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="px-4 py-3 text-sm font-medium text-gray-500 text-center bg-gray-50"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12 text-red-500">
                            Failed to load calendar data
                        </div>
                    ) : (
                        /* Calendar Grid */
                        <div className="grid grid-cols-7">
                            {days.map((day) => {
                                const dayEvents = getEventsForDay(day);
                                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                const isCurrentDay = isToday(day);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const dateKey = format(day, 'yyyy-MM-dd');

                                return (
                                    <div
                                        key={dateKey}
                                        className={`min-h-[140px] border-b border-r border-gray-100 p-2 transition-colors cursor-pointer hover:bg-gray-50 ${!isCurrentMonth ? 'bg-gray-50' : ''
                                            } ${isSelected ? 'bg-primary-50 ring-2 ring-primary-500 ring-inset' : ''}`}
                                        onClick={() => setSelectedDate(day)}
                                    >
                                        <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1 ${isCurrentDay
                                            ? 'bg-primary-600 text-white font-bold shadow-md'
                                            : isCurrentMonth
                                                ? 'text-gray-900'
                                                : 'text-gray-400'
                                            }`}>
                                            {format(day, 'd')}
                                        </span>
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={`px-2 py-1 text-xs rounded border ${getEventColor(event.classType)} truncate`}
                                                    title={`${event.title} (${event.startTime} - ${event.endTime})`}
                                                >
                                                    <span className="font-medium">{event.startTime}</span> {event.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-gray-500 pl-1 font-medium">
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Selected Date Events */}
                <div className="card p-4 h-fit sticky top-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                    </h3>
                    {selectedDate ? (
                        selectedDateEvents.length > 0 ? (
                            <div className="space-y-3">
                                {selectedDateEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`p-3 rounded-lg border ${getEventColor(event.classType)}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                            <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                                                {event.classType === 'recurring' ? 'Recurring' : 'Single'}
                                            </span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="font-medium">{event.startTime} - {event.endTime}</span>
                                            </div>
                                            {event.room && (
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                    <span>{event.room}</span>
                                                </div>
                                            )}
                                            {event.instructor && (
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                                                    <span>{event.instructor}</span>
                                                </div>
                                            )}
                                            {event.courseCode && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Code: {event.courseCode}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-500">No classes scheduled</p>
                                <p className="text-sm text-gray-400 mt-1">{format(selectedDate, 'MMMM d, yyyy')}</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-8">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">Click on a date to view events</p>
                        </div>
                    )}

                    {/* Quick Navigation */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Quick Navigation</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setSelectedDate(new Date())}
                                className="px-3 py-2 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
                            >
                                Go to Today
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
