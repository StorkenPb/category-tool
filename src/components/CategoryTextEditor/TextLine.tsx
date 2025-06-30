'use client';

import React, { useRef, useEffect } from 'react';
import { TextLine as TextLineType } from '@/types/category';

interface TextLineProps {
  line: TextLineType;
  isActive: boolean;
  isEditing: boolean;
  onChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onEnter?: () => void;
  onTab?: (shiftKey: boolean) => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
}

const TextLineComponent: React.FC<TextLineProps> = ({
  line,
  isActive,
  onChange,
  onFocus,
  onBlur,
  onEnter,
  onTab,
  onArrowUp,
  onArrowDown,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when line becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key specifically
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onEnter?.();
    }
    
    // Handle Tab key specifically
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      onTab?.(e.shiftKey);
    }
    
    // Handle arrow keys specifically
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      onArrowUp?.();
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      onArrowDown?.();
    }
  };

  return (
    <div className="flex items-center min-h-[24px] px-2">
      {/* Indentation indicator */}
      <div className="flex items-center">
        {Array.from({ length: line.level }, (_, i) => (
          <div 
            key={i}
            className="w-4 h-4 mr-1 flex items-center justify-center"
          >
            <div className={`w-px h-5 border-l ${isActive ? 'border-slate-500' : 'border-slate-300 border-dashed'}`}></div>
          </div>
        ))}
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={line.text}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
        placeholder={line.level === 0 ? "Enter category name..." : "Enter subcategory name..."}
      />

      {/* Level indicator */}
      {line.level > 0 && (
        <div className="ml-2 text-xs text-gray-400">
          L{line.level}
        </div>
      )}
    </div>
  );
};

export default TextLineComponent; 