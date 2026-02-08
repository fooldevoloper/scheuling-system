import { useState } from 'react';
import { Plus, Edit, Trash2, X, Check, Mail, Phone, User, Loader2 } from 'lucide-react';
import { useInstructors, useCreateInstructor, useUpdateInstructor, useDeleteInstructor } from '@/hooks';
import type { Instructor, InstructorFormData } from '@/types';

const initialFormData: InstructorFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
};

export function InstructorsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<InstructorFormData>(initialFormData);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data: instructorsData, isLoading, error } = useInstructors();
    const createInstructor = useCreateInstructor();
    const updateInstructor = useUpdateInstructor();
    const deleteInstructor = useDeleteInstructor();

    const instructors: Instructor[] = ((instructorsData?.data?.data || []) as unknown) as Instructor[];

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormData);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (instructor: Instructor) => {
        setIsEditing(true);
        setFormData({
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            email: instructor.email,
            phone: instructor.phone || '',
            specialization: instructor.specialization || '',
            bio: instructor.bio || '',
        });
        setEditingId(instructor._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && editingId) {
                await updateInstructor.mutateAsync({ id: editingId, data: formData });
            } else {
                await createInstructor.mutateAsync(formData);
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save instructor:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this instructor?')) {
            try {
                await deleteInstructor.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete instructor:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
                    <p className="text-gray-500">Manage instructor profiles and information</p>
                </div>
                <button className="btn-primary" onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Instructor
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="card p-8 text-center text-red-500">
                    Failed to load instructors. Please try again.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {instructors.map((instructor) => (
                            <div key={instructor._id} className="card p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {instructor.firstName} {instructor.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{instructor.specialization}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => openEditModal(instructor)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(instructor._id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="truncate">{instructor.email}</span>
                                    </div>
                                    {instructor.phone && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                            <span>{instructor.phone}</span>
                                        </div>
                                    )}
                                </div>
                                {instructor.bio && (
                                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{instructor.bio}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {instructors.length === 0 && (
                        <div className="card p-8 text-center">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No instructors found</p>
                            <button onClick={openCreateModal} className="btn-primary mt-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Instructor
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-gray-900/50" onClick={closeModal} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {isEditing ? 'Edit Instructor' : 'Add Instructor'}
                            </h2>
                            <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="First name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Last name"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@university.edu"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    className="input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 234-567-8900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specialization *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    placeholder="e.g., Computer Science"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Brief description..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={closeModal} className="btn-secondary">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={createInstructor.isPending || updateInstructor.isPending}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Save Changes' : 'Add Instructor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
