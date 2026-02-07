import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Plus, Search, Filter, Calendar, Clock, Users, MoreVertical } from 'lucide-react';

// Sample classes data
const sampleClasses = [
    { _id: '1', name: 'Introduction to Python', courseCode: 'CS101', classType: 'single' as const, instructor: 'Dr. John Smith', room: 'Room 101', startDate: '2024-02-15', startTime: '09:00', endTime: '10:30', status: 'active' as const },
    { _id: '2', name: 'Advanced Mathematics', courseCode: 'MATH201', classType: 'recurring' as const, instructor: 'Dr. Jane Doe', room: 'Room 203', startDate: '2024-02-01', startTime: '11:00', endTime: '12:30', status: 'active' as const, recurrence: { pattern: 'weekly' as const, daysOfWeek: [1, 3] } },
    { _id: '3', name: 'Data Structures', courseCode: 'CS201', classType: 'recurring' as const, instructor: 'Prof. Alice Johnson', room: 'Lab A', startDate: '2024-02-01', startTime: '14:00', endTime: '15:30', status: 'active' as const, recurrence: { pattern: 'weekly' as const, daysOfWeek: [2, 4] } },
    { _id: '4', name: 'Web Development', courseCode: 'CS301', classType: 'single' as const, instructor: 'Dr. Bob Williams', room: 'Room 105', startDate: '2024-02-20', startTime: '10:00', endTime: '12:00', status: 'active' as const },
    { _id: '5', name: 'Database Systems', courseCode: 'CS401', classType: 'recurring' as const, instructor: 'Prof. Carol Brown', room: 'Lab B', startDate: '2024-02-05', startTime: '09:00', endTime: '10:30', status: 'active' as const, recurrence: { pattern: 'monthly' as const, dayOfMonth: [5, 20] } },
    { _id: '6', name: 'Machine Learning', courseCode: 'CS501', classType: 'recurring' as const, instructor: 'Dr. John Smith', room: 'Room 301', startDate: '2024-02-01', startTime: '15:00', endTime: '17:00', status: 'inactive' as const, recurrence: { pattern: 'daily' as const } },
];

const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
};

const typeColors = {
    single: 'bg-blue-100 text-blue-700',
    recurring: 'bg-purple-100 text-purple-700',
};

export function ClassesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredClasses = sampleClasses.filter(cls => {
        const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || cls.classType === filterType;
        const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const formatRecurrence = (cls: typeof sampleClasses[0]) => {
        if (cls.classType === 'single') return 'Single Event';
        if (!cls.recurrence) return 'Recurring';

        const patterns: Record<string, string> = {
            daily: 'Daily',
            weekly: `Weekly (${cls.recurrence.daysOfWeek?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')})`,
            monthly: `Monthly (Day ${cls.recurrence.dayOfMonth?.join(', ')})`,
        };
        return patterns[cls.recurrence.pattern] || 'Custom';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
                    <p className="text-gray-500">Manage your class schedules</p>
                </div>
                <Link to="/classes/create" className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Class
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search classes or course codes..."
                            className="input pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="input w-auto"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="single">Single</option>
                            <option value="recurring">Recurring</option>
                        </select>
                        <select
                            className="input w-auto"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                    <div key={cls._id} className="card hover:shadow-md transition-shadow">
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[cls.classType]}`}>
                                            {cls.classType}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[cls.status]}`}>
                                            {cls.status}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mt-2">{cls.name}</h3>
                                    <p className="text-sm text-gray-500">{cls.courseCode}</p>
                                </div>
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{cls.instructor}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{cls.startDate}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{cls.startTime} - {cls.endTime}</span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    <span className="font-medium">Pattern:</span> {formatRecurrence(cls)}
                                </p>
                            </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <Link
                                to="/classes/$classId"
                                params={{ classId: cls._id }}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View Details →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredClasses.length === 0 && (
                <div className="card p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No classes found matching your criteria</p>
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing {filteredClasses.length} of {sampleClasses.length} classes
                </p>
                <div className="flex gap-2">
                    <button className="btn-secondary" disabled>Previous</button>
                    <button className="btn-secondary">Next</button>
                </div>
            </div>
        </div>
    );
}
