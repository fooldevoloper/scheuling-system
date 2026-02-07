import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Edit, Trash2, Calendar, Users, Clock } from 'lucide-react';

export function ClassDetailPage() {
    const { classId } = useParams({ from: '/classes/$classId' });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/classes" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Introduction to Python</h1>
                        <p className="text-gray-500">CS101</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className="btn-secondary">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </button>
                    <button className="btn-danger">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-gray-900">Learn Python basics and fundamentals</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Class Type</p>
                                    <p className="font-medium text-gray-900">Single Class</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">March 15, 2024</p>
                                    <p className="text-sm text-gray-500">Single session</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">09:00 - 10:30</p>
                                    <p className="text-sm text-gray-500">1 hour 30 minutes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h2>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Dr. John Smith</p>
                                <p className="text-sm text-gray-500">Computer Science</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Room</h2>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Room 101</p>
                                <p className="text-sm text-gray-500">Lecture Hall • Capacity: 50</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button className="w-full btn-secondary justify-start">
                                <Calendar className="w-4 h-4 mr-2" />
                                Reschedule
                            </button>
                            <button className="w-full btn-secondary justify-start">
                                <Users className="w-4 h-4 mr-2" />
                                Change Instructor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
