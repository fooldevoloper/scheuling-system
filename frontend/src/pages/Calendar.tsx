import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

// Sample calendar events
const sampleEvents = [
    { id: '1', title: 'Introduction to Python', date: new Date(2024, 1, 5), startTime: '09:00', endTime: '10:30', room: 'Room 101', instructor: 'Dr. John Smith', type: 'class' as const },
    { id: '2', title: 'Advanced Mathematics', date: new Date(2024, 1, 5), startTime: '11:00', endTime: '12:30', room: 'Room 203', instructor: 'Dr. Jane Doe', type: 'class' as const },
    { id: '3', title: 'Data Structures', date: new Date(2024, 1, 6), startTime: '14:00', endTime: '15:30', room: 'Lab A', instructor: 'Prof. Alice Johnson', type: 'class' as const },
    { id: '4', title: 'Web Development', date: new Date(2024, 1, 7), startTime: '10:00', endTime: '12:00', room: 'Room 105', instructor: 'Dr. Bob Williams', type: 'class' as const },
    { id: '5', title: 'Database Systems', date: new Date(2024, 1, 8), startTime: '09:00', endTime: '10:30', room: 'Lab B', instructor: 'Prof. Carol Brown', type: 'class' as const },
    { id: '6', title: 'Machine Learning', date: new Date(2024, 1, 9), startTime: '15:00', endTime: '17:00', room: 'Room 301', instructor: 'Dr. John Smith', type: 'class' as const },
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState<'month' | 'week'>('month');

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfMonth(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const getEventsForDay = (date: Date) => {
        return sampleEvents.filter(event => isSameDay(event.date, date));
    };

    const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-500">View and manage your class schedule</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${view === 'month' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700'}`}
                        onClick={() => setView('month')}
                    >
                        Month
                    </button>
                    <button
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border ${view === 'week' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-700'}`}
                        onClick={() => setView('week')}
                    >
                        Week
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-3 card overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
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

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {days.map((day) => {
                            const dayEvents = getEventsForDay(day);
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                            const isCurrentDay = isToday(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={`min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors cursor-pointer hover:bg-gray-50 ${!isCurrentMonth ? 'bg-gray-50' : ''
                                        } ${selectedDate && isSameDay(day, selectedDate) ? 'bg-primary-50' : ''}`}
                                    onClick={() => setSelectedDate(day)}
                                >
                                    <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${isCurrentDay
                                            ? 'bg-primary-600 text-white font-medium'
                                            : isCurrentMonth
                                                ? 'text-gray-900'
                                                : 'text-gray-400'
                                        }`}>
                                        {format(day, 'd')}
                                    </span>
                                    <div className="mt-1 space-y-1">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div
                                                key={event.id}
                                                className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded truncate"
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-xs text-gray-500 pl-1">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Events */}
                <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                    </h3>
                    {selectedDate ? (
                        selectedDateEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateEvents.map((event) => (
                                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                {event.startTime} - {event.endTime}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                {event.room}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                {event.instructor}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No classes scheduled</p>
                            </div>
                        )
                    ) : (
                        <p className="text-gray-500 text-center py-8">Click on a date to view events</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function endOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + (7 - d.getDay()));
    return d;
}

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d;
}
