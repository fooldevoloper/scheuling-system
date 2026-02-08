import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Edit, Trash2, Calendar, Users, Clock, Loader2 } from 'lucide-react';
import { useClass, useDeleteClass } from '@/hooks';
import { format, parseISO } from 'date-fns';

export function ClassDetailPage() {
    const { classId } = useParams({ from: '/classes/$classId' });

    const { data: classData, isLoading, error } = useClass(classId);
    const deleteClass = useDeleteClass();

    // Log for debugging
    console.log('ClassDetail - classData:', classData);
    console.log('ClassDetail - classId:', classId);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this class?')) {
            try {
                await deleteClass.mutateAsync(classId);
                window.location.href = '/classes';
            } catch (err) {
                console.error('Failed to delete class:', err);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        console.error('ClassDetail - error:', error);
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link to="/classes" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Error</h1>
                    </div>
                </div>
                <div className="card p-8 text-center text-red-500">
                    Failed to load class details. Please check the console for more info.
                </div>
            </div>
        );
    }

    // Handle case where classData might be null/undefined
    if (!classData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link to="/classes" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Not Found</h1>
                    </div>
                </div>
                <div className="card p-8 text-center text-gray-500">
                    No class data received from server.
                </div>
            </div>
        );
    }

    // Extract the class object from the API response
    const apiResponse = classData as unknown as Record<string, unknown>;
    const cls = apiResponse.data as Record<string, unknown> | undefined;

    // Handle case where data might be null
    if (!cls) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link to="/classes" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Not Found</h1>
                    </div>
                </div>
                <div className="card p-8 text-center text-gray-500">
                    Class data is empty.
                </div>
            </div>
        );
    }

    console.log('ClassDetail - cls:', cls);

    // Helper to get string value from object
    const getStr = (obj: Record<string, unknown> | undefined, key: string): string | undefined => {
        if (!obj) return undefined;
        return obj[key] as string | undefined;
    };

    // Helper to get nested object
    const getObj = (obj: Record<string, unknown> | undefined, key: string): Record<string, unknown> | undefined => {
        if (!obj) return undefined;
        return obj[key] as Record<string, unknown> | undefined;
    };

    // Extract class details
    const name = getStr(cls, 'name') || 'Untitled Class';
    const courseCode = getStr(cls, 'courseCode');
    const description = getStr(cls, 'description');
    const classType = getStr(cls, 'classType') || 'single';
    const isActive = cls.isActive as boolean;
    const startDate = getStr(cls, 'startDate');
    const endDate = getStr(cls, 'endDate');
    const startTime = getStr(cls, 'startTime');
    const endTime = getStr(cls, 'endTime');

    // Extract instructor
    const instructor = getObj(cls, 'instructor');
    const instructorName = instructor
        ? (getStr(instructor, 'fullName') || `${getStr(instructor, 'firstName')} ${getStr(instructor, 'lastName')}`)
        : undefined;
    const instructorSpecialization = getStr(instructor, 'specialization');

    // Extract room
    const room = getObj(cls, 'room');
    const roomName = getStr(room, 'name');
    const roomBuilding = getStr(room, 'building');
    const roomFloor = room?.floor as number | undefined;
    const roomType = getObj(room, 'roomType');
    const roomTypeName = getStr(roomType, 'name');
    const roomCapacity = roomType?.capacity as number | undefined;

    // Format recurrence
    const recurrence = getObj(cls, 'recurrence');
    const formatRecurrence = (): string | null => {
        if (!recurrence) return null;

        const pattern = getStr(recurrence, 'pattern') || 'custom';
        const patternLabels: Record<string, string> = {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            custom: 'Custom',
        };

        let details = patternLabels[pattern] || pattern;

        if (pattern === 'weekly') {
            const daysOfWeek = recurrence.daysOfWeek as number[];
            if (daysOfWeek && daysOfWeek.length > 0) {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                details += ` (${daysOfWeek.map(d => days[d]).join(', ')})`;
            }
        }

        if (pattern === 'monthly') {
            const dayOfMonth = recurrence.dayOfMonth as number[];
            if (dayOfMonth && dayOfMonth.length > 0) {
                details += ` (Days: ${dayOfMonth.join(', ')})`;
            }
        }

        const interval = recurrence.interval as number;
        if (interval && interval > 1) {
            details += ` (Every ${interval})`;
        }

        return details;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/classes" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                        {courseCode && <p className="text-gray-500">{courseCode}</p>}
                    </div>
                </div>
                <div className="flex space-x-2">
                    <a href={`/classes/${classId}/edit`} className="btn-secondary">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </a>
                    <button
                        className="btn-danger"
                        onClick={handleDelete}
                        disabled={deleteClass.isPending}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteClass.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Details</h2>
                        <div className="space-y-4">
                            {description && (
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="text-gray-900">{description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Class Type</p>
                                    <p className="font-medium text-gray-900">
                                        {classType === 'single' ? 'Single Class' : 'Recurring Class'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            {formatRecurrence() && (
                                <div>
                                    <p className="text-sm text-gray-500">Recurrence Pattern</p>
                                    <p className="font-medium text-gray-900">{formatRecurrence()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
                        <div className="space-y-4">
                            {startDate && (
                                <div className="flex items-center space-x-4">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {format(parseISO(startDate), 'MMMM d, yyyy')}
                                            {endDate && endDate !== startDate && ` - ${format(parseISO(endDate), 'MMMM d, yyyy')}`}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {classType === 'single' ? 'Single session' : 'Recurring sessions'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {(startTime || endTime) && (
                                <div className="flex items-center space-x-4">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {startTime} - {endTime}
                                        </p>
                                        <p className="text-sm text-gray-500">Class time</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {instructorName && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h2>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{instructorName}</p>
                                    {instructorSpecialization && (
                                        <p className="text-sm text-gray-500">{instructorSpecialization}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {roomName && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Room</h2>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{roomName}</p>
                                    <p className="text-sm text-gray-500">
                                        {roomTypeName || 'Room'} • Capacity: {roomCapacity || 'N/A'}
                                    </p>
                                    {(roomBuilding || roomFloor) && (
                                        <p className="text-xs text-gray-400">
                                            {[roomBuilding, roomFloor && `Floor ${roomFloor}`].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

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
