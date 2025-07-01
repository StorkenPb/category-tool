'use client';

import React, { useRef, useEffect } from 'react';
import { TextLine as TextLineType } from '@/types/category';

interface TextLineProps {
  line: TextLineType;
  isActive: boolean;
  onChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onEnter?: () => void;
  onTab?: (shiftKey: boolean) => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onBackspace?: () => void;
  childCount: number;
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
  onBackspace,
  childCount,
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
    // Handle Enter key - only if line has text
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (line.text.trim()) {
        onEnter?.();
      }
    }
    
    // Handle Backspace key - remove line if empty
    if (e.key === 'Backspace') {
      if (!line.text.trim()) {
        e.preventDefault();
        e.stopPropagation();
        onBackspace?.();
      }
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
    <div className="flex items-center min-h-[28px] px-2 py-0 relative">
      {/* Indentation indicator */}
      <div className="flex items-center space-x-[22px]">
        {Array.from({ length: line.level }, (_, i) => (
          <div 
            key={i}
            className="w-0 h-8 ml-[5px] flex items-center justify-center"
          >
            <div className="h-full border-l border-gray-300"style={{ transform: 'translateX(-50%) translateY(-47%)'}}></div>
          </div>
        ))}
      </div>

      {/* Horizontal line for non-root levels */}
      {line.level > 0 && (
        <div className="h-px w-6 bg-slate-300 mr-[-2px]" />
      )}

      {/* Bullet with optional downward line if has children */}
      <span className={`mr-2 z-1 ${isActive ? 'text-blue-700' : 'text-slate-400 hover:text-slue-600'} text-base relative`}>
        ●
{/*         {childCount > 0 && (
          <span className="absolute left-1/2 top-1/2 w-px h-4 bg-slate-200 z-[-1]" style={{ transform: 'translateX(-50%)', minHeight: '1rem' }} />
        )} */}
      </span>

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
        placeholder={line.level === 0 ? "Enter root-category name..." : "Enter sub-category name..."}
      />

      {/* Child count indicator */}
      <span className="ml-2 text-xs text-gray-500 font-mono">
        {childCount > 0 ? childCount : "-"}
      </span>
    </div>
  );
};

export default TextLineComponent; 