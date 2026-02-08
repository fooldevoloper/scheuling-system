import { useState, useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useClass, useInstructors, useRoomTypes, useRooms, useUpdateClass } from '@/hooks';
import type { RecurrencePattern, Instructor, RoomType, Room } from '@/types';

type ClassType = 'single' | 'recurring';

interface TimeSlot {
    startTime: string;
    endTime: string;
}

export function EditClassPage() {
    const { classId } = useParams({ from: '/classes/$classId/edit' });

    const { data: classData, isLoading, error } = useClass(classId);
    const { data: instructorsData } = useInstructors();
    const { data: roomTypesData } = useRoomTypes();
    const { data: roomsData } = useRooms();
    const updateClass = useUpdateClass();

    const [classType, setClassType] = useState<ClassType>('single');
    const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');

    // Form fields
    const [name, setName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [description, setDescription] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [roomTypeId, setRoomTypeId] = useState('');
    const [roomId, setRoomId] = useState('');

    // Single class fields
    const [singleDate, setSingleDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Recurring class fields
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [interval, setInterval] = useState(1);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
    const [daysOfMonth, setDaysOfMonth] = useState<number[]>([]);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ startTime: '', endTime: '' }]);

    // Load class data when available
    useEffect(() => {
        if (classData?.data) {
            const cls = classData.data as {
                name?: string;
                courseCode?: string;
                description?: string;
                classType?: string;
                instructorId?: string;
                roomTypeId?: string;
                roomId?: string;
                startDate?: string;
                endDate?: string;
                startTime?: string;
                endTime?: string;
                recurrence?: {
                    pattern?: string;
                    daysOfWeek?: number[];
                    dayOfMonth?: number[];
                    interval?: number;
                    timeSlots?: { startTime?: string; endTime?: string }[];
                    endDate?: string;
                };
            };

            if (cls) {
                setName(cls.name || '');
                setCourseCode(cls.courseCode || '');
                setDescription(cls.description || '');
                setClassType(cls.classType as ClassType || 'single');
                setInstructorId(cls.instructorId || '');
                setRoomTypeId(cls.roomTypeId || '');
                setRoomId(cls.roomId || '');
                setStartTime(cls.startTime || '');
                setEndTime(cls.endTime || '');

                if (cls.classType === 'single') {
                    setSingleDate(cls.startDate?.split('T')[0] || '');
                } else {
                    setStartDate(cls.startDate?.split('T')[0] || '');
                    setEndDate(cls.endDate?.split('T')[0] || '');

                    if (cls.recurrence) {
                        setRecurrencePattern((cls.recurrence.pattern || 'weekly') as RecurrencePattern);
                        setDaysOfWeek(cls.recurrence.daysOfWeek || []);
                        setDaysOfMonth(cls.recurrence.dayOfMonth || []);
                        setInterval(cls.recurrence.interval || 1);

                        if (cls.recurrence.timeSlots && cls.recurrence.timeSlots.length > 0) {
                            setTimeSlots(cls.recurrence.timeSlots.map(ts => ({
                                startTime: ts.startTime || '',
                                endTime: ts.endTime || ''
                            })));
                        }
                    }
                }
            }
        }
    }, [classData]);

    const instructors: Instructor[] = ((instructorsData?.data?.data || []) as unknown) as Instructor[];
    const roomTypes: RoomType[] = ((roomTypesData?.data?.data || []) as unknown) as RoomType[];
    const rooms: Room[] = ((roomsData?.data?.data || []) as unknown) as Room[];

    // Filter rooms by selected room type
    const filteredRooms = roomId
        ? rooms
        : roomTypeId
            ? rooms.filter(r => r.roomTypeId === roomTypeId)
            : [];

    const weekDays = [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
    ];

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
    };

    const removeTimeSlot = (index: number) => {
        setTimeSlots(timeSlots.filter((_, i) => i !== index));
    };

    const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
        const updated = [...timeSlots];
        updated[index] = { ...updated[index], [field]: value };
        setTimeSlots(updated);
    };

    const toggleDayOfWeek = (day: number) => {
        if (daysOfWeek.includes(day)) {
            setDaysOfWeek(daysOfWeek.filter(d => d !== day));
        } else {
            setDaysOfWeek([...daysOfWeek, day]);
        }
    };

    const toggleDayOfMonth = (day: number) => {
        if (daysOfMonth.includes(day)) {
            setDaysOfMonth(daysOfMonth.filter(d => d !== day));
        } else {
            setDaysOfMonth([...daysOfMonth, day]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const classData = {
            name,
            courseCode,
            description,
            instructorId,
            roomTypeId,
            roomId: roomId || undefined,
            classType,
            ...(classType === 'single' ? {
                startDate: singleDate,
                endDate: singleDate,
                startTime,
                endTime,
            } : {
                startDate,
                endDate,
                recurrence: {
                    pattern: recurrencePattern,
                    daysOfWeek: recurrencePattern === 'weekly' || recurrencePattern === 'custom' ? daysOfWeek : undefined,
                    dayOfMonth: recurrencePattern === 'monthly' || recurrencePattern === 'custom' ? daysOfMonth : undefined,
                    interval,
                    timeSlots,
                    endDate,
                },
            }),
        };

        try {
            await updateClass.mutateAsync({ id: classId, data: classData });
            window.location.href = `/classes/${classId}`;
        } catch (error) {
            console.error('Failed to update class:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading class...</p>
                </div>
            </div>
        );
    }

    if (error || !classData?.data) {
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
                <div className="card p-8 text-center text-red-500">
                    Failed to load class details. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <a href={`/classes/${classId}`} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </a>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
                    <p className="text-gray-500">Update class information and schedule</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class Name *
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Introduction to Python"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Code
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., CS101"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class Type *
                        </label>
                        <select
                            className="input"
                            value={classType}
                            onChange={(e) => setClassType(e.target.value as ClassType)}
                        >
                            <option value="single">Single Class (One-Time Event)</option>
                            <option value="recurring">Recurring Class</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instructor *
                        </label>
                        <select
                            className="input"
                            value={instructorId}
                            onChange={(e) => setInstructorId(e.target.value)}
                            required
                        >
                            <option value="">Select Instructor</option>
                            {instructors.map((inst) => (
                                <option key={inst._id} value={inst._id}>
                                    {inst.firstName} {inst.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Type *
                        </label>
                        <select
                            className="input"
                            value={roomTypeId}
                            onChange={(e) => {
                                setRoomTypeId(e.target.value);
                                setRoomId('');
                            }}
                            required
                        >
                            <option value="">Select Room Type</option>
                            {roomTypes.map((rt) => (
                                <option key={rt._id} value={rt._id}>
                                    {rt.name} (Capacity: {rt.capacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room
                        </label>
                        <select
                            className="input"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        >
                            <option value="">Auto-assign (Optional)</option>
                            {filteredRooms.map((room) => (
                                <option key={room._id} value={room._id}>
                                    {room.name} {room.building ? `(${room.building})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Single Class Schedule */}
                {classType === 'single' && (
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Class Schedule</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    className="input"
                                    value={singleDate}
                                    onChange={(e) => setSingleDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    className="input"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time *
                                </label>
                                <input
                                    type="time"
                                    className="input"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Recurring Class Configuration */}
                {classType === 'recurring' && (
                    <div className="border-t pt-6 space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Recurrence Configuration</h3>

                        {/* Recurrence Pattern */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recurrence Pattern *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {['daily', 'weekly', 'monthly', 'custom'].map((pattern) => (
                                    <button
                                        key={pattern}
                                        type="button"
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${recurrencePattern === pattern
                                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setRecurrencePattern(pattern as RecurrencePattern)}
                                    >
                                        {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    className="input"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    className="input"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Interval (Every N {recurrencePattern === 'daily' ? 'days' : recurrencePattern === 'weekly' ? 'weeks' : 'months'})
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={interval}
                                    onChange={(e) => setInterval(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Weekly Pattern */}
                        {(recurrencePattern === 'weekly' || recurrencePattern === 'custom') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Days of Week *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {weekDays.map((day) => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${daysOfWeek.includes(day.value)
                                                ? 'bg-primary-100 border-primary-500 text-primary-700'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            onClick={() => toggleDayOfWeek(day.value)}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Monthly Pattern */}
                        {(recurrencePattern === 'monthly' || recurrencePattern === 'custom') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Days of Month *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            className={`w-8 h-8 text-sm font-medium rounded-full border transition-colors ${daysOfMonth.includes(day)
                                                ? 'bg-primary-100 border-primary-500 text-primary-700'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            onClick={() => toggleDayOfMonth(day)}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                    <span className="text-sm text-gray-500 ml-2 self-center">+ more</span>
                                </div>
                            </div>
                        )}

                        {/* Time Slots */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Time Slots *
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                                    onClick={addTimeSlot}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Time Slot
                                </button>
                            </div>
                            <div className="space-y-2">
                                {timeSlots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            className="input w-40"
                                            placeholder="Start"
                                            value={slot.startTime}
                                            onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                                            required
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="time"
                                            className="input w-40"
                                            placeholder="End"
                                            value={slot.endTime}
                                            onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                                            required
                                        />
                                        {timeSlots.length > 1 && (
                                            <button
                                                type="button"
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                onClick={() => removeTimeSlot(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        className="input"
                        rows={3}
                        placeholder="Class description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <a href={`/classes/${classId}`} className="btn-secondary">
                        Cancel
                    </a>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={updateClass.isPending}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {updateClass.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
