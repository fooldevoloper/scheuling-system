import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { RecurrencePattern } from '@/types';

type ClassType = 'single' | 'recurring';

interface TimeSlot {
    startTime: string;
    endTime: string;
}

export function CreateClassPage() {
    const [classType, setClassType] = useState<ClassType>('single');
    const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('weekly');
    const [showAdvanced, setShowAdvanced] = useState(false);

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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <Link to="/classes" className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Class</h1>
                    <p className="text-gray-500">Schedule a new class or recurring class</p>
                </div>
            </div>

            <form className="card p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Class Name *
                        </label>
                        <input type="text" className="input" placeholder="e.g., Introduction to Python" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Code
                        </label>
                        <input type="text" className="input" placeholder="e.g., CS101" />
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
                        <select className="input">
                            <option value="">Select Instructor</option>
                            <option value="1">Dr. John Smith</option>
                            <option value="2">Dr. Jane Doe</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Type *
                        </label>
                        <select className="input">
                            <option value="">Select Room Type</option>
                            <option value="lecture">Lecture Hall</option>
                            <option value="lab">Laboratory</option>
                            <option value="studio">Studio</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room
                        </label>
                        <select className="input">
                            <option value="">Select Room (Optional)</option>
                            <option value="1">Room 101</option>
                            <option value="2">Room 203</option>
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
                        {recurrencePattern === 'weekly' && (
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
                        {recurrencePattern === 'monthly' && (
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

                        {/* Custom Pattern */}
                        {recurrencePattern === 'custom' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Days of Week
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Days of Month
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
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
                                    </div>
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
                                        />
                                        <span className="text-gray-500">to</span>
                                        <input
                                            type="time"
                                            className="input w-40"
                                            placeholder="End"
                                            value={slot.endTime}
                                            onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
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
                    <textarea className="input" rows={3} placeholder="Class description..." />
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Link to="/classes" className="btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        {classType === 'single' ? 'Create Class' : 'Create Recurring Class'}
                    </button>
                </div>
            </form>
        </div>
    );
}
