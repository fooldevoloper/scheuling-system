import { Link } from '@tanstack/react-router';
import { Calendar, BookOpen, Users, DoorOpen, TrendingUp, Clock } from 'lucide-react';

// Sample data
const todayClasses = [
    { id: '1', name: 'Introduction to Python', time: '09:00 - 10:30', room: 'Room 101', instructor: 'Dr. John Smith', status: 'in-progress' as const },
    { id: '2', name: 'Advanced Mathematics', time: '11:00 - 12:30', room: 'Room 203', instructor: 'Dr. Jane Doe', status: 'scheduled' as const },
    { id: '3', name: 'Data Structures', time: '14:00 - 15:30', room: 'Lab A', instructor: 'Prof. Alice Johnson', status: 'scheduled' as const },
    { id: '4', name: 'Web Development', time: '16:00 - 17:30', room: 'Room 105', instructor: 'Dr. Bob Williams', status: 'scheduled' as const },
];

const recentActivities = [
    { id: '1', action: 'Class Created', description: 'Introduction to Python was created', time: '2 hours ago' },
    { id: '2', action: 'Schedule Updated', description: 'Advanced Mathematics time changed', time: '4 hours ago' },
    { id: '3', action: 'Room Added', description: 'Lab B was added to the system', time: '1 day ago' },
    { id: '4', action: 'Instructor Added', description: 'Prof. Carol Brown joined', time: '2 days ago' },
];

export function DashboardPage() {
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <BookOpen className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">+12%</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">24</p>
                        <p className="text-sm text-gray-500">Total Classes</p>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">+2</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-sm text-gray-500">Scheduled Today</p>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <DoorOpen className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">0</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">12</p>
                        <p className="text-sm text-gray-500">Active Rooms</p>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">+3</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-900">15</p>
                        <p className="text-sm text-gray-500">Instructors</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 card">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                        <p className="text-sm text-gray-500">Friday, February 7, 2024</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {todayClasses.map((cls) => (
                            <div key={cls.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <span className={`w-2 h-2 rounded-full ${cls.status === 'in-progress' ? 'bg-green-500' : 'bg-gray-300'
                                                }`} />
                                            <div>
                                                <p className="font-medium text-gray-900">{cls.name}</p>
                                                <p className="text-sm text-gray-500">{cls.room} • {cls.time}</p>
                                                <p className="text-sm text-gray-400">{cls.instructor}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${cls.status === 'in-progress'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {cls.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
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

                    {/* Recent Activity */}
                    <div className="card p-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-sm text-gray-500">{activity.description}</p>
                                        <p className="text-xs text-gray-400">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
