'use client';

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  meta?: boolean; // Cmd/Ctrl
  shift?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields, textareas, selects, or editable content
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        // Special handling for meta key requirement
        const metaMatch = shortcut.meta !== undefined
          ? shortcut.meta === (event.metaKey || event.ctrlKey)
          : !event.metaKey && !event.ctrlKey;

        // Special handling for shift key requirement
        const shiftMatch = shortcut.shift !== undefined
          ? shortcut.shift === event.shiftKey
          : true;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && metaMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
