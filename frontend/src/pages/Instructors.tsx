import { useState } from 'react';
import { Plus, Edit, Trash2, X, Check, Mail, Phone, User } from 'lucide-react';

interface InstructorFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialization: string;
    bio: string;
}

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

    // Sample data
    const [instructors, setInstructors] = useState([
        { _id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@university.edu', phone: '+1 234-567-8901', specialization: 'Computer Science', bio: 'Expert in Python and Machine Learning', isActive: true },
        { _id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@university.edu', phone: '+1 234-567-8902', specialization: 'Mathematics', bio: 'Specializes in calculus and linear algebra', isActive: true },
        { _id: '3', firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@university.edu', phone: '+1 234-567-8903', specialization: 'Physics', bio: 'Researcher in quantum mechanics', isActive: true },
        { _id: '4', firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@university.edu', phone: '+1 234-567-8904', specialization: 'Chemistry', bio: 'Organic chemistry expert', isActive: true },
    ]);

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const openEditModal = (instructor: typeof instructors[0]) => {
        setIsEditing(true);
        setFormData({
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            email: instructor.email,
            phone: instructor.phone,
            specialization: instructor.specialization,
            bio: instructor.bio,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            // Update existing
            const updated = instructors.map(inst =>
                inst._id === instructors[0]._id ? { ...inst, ...formData, isActive: true } : inst
            );
            setInstructors(updated);
        } else {
            // Create new
            const newInstructor = {
                _id: Date.now().toString(),
                ...formData,
                isActive: true,
            };
            setInstructors([...instructors, newInstructor]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this instructor?')) {
            setInstructors(instructors.filter(inst => inst._id !== id));
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
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{instructor.phone}</span>
                            </div>
                        </div>
                        {instructor.bio && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{instructor.bio}</p>
                        )}
                    </div>
                ))}
            </div>

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
                                <button type="submit" className="btn-primary">
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
