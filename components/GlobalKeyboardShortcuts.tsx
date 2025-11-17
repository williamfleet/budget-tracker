'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

export default function GlobalKeyboardShortcuts() {
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  // Set up global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcutsHelp(true),
      shift: true,
    },
    {
      key: 'escape',
      description: 'Close modals',
      action: () => setShowShortcutsHelp(false),
    },
    {
      key: 'd',
      description: 'Toggle dark mode',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      key: 'b',
      description: 'Go to Budget',
      action: () => router.push('/'),
    },
    {
      key: 't',
      description: 'Go to Transactions',
      action: () => router.push('/transactions'),
    },
    {
      key: 'c',
      description: 'Go to Categories',
      action: () => router.push('/categories'),
    },
    {
      key: 'r',
      description: 'Go to Reports',
      action: () => router.push('/reports'),
    },
    {
      key: 'a',
      description: 'Go to Accounts',
      action: () => router.push('/accounts'),
    },
  ]);

  return (
    <KeyboardShortcutsHelp
      isOpen={showShortcutsHelp}
      onClose={() => setShowShortcutsHelp(false)}
    />
  );
}
