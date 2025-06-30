'use client';

import { useState } from 'react';
import { TextLine } from '@/types/category';
import CategoryTextEditor from '@/components/CategoryTextEditor';

export default function Home() {
  const [lines, setLines] = useState<TextLine[]>([]);

  const handleLinesChange = (newLines: TextLine[]) => {
    setLines(newLines);
    console.log('Lines changed:', newLines);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Category Tool
          </h1>
          <p className="text-gray-600">
            Create and manage category hierarchies using text input
          </p>
        </header>

        <main className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Text Editor
            </h2>
            <CategoryTextEditor
              onLinesChange={handleLinesChange}
              className="w-full"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Debug Output
            </h2>
            <pre className="bg-gray-100 p-4 rounded text-sm text-gray-900 overflow-auto">
              {JSON.stringify(lines, null, 2)}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}
