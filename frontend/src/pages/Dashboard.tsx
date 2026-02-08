import { Link } from '@tanstack/react-router';
import { Calendar, BookOpen, Users, DoorOpen, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { useClasses, useInstructors, useRooms, useRoomTypes, useCalendar } from '@/hooks';
import type { ClassInstance, Class } from '@/types';

export function DashboardPage() {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

    const { data: classesData, isLoading: loadingClasses } = useClasses({ limit: 100 });
    const { data: instructorsData, isLoading: loadingInstructors } = useInstructors();
    const { data: roomsData, isLoading: loadingRooms } = useRooms();
    const { data: roomTypesData, isLoading: loadingRoomTypes } = useRoomTypes();
    const { data: calendarData, isLoading: loadingCalendar } = useCalendar({
        startDate: todayStr,
        endDate: weekEndStr,
    });

    const classes: Class[] = ((classesData?.data?.data || []) as unknown) as Class[];
    const instructors = ((instructorsData?.data?.data || []) as unknown) as { _id: string }[];
    const rooms = ((roomsData?.data?.data || []) as unknown) as { _id: string; isActive: boolean }[];
    const roomTypes = ((roomTypesData?.data?.data || []) as unknown) as { _id: string }[];

    const calendarInstances = ((calendarData?.data as { data?: ClassInstance[] })?.data || []) as ClassInstance[];

    // Filter today's classes
    const todayClasses = calendarInstances.filter(instance => {
        const instanceDate = parseISO(instance.date);
        return isToday(instanceDate);
    }).slice(0, 5);

    const isLoading = loadingClasses || loadingInstructors || loadingRooms || loadingRoomTypes || loadingCalendar;

    const stats = [
        {
            label: 'Total Classes',
            value: classes.length,
            icon: BookOpen,
            color: 'primary',
            change: '+12%',
            changeColor: 'text-green-600',
        },
        {
            label: 'Scheduled Today',
            value: todayClasses.length,
            icon: Clock,
            color: 'green',
            change: '+2',
            changeColor: 'text-green-600',
        },
        {
            label: 'Active Rooms',
            value: rooms.filter(r => r.isActive).length,
            icon: DoorOpen,
            color: 'purple',
            change: '0',
            changeColor: 'text-gray-500',
        },
        {
            label: 'Instructors',
            value: instructors.length,
            icon: Users,
            color: 'orange',
            change: '+3',
            changeColor: 'text-green-600',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome to Plex-Bit Class Scheduling System</p>
                </div>
                <Link to="/classes/create" className="btn-primary">
                    <Calendar className="w-4 h-4 mr-2" />
                    New Class
                </Link>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="card p-6">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
                                        <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                                    </div>
                                    <span className={`text-sm font-medium ${stat.changeColor}`}>{stat.change}</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Today's Schedule */}
                        <div className="lg:col-span-2 card">
                            <div className="p-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                                <p className="text-sm text-gray-500">{format(today, 'EEEE, MMMM d, yyyy')}</p>
                            </div>
                            {todayClasses.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {todayClasses.map((cls) => (
                                        <div key={cls._id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {(cls as unknown as { className?: string }).className || 'Class'}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {cls.room?.name || 'TBD'} • {cls.startTime} - {cls.endTime}
                                                            </p>
                                                            <p className="text-sm text-gray-400">
                                                                {cls.instructor ? `${cls.instructor.firstName} ${cls.instructor.lastName}` : 'Instructor TBD'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${cls.status === 'scheduled'
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : cls.status === 'completed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No classes scheduled for today</p>
                                </div>
                            )}
                            <div className="p-4 border-t border-gray-100">
                                <Link to="/calendar" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                    View Full Calendar →
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="card p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        to="/classes/create"
                                        className="flex flex-col items-center justify-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                    >
                                        <Calendar className="w-8 h-8 text-primary-600 mb-2" />
                                        <span className="text-sm font-medium text-primary-700">Schedule Class</span>
                                    </Link>
                                    <Link
                                        to="/classes"
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <BookOpen className="w-8 h-8 text-gray-600 mb-2" />
                                        <span className="text-sm font-medium text-gray-700">View Classes</span>
                                    </Link>
                                    <Link
                                        to="/calendar"
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <TrendingUp className="w-8 h-8 text-gray-600 mb-2" />
                                        <span className="text-sm font-medium text-gray-700">Calendar</span>
                                    </Link>
                                    <Link
                                        to="/rooms"
                                        className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <DoorOpen className="w-8 h-8 text-gray-600 mb-2" />
                                        <span className="text-sm font-medium text-gray-700">Manage Rooms</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Recent Activity Placeholder */}
                            <div className="card p-4">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Room Types</span>
                                        <span className="font-medium text-gray-900">{roomTypes.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total Rooms</span>
                                        <span className="font-medium text-gray-900">{rooms.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Active Classes</span>
                                        <span className="font-medium text-gray-900">{classes.filter(c => c.isActive).length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
