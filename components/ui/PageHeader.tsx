'use client';

import { Plus, Upload } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  onAdd: () => void;
  onImport: () => void;
}

export function PageHeader({ title, description, onAdd, onImport }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onImport}
          className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <Upload size={16} />
          Import CSV
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-md transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            border: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <Plus size={16} />
          Add New
        </button>
      </div>
    </div>
  );
}
