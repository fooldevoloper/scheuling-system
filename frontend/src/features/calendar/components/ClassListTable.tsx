import { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent, ClassStatus } from '../types/calendar.types';
import { calendarApi } from '../api/calendarApi';
import {
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    User,
    MapPin,
    CalendarIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface ClassListTableProps {
    events: CalendarEvent[];
    onStatusChange: () => void;
}

const STATUS_OPTIONS: { value: ClassStatus; label: string; color: string; icon: React.ReactNode }[] = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-4 h-4" /> },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
];

interface DropdownPosition {
    top: number;
    left: number;
}

export function ClassListTable({ events, onStatusChange }: ClassListTableProps) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });
    const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const handleStatusChange = useCallback(async (eventId: string, classId: string, status: ClassStatus, instanceId?: string) => {
        setUpdatingId(eventId);
        setOpenDropdown(null);
        try {
            await calendarApi.updateClassStatus(classId, { status, instanceId });
            onStatusChange();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdatingId(null);
        }
    }, [onStatusChange]);

    const getStatusInfo = (status?: string) => {
        if (!status) return STATUS_OPTIONS[0];
        return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    };

    const sortedEvents = [...events].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
    });

    const handleDropdownToggle = useCallback((eventId: string) => {
        if (openDropdown === eventId) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(eventId);
            // Calculate position based on button position
            const button = buttonRefs.current.get(eventId);
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.right - 192 // 192px = w-48 (12rem) + right positioning
                });
            }
        }
    }, [openDropdown]);

    // Update dropdown position when window is resized
    useEffect(() => {
        if (openDropdown) {
            const button = buttonRefs.current.get(openDropdown);
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.right - 192
                });
            }
        }
    }, [openDropdown, events.length]);

    return (
        <div className="bg-white rounded-lg shadow overflow-visible min-h-[200px]">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Instructor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Room
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedEvents.map((event) => {
                            const statusInfo = getStatusInfo(event.status);
                            const isUpdating = updatingId === event.id;

                            return (
                                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {format(new Date(event.date), 'MMM dd, yyyy')}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {event.startTime} - {event.endTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {event.title}
                                        </div>
                                        {event.courseCode && (
                                            <div className="text-xs text-gray-500">
                                                {event.courseCode}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.instructor ? (
                                            <div className="flex items-center text-sm text-gray-900">
                                                <User className="w-4 h-4 mr-1 text-gray-400" />
                                                {event.instructor}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.room ? (
                                            <div className="flex items-center text-sm text-gray-900">
                                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                {event.room}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                            {statusInfo.icon}
                                            <span className="ml-1">{statusInfo.label}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium overflow-visible whitespace-normal">
                                        <div className="relative">
                                            <button
                                                ref={(el) => {
                                                    if (el) buttonRefs.current.set(event.id, el);
                                                    else buttonRefs.current.delete(event.id);
                                                }}
                                                onClick={() => handleDropdownToggle(event.id)}
                                                disabled={isUpdating}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {isUpdating ? (
                                                    <span className="animate-pulse">Updating...</span>
                                                ) : (
                                                    <>
                                                        <MoreHorizontal className="w-4 h-4 mr-1" />
                                                        Change Status
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {events.length === 0 && (
                <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
                    <p className="mt-1 text-sm text-gray-500">No classes scheduled for this period.</p>
                </div>
            )}

            {/* Fixed Position Dropdown */}
            {openDropdown && (
                <>
                    <div
                        className="fixed w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        style={{
                            top: dropdownPosition.top,
                            ...(dropdownPosition.left > 0
                                ? { left: dropdownPosition.left }
                                : { right: 16 })
                        }}
                    >
                        <div className="py-1" role="menu">
                            {STATUS_OPTIONS.map((option) => {
                                const event = events.find(e => e.id === openDropdown);
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => event && handleStatusChange(event.id, event.classId, option.value, event.instanceId)}
                                        className={`w-full flex items-center px-4 py-2 text-sm text-left hover:bg-gray-100 ${event && option.value === event.status ? 'bg-blue-50' : ''}`}
                                    >
                                        <span className={`mr-2 ${event && option.value === event.status ? 'opacity-100' : 'opacity-0'}`}>
                                            ✓
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${option.color}`}>
                                            {option.icon}
                                            <span className="ml-1">{option.label}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Click outside to close dropdown */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenDropdown(null)}
                    />
                </>
            )}
        </div>
    );
}
