'use client';

import React, { useState } from 'react';
import { DataIntegrationState, exportToJSON, exportToCSV, importFromJSON, importFromCSV, validateTree, getTreeStats } from '@/utils/dataIntegration';

interface DataExportImportProps {
  dataState: DataIntegrationState;
  onImport: (newState: DataIntegrationState) => void;
}

const DataExportImport: React.FC<DataExportImportProps> = ({ dataState, onImport }) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [showImportArea, setShowImportArea] = useState(false);
  const [importText, setImportText] = useState('');

  const handleExportJSON = () => {
    try {
      const jsonData = exportToJSON(dataState);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `category-tree-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      const csvData = exportToCSV(dataState);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `category-tree-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = (format: 'json' | 'csv') => {
    if (!importText.trim()) {
      setImportError('Please enter data to import');
      return;
    }

    try {
      setImportError(null);
      setImportSuccess(null);

      let newState: DataIntegrationState;
      
      if (format === 'json') {
        newState = importFromJSON(importText);
      } else {
        newState = importFromCSV(importText);
      }

      // Validate the imported data
      const validation = validateTree(newState.tree);
      if (!validation.isValid) {
        setImportError(`Import validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      onImport(newState);
      setImportSuccess(`Successfully imported ${getTreeStats(newState.tree).totalNodes} categories`);
      setImportText('');
      setShowImportArea(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
    }
  };

  const stats = getTreeStats(dataState.tree);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Data Export & Import</h3>
      
      {/* Statistics */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Current Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Total Categories: <span className="font-medium">{stats.totalNodes}</span></div>
          <div>Root Categories: <span className="font-medium">{stats.rootNodes}</span></div>
          <div>Max Depth: <span className="font-medium">{stats.maxDepth}</span></div>
          <div>Leaf Categories: <span className="font-medium">{stats.leafNodes}</span></div>
        </div>
      </div>

      {/* Export Section */}
      <div className="mb-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">Export</h4>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            disabled={stats.totalNodes === 0}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            disabled={stats.totalNodes === 0}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Import</h4>
        
        {!showImportArea ? (
          <button
            onClick={() => setShowImportArea(true)}
            className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
          >
            Import Data
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste JSON or CSV data here..."
              className="w-full h-32 p-2 border border-gray-300 rounded text-sm font-mono"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => handleImport('json')}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Import JSON
              </button>
              <button
                onClick={() => handleImport('csv')}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
              >
                Import CSV
              </button>
              <button
                onClick={() => {
                  setShowImportArea(false);
                  setImportText('');
                  setImportError(null);
                  setImportSuccess(null);
                }}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {importError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {importError}
          </div>
        )}
        
        {importSuccess && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {importSuccess}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExportImport; 