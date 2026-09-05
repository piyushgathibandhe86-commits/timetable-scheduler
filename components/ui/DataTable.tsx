'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, keyExtractor, emptyMessage = 'No records found.' }: DataTableProps<T>) {
  return (
    <div
      className="w-full overflow-x-auto"
      style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-muted)' }}>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-3"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="transition-colors hover:bg-gray-50"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className="px-6 py-4"
                    style={{ fontSize: '15px', color: 'var(--text-primary)' }}
                  >
                    {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
