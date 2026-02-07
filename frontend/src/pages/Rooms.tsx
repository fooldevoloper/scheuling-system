import { Plus, MapPin } from 'lucide-react';

export function RoomsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
                    <p className="text-gray-500">Manage physical rooms and spaces</p>
                </div>
                <button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {[
                            { name: 'Room 101', type: 'Lecture Hall', capacity: 100, building: 'Main Building', floor: 1, status: 'Active' },
                            { name: 'Room 203', type: 'Lecture Hall', capacity: 80, building: 'Main Building', floor: 2, status: 'Active' },
                            { name: 'Lab A', type: 'Laboratory', capacity: 30, building: 'Science Center', floor: 1, status: 'Active' },
                            { name: 'Lab B', type: 'Laboratory', capacity: 25, building: 'Science Center', floor: 1, status: 'Maintenance' },
                            { name: 'Studio 1', type: 'Studio', capacity: 20, building: 'Arts Building', floor: 1, status: 'Active' },
                        ].map((room, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                                <td className="px-6 py-4 text-gray-600">{room.type}</td>
                                <td className="px-6 py-4 text-gray-600">{room.capacity}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                        {room.building}, Floor {room.floor}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${room.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {room.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
