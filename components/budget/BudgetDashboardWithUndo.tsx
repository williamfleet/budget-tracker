'use client';

import { useEffect, useRef } from 'react';
import { BudgetSummary } from '@/lib/types/budget';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { updateAssignment } from '@/app/actions/assignments';
import BudgetDashboard from './BudgetDashboard';
import UndoRedoControls from './UndoRedoControls';

interface AssignmentChange {
  category_id: string;
  oldAmount: string;
  newAmount: string;
}

interface BudgetDashboardWithUndoProps {
  budgetData: BudgetSummary;
  currentMonth: string;
}

export default function BudgetDashboardWithUndo({
  budgetData,
  currentMonth,
}: BudgetDashboardWithUndoProps) {
  const [assignmentHistory, historyActions] = useUndoRedo<Map<string, string>>(
    new Map()
  );

  const isUndoingRef = useRef(false);

  // Handle undo
  const handleUndo = async () => {
    if (!historyActions.canUndo) return;

    isUndoingRef.current = true;
    historyActions.undo();
  };

  // Handle redo
  const handleRedo = async () => {
    if (!historyActions.canRedo) return;

    isUndoingRef.current = true;
    historyActions.redo();
  };

  // Apply changes from history to database
  useEffect(() => {
    if (!isUndoingRef.current || assignmentHistory.size === 0) {
      isUndoingRef.current = false;
      return;
    }

    // Apply all changes in the current history state
    const applyChanges = async () => {
      for (const [category_id, amount] of assignmentHistory) {
        try {
          await updateAssignment({ category_id, amount, month: currentMonth });
        } catch (error) {
          console.error('Error applying undo/redo:', error);
        }
      }
      isUndoingRef.current = false;
    };

    applyChanges();
  }, [assignmentHistory, currentMonth]);

  // Expose a function to track assignment changes
  const trackAssignmentChange = (category_id: string, oldAmount: string, newAmount: string) => {
    if (isUndoingRef.current) return;

    // Record the NEW state (what we just changed to)
    const newState = new Map(assignmentHistory);
    newState.set(category_id, newAmount);
    historyActions.set(newState);
  };

  // Pass the tracking function down through context or props
  // For now, we'll use a global event listener approach
  useEffect(() => {
    const handleAssignmentChange = (event: CustomEvent<AssignmentChange>) => {
      trackAssignmentChange(
        event.detail.category_id,
        event.detail.oldAmount,
        event.detail.newAmount
      );
    };

    window.addEventListener('assignmentChange' as any, handleAssignmentChange);
    return () => {
      window.removeEventListener('assignmentChange' as any, handleAssignmentChange);
    };
  }, [assignmentHistory]);

  return (
    <>
      <UndoRedoControls
        canUndo={historyActions.canUndo}
        canRedo={historyActions.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <BudgetDashboard budgetData={budgetData} currentMonth={currentMonth} />
    </>
  );
}
