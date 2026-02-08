import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Clock, Users, MapPin, Loader2, X, LayoutGrid, List, Calendar } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { calendarApi, ExclusionInfo } from '../api/calendarApi';
import type { CalendarEvent, ClassStatus } from '../types/calendar.types';
import { ListView } from './ListView';

interface CalendarApiEvent {
    _id?: string;
    id?: string;
    name?: string;
    instanceDate?: string;
    instanceStartTime?: string;
    instanceEndTime?: string;
    startTime?: string;
    endTime?: string;
    room?: { name?: string; _id?: string };
    instructor?: { fullName?: string; firstName?: string; lastName?: string };
    courseCode?: string;
    classType?: string;
    status?: string;
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
    const [exclusionDates, setExclusionDates] = useState<ExclusionInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [currentDateRange, setCurrentDateRange] = useState<{ start: string; end: string } | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch calendar data for a date range
    const fetchCalendarData = useCallback(async (startDate: string, endDate: string) => {
        setIsLoading(true);
        try {
            const [calendarResponse, exclusionsResponse] = await Promise.all([
                calendarApi.getCalendarData({ startDate, endDate }),
                calendarApi.getExclusionDates({ startDate, endDate })
            ]);
            setCalendarData(calendarResponse.data as Record<string, unknown[]>);
            setExclusionDates(exclusionsResponse.data || []);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Transform calendar data to CalendarEvent array
    const calendarEvents = useMemo(() => {
        if (!calendarData) return [];

        const allEvents: CalendarEvent[] = [];

        Object.entries(calendarData).forEach(([dateKey, dayEvents]) => {
            if (Array.isArray(dayEvents)) {
                dayEvents.forEach((eventData: unknown) => {
                    const e = eventData as CalendarApiEvent;

                    const instanceDate = e.instanceDate ? parseISO(e.instanceDate) : parseISO(dateKey);
                    const dateStr = format(instanceDate, 'yyyy-MM-dd');

                    const startTime = e.instanceStartTime || e.startTime || '00:00';
                    const endTime = e.instanceEndTime || e.endTime || '00:00';

                    allEvents.push({
                        id: `${e._id || e.id || 'event'}-${dateStr}`,
                        classId: e._id || e.id || '',
                        title: e.name || 'Class',
                        date: dateStr,
                        startTime: startTime,
                        endTime: endTime,
                        room: e.room?.name,
                        instructor: e.instructor?.fullName || (e.instructor ? `${e.instructor.firstName} ${e.instructor.lastName}` : undefined),
                        courseCode: e.courseCode,
                        classType: e.classType || 'single',
                        status: e.status as ClassStatus,
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

        // Add exclusion dates as background events
        const exclusionEvents = exclusionDates.map((exclusion, index) => ({
            id: `exclusion-${index}`,
            title: '',
            start: exclusion.date,
            end: exclusion.date,
            allDay: true,
            display: 'background',
            backgroundColor: '#fee2e2',
            borderColor: '#fecaca',
            textColor: '#991b1b',
            classNames: ['exclusion-event'],
        }));

        return [...events, ...exclusionEvents];
    }, [calendarEvents, exclusionDates]);

    // Get event color based on status
    function getEventColor(event: CalendarEvent): string {
        if (event.classType === 'recurring') {
            return '#8b5cf6';
        }
        switch (event.status) {
            case 'completed':
                return '#22c55e';
            case 'cancelled':
                return '#ef4444';
            default:
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

            // Store the date range for refresh
            setCurrentDateRange({ start: startStr, end: endStr });

            // Fetch data for the new date range
            fetchCalendarData(startStr, endStr);
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

        // Also update FullCalendar if in calendar view
        if (mainView === 'calendar' && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            if (calendarApi) {
                calendarApi.gotoDate(date);
            }
        }
    }, [mainView]);

    // Handle fetch range from ListView
    const handleFetchRange = useCallback((start: string, end: string) => {
        setCurrentDateRange({ start, end });
        fetchCalendarData(start, end);
    }, [fetchCalendarData]);

    // Handle status change
    const handleStatusChange = useCallback(() => {
        // Refresh calendar data using stored date range
        if (currentDateRange) {
            fetchCalendarData(currentDateRange.start, currentDateRange.end);
        }
    }, [currentDateRange, fetchCalendarData]);

    // Initial data fetch
    useEffect(() => {
        const today = new Date();
        // For month view (default), fetch from first to last day of current month
        const startOfMonthDate = startOfMonth(today);
        const endOfMonthDate = endOfMonth(today);

        const startStr = format(startOfMonthDate, 'yyyy-MM-dd');
        const endStr = format(endOfMonthDate, 'yyyy-MM-dd');

        // Store initial date range
        setCurrentDateRange({ start: startStr, end: endStr });

        fetchCalendarData(startStr, endStr);
    }, [fetchCalendarData]);

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
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-200"></div>
                            <span>Excluded Date</span>
                        </div>
                    </div>
                </>
            ) : (
                /* List View */
                <ListView
                    events={calendarEvents}
                    onStatusChange={handleStatusChange}
                    onFetchRange={handleFetchRange}
                />
            )}

            {/* Event Modal */}
            {selectedEvent && (
                <EventModal event={selectedEvent} onClose={handleCloseModal} />
            )}
        </div>
    );
}

// Helper function
function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event Modal Component
function EventModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
    const colors = event.classType === 'recurring'
        ? { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' }
        : { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };

    const statusColors = event.status ? STATUS_COLORS[event.status] : null;

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
                            {event.status && statusColors && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.border} ${statusColors.text}`}>
                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1).replace('-', ' ')}
                                </span>
                            )}
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

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
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
