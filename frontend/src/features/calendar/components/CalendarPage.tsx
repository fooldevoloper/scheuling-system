import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Clock, Users, MapPin, Loader2, X, LayoutGrid, List, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { calendarApi } from '../api/calendarApi';
import type { CalendarEvent, ClassStatus } from '../types/calendar.types';
import { ListView } from './ListView';

// Simplified calendar API response interface
interface CalendarApiEvent {
    id: string;
    classId: string;
    name: string;
    courseCode?: string;
    instructor?: { id?: string; name?: string } | null;
    room?: { id?: string; name?: string } | null;
    date: string;
    startTime: string;
    endTime: string;
    classType: string;
    status: string;
    instanceId?: string;
}

type MainView = 'calendar' | 'list';

const STATUS_COLORS: Record<ClassStatus, { bg: string; border: string; text: string }> = {
    scheduled: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    completed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
};

export function CalendarPage() {
    const calendarRef = useRef<any>(null);
    const [currentView, setCurrentView] = useState<string>('dayGridMonth');
    const [mainView, setMainView] = useState<MainView>('calendar');
    const [calendarData, setCalendarData] = useState<Record<string, unknown[]> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [currentDateRange, setCurrentDateRange] = useState<{ start: string; end: string } | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [refreshKey, setRefreshKey] = useState(0); // Force refresh when status changes
    const lastFetchedRange = useRef<{ start: string; end: string } | null>(null);

    // Fetch calendar data for a date range
    const fetchCalendarData = useCallback(async (startDate: string, endDate: string) => {
        setIsLoading(true);
        try {
            const calendarResponse = await calendarApi.getCalendarData({ startDate, endDate });
            setCalendarData(calendarResponse.data as Record<string, unknown[]>);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const startStr = format(startOfMonth, 'yyyy-MM-dd');
        const endStr = format(endOfMonth, 'yyyy-MM-dd');

        setCurrentDateRange({ start: startStr, end: endStr });
        fetchCalendarData(startStr, endStr);
    }, [fetchCalendarData]);

    // Transform calendar data to CalendarEvent array - simplified
    const calendarEvents = useMemo(() => {
        if (!calendarData) return [];

        const allEvents: CalendarEvent[] = [];

        Object.entries(calendarData).forEach(([dateKey, dayEvents]) => {
            if (Array.isArray(dayEvents)) {
                dayEvents.forEach((eventData: unknown) => {
                    const e = eventData as CalendarApiEvent;

                    allEvents.push({
                        id: e.id,
                        classId: e.classId,
                        title: e.name,
                        date: e.date,
                        startTime: e.startTime,
                        endTime: e.endTime,
                        room: e.room?.name,
                        instructor: e.instructor?.name || undefined,
                        courseCode: e.courseCode,
                        classType: e.classType,
                        status: e.status as ClassStatus,
                        instanceId: e.instanceId,
                    });
                });
            }
        });

        return allEvents;
    }, [calendarData]);

    // Transform to FullCalendar format
    const fullCalendarEvents = useMemo(() => {
        const events = calendarEvents.map(event => ({
            id: event.id,
            title: event.title,
            start: `${event.date}T${event.startTime}:00`,
            end: `${event.date}T${event.endTime}:00`,
            extendedProps: {
                ...event,
            },
            classNames: event.classType === 'recurring' ? ['recurring-event'] : ['single-event'],
            backgroundColor: getEventColor(event),
            borderColor: getEventColor(event),
            textColor: '#ffffff',
        }));

        return events;
    }, [calendarEvents]);

    // Get event color based on status
    function getEventColor(event: CalendarEvent): string {
        // First check status - if cancelled or completed, show that color
        switch (event.status) {
            case 'completed':
                return '#22c55e';
            case 'cancelled':
                return '#ef4444';
            default:
                // For scheduled events, use class type color
                if (event.classType === 'recurring') {
                    return '#8b5cf6';
                }
                return '#3b82f6';
        }
    }

    // Get date range from calendar API when it changes
    const handleDatesSet = useCallback((dateInfo: any) => {
        const view = dateInfo.view?.type || 'dayGridMonth';
        setCurrentView(view);

        // Update currentDate from calendar view
        if (dateInfo.start) {
            setCurrentDate(new Date(dateInfo.start));
        }

        // Get the actual visible date range from FullCalendar
        if (dateInfo.start && dateInfo.end) {
            const startDate = new Date(dateInfo.start);
            const endDate = new Date(dateInfo.end);

            // Subtract one day from end date since FullCalendar uses exclusive end
            endDate.setDate(endDate.getDate() - 1);

            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');

            // Only fetch if date range has actually changed
            if (lastFetchedRange.current?.start !== startStr || lastFetchedRange.current?.end !== endStr) {
                lastFetchedRange.current = { start: startStr, end: endStr };

                // Store the date range for refresh
                setCurrentDateRange({ start: startStr, end: endStr });

                // Fetch data for the new date range
                fetchCalendarData(startStr, endStr);
            }
        }
    }, [fetchCalendarData]);

    // Handle event click
    const handleEventClick = useCallback((clickInfo: any) => {
        const event = clickInfo.event.extendedProps as CalendarEvent;
        if (event.title) {
            setSelectedEvent(event);
        }
    }, []);

    // Handle close modal
    const handleCloseModal = useCallback(() => {
        setSelectedEvent(null);
    }, []);

    // Handle date change from ListView
    const handleDateChange = useCallback((date: Date) => {
        setCurrentDate(date);

        // Update currentDateRange for the date
        const dateStr = format(date, 'yyyy-MM-dd');
        setCurrentDateRange({ start: dateStr, end: dateStr });

        // Also update FullCalendar if in calendar view
        if (mainView === 'calendar' && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (calendarApi) {
                calendarApi.gotoDate(date);
            }
        }
    }, [mainView]);

    // Handle status change
    const handleStatusChange = useCallback(() => {
        // Increment refresh key to force re-render of all views
        setRefreshKey(prev => prev + 1);
        // Clear last fetched range to ensure fresh data
        lastFetchedRange.current = null;
        // Refresh calendar data using stored date range
        if (currentDateRange) {
            fetchCalendarData(currentDateRange.start, currentDateRange.end);
        }
    }, [currentDateRange, fetchCalendarData]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
                    <p className="text-gray-500">
                        {mainView === 'calendar'
                            ? capitalizeFirst(currentView.replace('Grid', ' ').replace('time', '').replace('list', '').trim())
                            : 'List View'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setMainView('calendar')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${mainView === 'calendar'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setMainView('list')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${mainView === 'list'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4 mr-2" />
                            List
                        </button>
                    </div>

                    {isLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            {mainView === 'calendar' ? (
                <>
                    {/* FullCalendar */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <FullCalendar
                            key={refreshKey}
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                            initialView={currentView}
                            initialDate={currentDate}
                            datesSet={handleDatesSet}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            events={fullCalendarEvents}
                            eventClick={handleEventClick}
                            height="auto"
                            slotMinTime="06:00:00"
                            slotMaxTime="22:00:00"
                            allDaySlot={false}
                            weekends={true}
                            editable={false}
                            selectable={false}
                            selectMirror={false}
                            dayMaxEvents={3}
                            nowIndicator={true}
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                meridiem: 'short',
                            }}
                        />
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 bg-white px-4 py-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                            <span>Scheduled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500"></div>
                            <span>Cancelled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-500"></div>
                            <span>Recurring</span>
                        </div>
                    </div>
                </>
            ) : (
                /* List View */
                <ListView
                    key={refreshKey}
                    events={calendarEvents}
                    onStatusChange={handleStatusChange}
                    onDateChange={handleDateChange}
                />
            )}

            {/* Event Modal */}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={handleCloseModal}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
}

// Helper function
function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Status options for status change buttons
const STATUS_OPTIONS: { value: ClassStatus; label: string; color: string; icon: React.ReactNode }[] = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-4 h-4" /> },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
];

// Event Modal Component
function EventModal({ event, onClose, onStatusChange }: { event: CalendarEvent; onClose: () => void; onStatusChange: () => void }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const colors = event.classType === 'recurring'
        ? { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' }
        : { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };

    const statusColors = event.status ? STATUS_COLORS[event.status] : null;

    const handleStatusChange = async (status: ClassStatus) => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            await calendarApi.updateClassStatus(event.classId, {
                status,
                instanceId: event.instanceId
            });
            onStatusChange();
            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusInfo = (status?: string) => {
        if (!status) return STATUS_OPTIONS[0];
        return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    };

    const currentStatusInfo = getStatusInfo(event.status);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`px-6 py-4 border-b ${colors.bg} ${colors.border}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.badge}`}>
                                {event.classType === 'recurring' ? 'Recurring' : 'Single'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusInfo.color}`}>
                                {currentStatusInfo.icon}
                                <span className="ml-1">{currentStatusInfo.label}</span>
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{event.title}</h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Clock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium">{event.startTime} - {event.endTime}</p>
                        </div>
                    </div>

                    {event.room && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Room</p>
                                <p className="font-medium">{event.room}</p>
                            </div>
                        </div>
                    )}

                    {event.instructor && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Instructor</p>
                                <p className="font-medium">{event.instructor}</p>
                            </div>
                        </div>
                    )}

                    {event.courseCode && (
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <CalendarIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Course Code</p>
                                <p className="font-medium">{event.courseCode}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-700">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">{format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                    </div>
                </div>

                {/* Status Change Buttons */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">Change Status:</p>
                    <div className="flex gap-2">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                disabled={isUpdating || event.status === option.value}
                                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${option.value === event.status
                                    ? option.color + ' cursor-default'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    } disabled:opacity-50`}
                            >
                                {option.icon}
                                <span className="ml-1">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
