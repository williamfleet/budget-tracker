'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function UndoRedoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: UndoRedoControlsProps) {
  // Set up keyboard shortcuts for undo/redo
  useKeyboardShortcuts([
    {
      key: 'z',
      description: 'Undo budget change',
      action: onUndo,
      meta: true,
      shift: false,
    },
    {
      key: 'z',
      description: 'Redo budget change',
      action: onRedo,
      meta: true,
      shift: true,
    },
  ]);

  if (!canUndo && !canRedo) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo (Cmd/Ctrl+Z)"
      >
        ↶ Undo
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo (Cmd/Ctrl+Shift+Z)"
      >
        ↷ Redo
      </button>
    </div>
  );
}
