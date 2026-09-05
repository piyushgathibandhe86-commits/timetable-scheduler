'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { createSection, updateSection, deleteSection, importSectionsCsv } from '@/app/actions/sections';
import { Edit2, Trash2 } from 'lucide-react';

type Section = {
  id: string;
  name: string;
};

export function SectionsClient({ initialData }: { initialData: Section[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Column<Section>[] = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Actions',
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingSection(r)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit section"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete section"
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
    const res = editingSection
      ? await updateSection(editingSection.id, formData)
      : await createSection(formData);

    if (res.error) {
      setError(res.error);
    } else {
      closeFormModal();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this section?')) return;
    const res = await deleteSection(id);
    if (res.error) alert(res.error);
  }

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await importSectionsCsv(formData);

    if (res.error) {
      setError(res.error);
    } else {
      alert(`Successfully imported ${res.count} sections.`);
      setIsImportModalOpen(false);
    }
    setLoading(false);
  }

  function closeFormModal() {
    setIsAddModalOpen(false);
    setEditingSection(null);
    setError(null);
  }

  return (
    <>
      <PageHeader
        title="Sections"
        description="Manage student cohorts and batches."
        onAdd={() => setIsAddModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
      />

      <DataTable data={initialData} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No sections found. Add one or import a CSV." />

      <Modal
        title={editingSection ? 'Edit Section' : 'Add Section'}
        isOpen={isAddModalOpen || !!editingSection}
        onClose={closeFormModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Section Name *</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={editingSection?.name}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g. CS-A"
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
        title="Import Sections"
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setError(null); }}
      >
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with the following header: <strong>name</strong>.
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
