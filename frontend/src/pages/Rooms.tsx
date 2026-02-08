import { useState } from 'react';
import { Plus, MapPin, Edit, Trash2, X, Check, Loader2, Building2 } from 'lucide-react';
import { useRooms, useRoomTypes, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks';
import type { Room, RoomFormData } from '@/types';

const initialFormData: RoomFormData = {
    name: '',
    roomTypeId: '',
    building: '',
    floor: undefined,
};

export function RoomsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<RoomFormData>(initialFormData);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data: roomsData, isLoading, error } = useRooms();
    const { data: roomTypesData } = useRoomTypes();
    const createRoom = useCreateRoom();
    const updateRoom = useUpdateRoom();
    const deleteRoom = useDeleteRoom();

    const rooms: Room[] = ((roomsData?.data?.data || []) as unknown) as Room[];
    const roomTypes = ((roomTypesData?.data?.data || []) as unknown) as { _id: string; name: string }[];

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormData);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (room: Room) => {
        setIsEditing(true);
        setFormData({
            name: room.name,
            roomTypeId: room.roomTypeId,
            building: room.building || '',
            floor: room.floor,
        });
        setEditingId(room._id);
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
                await updateRoom.mutateAsync({ id: editingId, data: formData });
            } else {
                await createRoom.mutateAsync(formData);
            }
            closeModal();
        } catch (error) {
            console.error('Failed to save room:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteRoom.mutateAsync(id);
            } catch (error) {
                console.error('Failed to delete room:', error);
            }
        }
    };

    const getRoomTypeName = (roomTypeId: string) => {
        const roomType = roomTypes.find(rt => rt._id === roomTypeId);
        return roomType?.name || 'Unknown';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
                    <p className="text-gray-500">Manage physical rooms and spaces</p>
                </div>
                <button className="btn-primary" onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : error ? (
                <div className="card p-8 text-center text-red-500">
                    Failed to load rooms. Please try again.
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rooms.map((room) => (
                                <tr key={room._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{getRoomTypeName(room.roomTypeId)}</td>
                                    <td className="px-6 py-4 text-gray-600">{room.roomType?.capacity || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                            {room.building || 'N/A'}{room.floor ? `, Floor ${room.floor}` : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${room.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {room.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(room)}
                                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {rooms.length === 0 && (
                        <div className="p-8 text-center">
                            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No rooms found</p>
                            <button onClick={openCreateModal} className="btn-primary mt-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Room
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-gray-900/50" onClick={closeModal} />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {isEditing ? 'Edit Room' : 'Add Room'}
                            </h2>
                            <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Name *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Room 101"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Type *
                                </label>
                                <select
                                    className="input"
                                    value={formData.roomTypeId}
                                    onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Room Type</option>
                                    {roomTypes.map((rt) => (
                                        <option key={rt._id} value={rt._id}>{rt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Building
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.building}
                                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                    placeholder="e.g., Main Building"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Floor
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={formData.floor || ''}
                                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || undefined })}
                                    placeholder="e.g., 1"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={closeModal} className="btn-secondary">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={createRoom.isPending || updateRoom.isPending}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Save Changes' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
