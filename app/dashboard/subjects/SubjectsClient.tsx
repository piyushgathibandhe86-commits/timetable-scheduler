'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { createSubject, updateSubject, deleteSubject, importSubjectsCsv } from '@/app/actions/subjects';
import { Edit2, Trash2 } from 'lucide-react';

type Section = { id: string; name: string };
type Teacher = { id: string; name: string; email: string | null };
type Subject = {
  id: string;
  name: string;
  type: string;
  weekly_hours: number;
  section_id: string;
  teacher_id: string | null;
  section?: { name: string };
  teacher?: { name: string };
};

interface SubjectsClientProps {
  initialData: Subject[];
  sections: Section[];
  teachers: Teacher[];
}

export function SubjectsClient({ initialData, sections, teachers }: SubjectsClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns: Column<Subject>[] = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Type', 
      accessor: (r) => (
        <span className="capitalize inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
          {r.type}
        </span>
      ) 
    },
    { header: 'Section', accessor: (r) => r.section?.name ?? '—' },
    { header: 'Default Teacher', accessor: (r) => r.teacher?.name ?? '—' },
    { header: 'Hrs/Wk', accessor: 'weekly_hours' },
    {
      header: 'Actions',
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingSubject(r)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit subject"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete subject"
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
    const res = editingSubject
      ? await updateSubject(editingSubject.id, formData)
      : await createSubject(formData);

    if (res.error) {
      setError(res.error);
    } else {
      closeFormModal();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    const res = await deleteSubject(id);
    if (res.error) alert(res.error);
  }

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await importSubjectsCsv(formData);

    if (res.error) {
      setError(res.error);
    } else {
      alert(`Successfully imported ${res.count} subjects.`);
      setIsImportModalOpen(false);
    }
    setLoading(false);
  }

  function closeFormModal() {
    setIsAddModalOpen(false);
    setEditingSubject(null);
    setError(null);
  }

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Manage curriculum, hours, and section/teacher assignments."
        onAdd={() => setIsAddModalOpen(true)}
        onImport={() => setIsImportModalOpen(true)}
      />

      <DataTable data={initialData} columns={columns} keyExtractor={(r) => r.id} emptyMessage="No subjects found. Add one or import a CSV." />

      <Modal
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        isOpen={isAddModalOpen || !!editingSubject}
        onClose={closeFormModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Subject Name *</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={editingSubject?.name}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
              placeholder="e.g. Data Structures"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Type *</label>
              <select
                name="type"
                required
                defaultValue={editingSubject?.type ?? 'lecture'}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Weekly Hours *</label>
              <input
                name="weekly_hours"
                type="number"
                min="1"
                max="40"
                required
                defaultValue={editingSubject?.weekly_hours ?? ''}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                placeholder="e.g. 4"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Section *</label>
            <select
              name="section_id"
              required
              defaultValue={editingSubject?.section_id ?? ''}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="" disabled>Select a section</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Default Teacher</label>
            <select
              name="teacher_id"
              defaultValue={editingSubject?.teacher_id ?? ''}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">-- None (TBD) --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
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
        title="Import Subjects"
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setError(null); }}
      >
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            Upload a CSV file with the following headers: 
            <br/><strong>name, type, weekly_hours, section_name, teacher_email</strong>.
            <br/><br/>
            - <code>type</code> must be <code>lecture</code> or <code>lab</code>.
            <br/>
            - <code>section_name</code> must exactly match an existing section.
            <br/>
            - <code>teacher_email</code> is optional, but must match if provided.
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
