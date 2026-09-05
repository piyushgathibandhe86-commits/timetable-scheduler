'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { createTeacher, updateTeacher, deleteTeacher, importTeachersCsv } from '@/app/actions/teachers';
import { Edit2, Trash2 } from 'lucide-react';

type Teacher = {
  id: string;
  name: string;
  email: string | null;
};

export function TeachersClient({ initialData }: { initialData: Teacher[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Column<Teacher>[] = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: (r) => r.email ?? '—' },
    {
      header: 'Actions',
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingTeacher(r)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit teacher"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete teacher"
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
    const res = editingTeacher
      ? await updateTeacher(editingTeacher.id, formData)
      : await createTeacher(formData);

    if (res.error) {
      setError(res.error);
    } else {
      closeFormModal();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    const res = await deleteTeacher(id);
    if (res.error) alert(res.error);
  }

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await importTeachersCsv(formData);

    if (res.error) {
      setError(res.error);
    } else {
      alert(`Successfully imported ${res.count} teachers.`);
      setIsImportModalOpen(false);
    }
    setLoading(false);
  }

  function closeFormModal() {
    setIsAddModalOpen(false);
    setEditingTeacher(null);
    setError(null);
  }

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Manage teaching staff and their contact information."
        onAdd={() => setIsAddModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
      />

      <DataTable data={initialData} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No teachers found. Add one or import a CSV." />

      <Modal
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        isOpen={isAddModalOpen || !!editingTeacher}
        onClose={closeFormModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Teacher Name *</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={editingTeacher?.name}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g. Dr. Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
            <input
              name="email"
              type="email"
              defaultValue={editingTeacher?.email ?? ''}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g. jane@college.edu"
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
        title="Import Teachers"
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setError(null); }}
      >
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with the following headers: <strong>name, email</strong>.
            <br/><br/>
            Email is optional.
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
