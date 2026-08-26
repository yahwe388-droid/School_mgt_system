import React, { useState } from 'react';
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTable = ({
  title,
  columns,
  data,
  searchPlaceholder = 'Search records...',
  onAddClick,
  addButtonText = 'Add New',
  renderActions
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((row) => {
    return Object.values(row).some((val) =>
      String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Table Header Controls */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '400px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.25rem', borderRadius: '20px', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {onAddClick && (
          <button className="btn btn-primary" onClick={onAddClick}>
            <Plus size={16} /> {addButtonText}
          </button>
        )}
      </div>

      {/* Table Data */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.header}</th>
                ))}
                {renderActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (renderActions ? 1 : 0)} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx}>
                    {columns.map((col, colIdx) => (
                      <td key={colIdx}>
                        {col.cell ? col.cell(row) : row[col.accessor]}
                      </td>
                    ))}
                    {renderActions && <td>{renderActions(row)}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
