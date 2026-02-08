import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Clock, Users, MapPin, Loader2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { calendarApi } from '../api/calendarApi';
import type { CalendarEvent } from '../types/calendar.types';

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

export function CalendarPage() {
    const calendarRef = useRef<any>(null);
    const [currentView, setCurrentView] = useState<string>('dayGridMonth');
    const [calendarData, setCalendarData] = useState<Record<string, unknown[]> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Fetch calendar data for a date range
    const fetchCalendarData = useCallback(async (startDate: string, endDate: string) => {
        setIsLoading(true);
        try {
            const response = await calendarApi.getCalendarData({ startDate, endDate });
            setCalendarData(response.data as Record<string, unknown[]>);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Transform calendar data to FullCalendar events format
    const events = useMemo(() => {
        if (!calendarData) return [];

        const allEvents: CalendarEvent[] = [];

        Object.entries(calendarData).forEach(([dateKey, dayEvents]) => {
            if (Array.isArray(dayEvents)) {
                dayEvents.forEach((eventData: unknown, index: number) => {
                    const e = eventData as CalendarApiEvent;

                    const instanceDate = e.instanceDate ? parseISO(e.instanceDate) : parseISO(dateKey);
                    const dateStr = format(instanceDate, 'yyyy-MM-dd');

                    const startTime = e.instanceStartTime || e.startTime || '00:00';
                    const endTime = e.instanceEndTime || e.endTime || '00:00';

                    allEvents.push({
                        id: `${e._id || e.id || 'event'}-${dateStr}`,
                        title: e.name || 'Class',
                        date: dateStr,
                        startTime: startTime,
                        endTime: endTime,
                        room: e.room?.name,
                        instructor: e.instructor?.fullName || (e.instructor ? `${e.instructor.firstName} ${e.instructor.lastName}` : undefined),
                        courseCode: e.courseCode,
                        classType: e.classType || 'single',
                        status: e.status,
                    });
                });
            }
        });

        // Convert to FullCalendar event format
        return allEvents.map(event => ({
            id: event.id,
            title: event.title,
            start: `${event.date}T${event.startTime}:00`,
            end: `${event.date}T${event.endTime}:00`,
            extendedProps: {
                ...event,
            },
            classNames: event.classType === 'recurring' ? ['recurring-event'] : ['single-event'],
            backgroundColor: event.classType === 'recurring' ? '#8b5cf6' : '#3b82f6',
            borderColor: event.classType === 'recurring' ? '#7c3aed' : '#2563eb',
            textColor: '#ffffff',
        }));
    }, [calendarData]);

    // Get date range from calendar API when it changes
    const handleDatesSet = useCallback((dateInfo: any) => {
        const view = dateInfo.view?.type || 'dayGridMonth';
        setCurrentView(view);

        // Get the actual visible date range from FullCalendar
        if (dateInfo.start && dateInfo.end) {
            const startDate = new Date(dateInfo.start);
            const endDate = new Date(dateInfo.end);

            // Subtract one day from end date since FullCalendar uses exclusive end
            endDate.setDate(endDate.getDate() - 1);

            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');

            // Fetch data for the new date range
            fetchCalendarData(startStr, endStr);
        }
    }, [fetchCalendarData]);

    // Handle event click
    const handleEventClick = useCallback((clickInfo: any) => {
        const event = clickInfo.event.extendedProps as CalendarEvent;
        setSelectedEvent(event);
    }, []);

    // Handle close modal
    const handleCloseModal = useCallback(() => {
        setSelectedEvent(null);
    }, []);

    // Initial data fetch
    useEffect(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        fetchCalendarData(
            format(startOfMonth, 'yyyy-MM-dd'),
            format(endOfMonth, 'yyyy-MM-dd')
        );
    }, [fetchCalendarData]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-500 capitalize">{currentView.replace('Grid', ' ').replace('time', '').replace('list', '').trim()} View</p>
                </div>
                {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                    </div>
                )}
            </div>

            {/* FullCalendar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    datesSet={handleDatesSet}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                    }}
                    events={events}
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

            {/* Event Modal */}
            {selectedEvent && (
                <EventModal event={selectedEvent} onClose={handleCloseModal} />
            )}

            {/* Legend */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span>Single Class</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500"></div>
                    <span>Recurring Class</span>
                </div>
            </div>
        </div>
    );
}

// Event Modal Component
function EventModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
    const colors = event.classType === 'recurring'
        ? { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' }
        : { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`px-6 py-4 border-b ${colors.bg} ${colors.border}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.badge}`}>
                                {event.classType === 'recurring' ? 'Recurring' : 'Single'}
                            </span>
                            {event.status && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
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
        </div >
    );
}
