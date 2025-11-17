'use client';

import { useState } from 'react';
import { Account } from '@/lib/types/accounts';
import AccountFormModal from './AccountFormModal';
import TransferModal from './TransferModal';
import {
  createAccount,
  updateAccount,
  deleteAccount,
  createTransfer,
} from '@/app/actions/accounts';
import { formatCurrency } from '@/lib/utils/money';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from '@/lib/types/accounts';

interface AccountsPageClientProps {
  accounts: Account[];
  balances: Record<string, number>;
}

export default function AccountsPageClient({
  accounts,
  balances,
}: AccountsPageClientProps) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = async (data: any) => {
    if (data.id) {
      await updateAccount(data);
    } else {
      await createAccount(data);
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    if (
      confirm(
        `Delete "${account.name}"? This action cannot be undone. You can only delete accounts with no transactions.`
      )
    ) {
      try {
        await deleteAccount(account.id);
      } catch (error: any) {
        alert(error.message || 'Failed to delete account');
      }
    }
  };

  const handleTransferSubmit = async (data: any) => {
    await createTransfer(data);
  };

  // Calculate total balance across all accounts
  const totalBalance = Object.values(balances).reduce((sum, bal) => sum + bal, 0);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Accounts
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your bank accounts and balances
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm sm:text-base"
            >
              Transfer
            </button>
            <button
              onClick={handleCreateAccount}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">New Account</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6">
          <p className="text-indigo-100 text-sm font-medium">Total Balance</p>
          <p className="text-white text-4xl font-bold mt-2">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-indigo-100 text-sm mt-2">
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Accounts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No accounts yet. Create your first account to get started!
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {ACCOUNT_TYPE_ICONS[account.type]}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {ACCOUNT_TYPE_LABELS[account.type]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(balances[account.id] || 0)}
                    </p>
                  </div>

                  {account.notes && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {account.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="flex-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account)}
                      className="flex-1 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Account Form Modal */}
      <AccountFormModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={handleAccountSubmit}
        account={editingAccount}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSubmit={handleTransferSubmit}
        accounts={accounts}
      />
    </>
  );
}
