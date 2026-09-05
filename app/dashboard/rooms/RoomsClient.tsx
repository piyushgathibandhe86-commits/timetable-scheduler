'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { createRoom, updateRoom, deleteRoom, importRoomsCsv } from '@/app/actions/rooms';
import { Edit2, Trash2 } from 'lucide-react';

type Room = {
  id: string;
  name: string;
  type: string;
  capacity: number | null;
};

export function RoomsClient({ initialData }: { initialData: Room[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Column<Room>[] = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Type', 
      accessor: (r) => (
        <span className="capitalize inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
          {r.type}
        </span>
      ) 
    },
    { header: 'Capacity', accessor: (r) => r.capacity ?? '—' },
    {
      header: 'Actions',
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingRoom(r)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit room"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete room"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = editingRoom
      ? await updateRoom(editingRoom.id, formData)
      : await createRoom(formData);

    if (res.error) {
      setError(res.error);
    } else {
      closeFormModal();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    const res = await deleteRoom(id);
    if (res.error) alert(res.error);
  }

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await importRoomsCsv(formData);

    if (res.error) {
      setError(res.error);
    } else {
      alert(`Successfully imported ${res.count} rooms.`);
      setIsImportModalOpen(false);
    }
    setLoading(false);
  }

  function closeFormModal() {
    setIsAddModalOpen(false);
    setEditingRoom(null);
    setError(null);
  }

  return (
    <>
      <PageHeader
        title="Rooms"
        description="Manage lecture halls and lab rooms for scheduling."
        onAdd={() => setIsAddModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
      />

      <DataTable data={initialData} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No rooms found. Add one or import a CSV." />

      <Modal
        title={editingRoom ? 'Edit Room' : 'Add Room'}
        isOpen={isAddModalOpen || !!editingRoom}
        onClose={closeFormModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Room Name *</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={editingRoom?.name}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g. Room 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Type *</label>
            <select
              name="type"
              required
              defaultValue={editingRoom?.type ?? 'lecture'}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="lecture">Lecture</option>
              <option value="lab">Lab</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Capacity</label>
            <input
              name="capacity"
              type="number"
              min="1"
              defaultValue={editingRoom?.capacity ?? ''}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g. 60"
            />
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Import Rooms"
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setError(null); }}
      >
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with the following headers: <strong>name, type, capacity</strong>. 
            <br/><br/>
            Note: Type must be <code>lecture</code> or <code>lab</code>.
          </p>
          <input
            name="file"
            type="file"
            accept=".csv"
            required
            className="w-full"
          />
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => { setIsImportModalOpen(false); setError(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
