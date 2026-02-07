import { useState } from 'react';
import { Plus, Edit, Trash2, X, Check, Building2 } from 'lucide-react';

interface RoomTypeFormData {
    name: string;
    capacity: number;
    description: string;
    amenities: string[];
}

const initialFormData: RoomTypeFormData = {
    name: '',
    capacity: 0,
    description: '',
    amenities: [],
};

export function RoomTypesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<RoomTypeFormData>(initialFormData);
    const [amenityInput, setAmenityInput] = useState('');

    // Sample data
    const [roomTypes, setRoomTypes] = useState([
        { _id: '1', name: 'Lecture Hall', capacity: 100, description: 'Large hall for lectures', amenities: ['Projector', 'Whiteboard', 'Microphone'], isActive: true },
        { _id: '2', name: 'Laboratory', capacity: 30, description: 'Lab with computers', amenities: ['Computers', 'Lab Equipment'], isActive: true },
        { _id: '3', name: 'Studio', capacity: 20, description: 'Recording studio', amenities: ['Recording Equipment'], isActive: true },
        { _id: '4', name: 'Conference Room', capacity: 15, description: 'Meeting room', amenities: ['Video Conferencing', 'Whiteboard'], isActive: true },
    ]);

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    const openEditModal = (roomType: typeof roomTypes[0]) => {
        setIsEditing(true);
        setFormData({
            name: roomType.name,
            capacity: roomType.capacity,
            description: roomType.description,
            amenities: [...roomType.amenities],
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData(initialFormData);
    };

    const addAmenity = () => {
        if (amenityInput.trim()) {
            setFormData({
                ...formData,
                amenities: [...formData.amenities, amenityInput.trim()],
            });
            setAmenityInput('');
        }
    };

    const removeAmenity = (index: number) => {
        setFormData({
            ...formData,
            amenities: formData.amenities.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            // Update existing
            const updated = roomTypes.map(rt =>
                rt._id === roomTypes[0]._id ? { ...rt, ...formData } : rt
            );
            setRoomTypes(updated);
        } else {
            // Create new
            const newRoomType = {
                _id: Date.now().toString(),
                ...formData,
                isActive: true,
            };
            setRoomTypes([...roomTypes, newRoomType]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this room type?')) {
            setRoomTypes(roomTypes.filter(rt => rt._id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Room Types</h1>
                    <p className="text-gray-500">Manage room types and their configurations</p>
                </div>
                <button className="btn-primary" onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room Type
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomTypes.map((type) => (
                    <div key={type._id} className="card p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary-100 rounded-lg">
                                    <Building2 className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                                    <p className="text-sm text-gray-500">Capacity: {type.capacity}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => openEditModal(type)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(type._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">{type.description}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                            {type.amenities.map((amenity, i) => (
                                <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                    {amenity}
                                </span>
                            ))}
                        </div>
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
                                {isEditing ? 'Edit Room Type' : 'Add Room Type'}
                            </h2>
                            <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Lecture Hall"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacity *
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="input"
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this room type..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amenities
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="input flex-1"
                                        value={amenityInput}
                                        onChange={(e) => setAmenityInput(e.target.value)}
                                        placeholder="Add an amenity"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                    />
                                    <button type="button" onClick={addAmenity} className="btn-secondary">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {formData.amenities.map((amenity, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                        >
                                            {amenity}
                                            <button
                                                type="button"
                                                onClick={() => removeAmenity(i)}
                                                className="ml-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={closeModal} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    <Check className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Save Changes' : 'Create Room Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
