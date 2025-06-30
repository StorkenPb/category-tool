'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TextLine, CategoryEditorState } from '@/types/category';
import { createTextLine, calculateParentRelationships } from '@/utils/categoryUtils';
import TextLineComponent from './TextLine';

interface CategoryTextEditorProps {
  initialLines?: TextLine[];
  onLinesChange?: (lines: TextLine[]) => void;
  className?: string;
}

const CategoryTextEditor: React.FC<CategoryTextEditorProps> = ({
  initialLines = [],
  onLinesChange,
  className = '',
}) => {
  const [state, setState] = useState<CategoryEditorState>({
    lines: initialLines.length > 0 ? initialLines : [createTextLine('', 0, null)],
    activeLineIndex: 0,
    isEditing: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Notify parent of changes
  useEffect(() => {
    onLinesChange?.(state.lines);
  }, [state.lines, onLinesChange]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { key } = e;
    
    // Only handle events if we're not inside an input field
    if (e.target !== e.currentTarget) {
      return;
    }

    // Prevent default for our custom key handling
    if (['ArrowUp', 'ArrowDown'].includes(key)) {
      e.preventDefault();
    }

    switch (key) {
      case 'ArrowUp':
        handleArrowKey('up');
        break;
      case 'ArrowDown':
        handleArrowKey('down');
        break;
    }
  };

  // Handle Enter key - create new line
  const handleEnterKey = useCallback(() => {
    const currentLine = state.lines[state.activeLineIndex];
    if (!currentLine) return;

    const newLine = createTextLine('', currentLine.level, null);
    const newLines = [...state.lines];
    newLines.splice(state.activeLineIndex + 1, 0, newLine);

    // Recalculate parent relationships
    const updatedLines = calculateParentRelationships(newLines);

    setState(prev => ({
      ...prev,
      lines: updatedLines,
      activeLineIndex: state.activeLineIndex + 1,
    }));
  }, [state.lines, state.activeLineIndex]);

  // Handle Backspace key - remove empty line
  const handleBackspaceKey = useCallback(() => {
    // Don't remove the last line
    if (state.lines.length <= 1) return;

    const newLines = [...state.lines];
    newLines.splice(state.activeLineIndex, 1);

    // Recalculate parent relationships
    const updatedLines = calculateParentRelationships(newLines);

    // Adjust active line index
    const newActiveIndex = Math.min(state.activeLineIndex, updatedLines.length - 1);

    setState(prev => ({
      ...prev,
      lines: updatedLines,
      activeLineIndex: newActiveIndex,
    }));
  }, [state.lines, state.activeLineIndex]);

  // Handle Tab key - change indentation
  const handleTabKey = useCallback((_shiftKey: boolean) => {
    const currentLine = state.lines[state.activeLineIndex];
    if (!currentLine) return;

    const newLines = [...state.lines];
    let newLevel = currentLine.level;

    if (_shiftKey) {
      // Shift+Tab: decrease level
      newLevel = Math.max(0, currentLine.level - 1);
    } else {
      // Tab: increase level - but only if it's valid
      const previousLine = state.lines[state.activeLineIndex - 1];
      const maxAllowedLevel = previousLine ? previousLine.level + 1 : 0;
      
      // Only allow increasing level if it's at most one level deeper than the previous line
      if (currentLine.level < maxAllowedLevel) {
        newLevel = currentLine.level + 1;
      } else {
        // Don't allow going deeper than one level from parent
        return;
      }
    }

    // Prevent going too deep (max 7 levels for now)
    if (newLevel > 7) return;

    newLines[state.activeLineIndex] = {
      ...currentLine,
      level: newLevel,
    };

    // Recalculate parent relationships
    const updatedLines = calculateParentRelationships(newLines);

    setState(prev => ({
      ...prev,
      lines: updatedLines,
    }));
  }, [state.lines, state.activeLineIndex]);

  // Handle arrow keys - navigate between lines
  const handleArrowKey = useCallback((direction: 'up' | 'down') => {
    const newIndex = direction === 'up' 
      ? Math.max(0, state.activeLineIndex - 1)
      : Math.min(state.lines.length - 1, state.activeLineIndex + 1);

    setState(prev => ({
      ...prev,
      activeLineIndex: newIndex,
    }));
  }, [state.activeLineIndex, state.lines.length]);

  // Handle line text change
  const handleLineChange = useCallback((lineIndex: number, newText: string) => {
    const newLines = [...state.lines];
    newLines[lineIndex] = {
      ...newLines[lineIndex],
      text: newText,
    };

    setState(prev => ({
      ...prev,
      lines: newLines,
    }));
  }, [state.lines]);

  // Handle line focus
  const handleLineFocus = useCallback((lineIndex: number) => {
    setState(prev => ({
      ...prev,
      activeLineIndex: lineIndex,
    }));
  }, []);

  // Handle line blur
  const handleLineBlur = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: false,
    }));
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`category-text-editor border border-gray-300 rounded-lg p-4 bg-white ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div className="space-y-1">
        {state.lines.map((line, index) => (
          <TextLineComponent
            key={line.id}
            line={line}
            isActive={index === state.activeLineIndex}
            isEditing={state.isEditing && index === state.activeLineIndex}
            onChange={(text) => handleLineChange(index, text)}
            onFocus={() => handleLineFocus(index)}
            onBlur={handleLineBlur}
            onEnter={handleEnterKey}
            onTab={handleTabKey}
            onArrowUp={() => handleArrowKey('up')}
            onArrowDown={() => handleArrowKey('down')}
            onBackspace={handleBackspaceKey}
          />
        ))}
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-xs text-gray-500 border-t border-gray-300 pt-2">
        <span className="font-medium">Keyboard shortcuts:</span>
        <span className="ml-2">Enter = New line (when text exists)</span>
        <span className="ml-2">Backspace = Remove empty line</span>
        <span className="ml-2">Tab = Indent</span>
        <span className="ml-2">Shift+Tab = Outdent</span>
        <span className="ml-2">↑↓ = Navigate</span>
      </div>
    </div>
  );
};

export default CategoryTextEditor; 