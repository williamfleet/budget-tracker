# Epps Budget - Feature Roadmap

## Completed Features ✓

### Core Features
- ✓ User Authentication (Supabase Auth)
- ✓ Budget Dashboard with Month Navigation
- ✓ Transaction Entry and Management
- ✓ Assign Workflow (inline editing)
- ✓ Transaction History Page
- ✓ Month-to-Month Rollover
- ✓ Historical Data Import (CSV)
- ✓ Mobile Optimization with Sticky Columns
- ✓ Category Management (CRUD with Archive System)
- ✓ Target Amounts Display
- ✓ Total Available Metric
- ✓ PWA Support with Favicons
- ✓ Target/Goal Tracking with Progress Bars
- ✓ Reports & Analytics with Charts
- ✓ Account Management System
- ✓ Debt Payoff Planner

### Quick Wins (Completed November 2025)
- ✓ Dark mode support with theme toggle
- ✓ Keyboard shortcuts for power users (Navigation: B/T/C/R/A, Actions: N, General: D/?/Esc, Undo/Redo: Cmd+Z/Cmd+Shift+Z)
- ✓ Bulk transaction editing and deletion
- ✓ Transaction splits across multiple categories
- ✓ Undo/redo for budget assignment changes

---

## Priority 1: Core Budget Features

### ~~1. Target/Goal Tracking & Progress~~ ✓ COMPLETED
**Description:** Visual progress indicators showing how close categories are to their target amounts.

**Completed Features:**
- ✓ Progress bar showing Assigned vs Target for each category
- ✓ Color coding (green = met target, yellow = in progress, red = below target)
- ✓ "Quick Fill to Target" button for assign workflow
- ✓ Visual progress indicators in CategoryRow component

---

### ~~2. Reports & Analytics~~ ✓ COMPLETED
**Description:** Comprehensive spending insights and visualizations.

**Completed Features:**
- ✓ Spending by Category (pie chart, bar chart)
- ✓ Spending Trends Over Time (line graph)
- ✓ Income vs Expenses comparison
- ✓ Month-over-month comparison
- ✓ Category spending breakdown
- ✓ Reports page with recharts integration

---

### ~~3. Account Management~~ ✓ COMPLETED
**Description:** Support for multiple accounts (checking, savings, credit cards).

**Completed Features:**
- ✓ Create and manage multiple accounts
- ✓ Account balances and reconciliation
- ✓ Track account-specific transactions
- ✓ Account types (checking, savings, credit card, cash)
- ✓ Accounts table and management page

---

## Priority 2: Enhanced User Experience

### 4. Payee Management
**Description:** Track and manage transaction payees with autocomplete.

**Features:**
- Payee list management (add, edit, archive)
- Autocomplete suggestions when entering transactions
- Recent payees quick-select
- Payee spending reports
- Rename/merge duplicate payees

**Technical:**
- Create `payees` table or use unique payees from transactions
- Add autocomplete component to transaction form
- Create payee management page

---

### 5. Recurring Transactions
**Description:** Automate entry of recurring income/expenses.

**Features:**
- Set up recurring transaction templates
- Frequency options (daily, weekly, monthly, yearly)
- Auto-create transactions on schedule
- Notification before recurring transaction posts
- Edit/skip individual occurrences

**Technical:**
- Create `recurring_transactions` table
- Build cron job or scheduled function to create transactions
- Create recurring transaction management UI
- Add notification system

---

### 6. Advanced Search & Filtering
**Description:** Powerful search and filter capabilities across all data.

**Features:**
- Multi-criteria search (amount range, date range, category, payee)
- Saved search filters
- Quick filters (this week, last month, uncategorized)
- Search within specific accounts
- Export filtered results

**Technical:**
- Enhanced search UI component
- Update transaction service with advanced filtering
- Add query parameter support for shareable filtered views

---

## Priority 3: Data & Insights

### 7. Budget Templates
**Description:** Save and reuse budget configurations.

**Features:**
- Save current budget as template
- Load template for new month
- Share templates with other users
- Default monthly budget template
- Template categories: "Zero-based", "50/30/20", "Custom"

**Technical:**
- Create `budget_templates` table
- Template import/export functionality
- UI for template management

---

### 8. Spending Insights & Alerts
**Description:** Automated insights and warnings about spending patterns.

**Features:**
- Overspending alerts (category or overall)
- Unusual spending notifications
- Category underfunding warnings
- Month-end budget health summary
- Spending streaks (consecutive months under budget)

**Technical:**
- Create notification system
- Background jobs for analysis
- Alert preferences management

---

### 9. Data Import/Export
**Description:** Import from other budget apps and export data.

**Features:**
- Import from YNAB, Mint, Personal Capital
- Import bank statements (CSV, OFX, QFX)
- Export all data to CSV/JSON
- Backup and restore functionality
- Scheduled automatic backups

**Technical:**
- File parsing utilities for various formats
- Data transformation layer
- Export service with format options
- Backup to cloud storage integration

---

### 10. Notes & Attachments
**Description:** Add context to transactions and categories.

**Features:**
- Transaction notes/memos (expanded)
- Category notes (monthly or permanent)
- File attachments (receipts, invoices)
- Photo upload for receipts
- Search within notes

**Technical:**
- Update database to support longer memos
- File storage integration (Supabase Storage)
- Image upload component
- OCR for receipt scanning (optional advanced feature)

---

## Priority 4: Collaboration & Sharing

### 11. Budget Sharing
**Description:** Share budgets with partners or family members.

**Features:**
- Invite users to shared budget
- Permission levels (view-only, editor, admin)
- Activity log (who changed what)
- Comments on transactions
- Approval workflow for large expenses

**Technical:**
- Create `budget_shares` and `budget_permissions` tables
- Row-level security updates for shared access
- Collaboration UI components
- Real-time updates with Supabase Realtime

---

## Priority 5: Advanced Features

### ~~12. Debt Payoff Planner~~ ✓ COMPLETED
**Description:** Track and plan debt payoff strategies.

**Completed Features:**
- ✓ Add debt accounts (credit cards, loans)
- ✓ Interest rate tracking
- ✓ Payoff timeline visualization
- ✓ Snowball vs Avalanche method comparison
- ✓ Extra payment calculator
- ✓ Debts table and management page

---

### 13. Net Worth Tracking
**Description:** Track overall financial health over time.

**Features:**
- Assets (accounts, investments, property)
- Liabilities (debts, loans)
- Net worth calculation
- Historical net worth chart
- Monthly snapshots

**Technical:**
- Create `assets` and `liabilities` tables
- Net worth calculation service
- Trend visualization

---

### 14. Mobile App (React Native)
**Description:** Native mobile app for iOS and Android.

**Features:**
- All web features in native app
- Offline support with sync
- Push notifications
- Camera for receipt capture
- Touch ID / Face ID authentication

**Technical:**
- React Native with Expo
- Supabase client integration
- Offline-first architecture with local database
- Background sync

---

## Quick Wins (Small Improvements)

### Completed
- ✓ Dark mode support with theme toggle
- ✓ Keyboard shortcuts for power users (B/T/C/R/A navigation, N for new transaction, D for dark mode, Cmd+Z/Cmd+Shift+Z for undo/redo)
- ✓ Bulk transaction editing and deletion with multi-select
- ✓ Transaction splits (one transaction, multiple categories)
- ✓ Undo/redo for budget assignment changes

### Remaining
- [ ] Category emoji icons
- [ ] Budget health score
- [ ] Weekly spending summary email
- [ ] Transaction duplicate detection
- [ ] CSV export from any table/view

---

## Technical Debt & Optimizations

- [ ] Add loading states and skeletons
- [ ] Error boundary components
- [ ] Comprehensive error handling
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] E2E testing with Playwright
- [ ] Unit tests for critical business logic
- [ ] API rate limiting and caching
- [ ] Database query optimization and indexing
- [ ] Accessibility audit and improvements (WCAG compliance)
- [ ] Security audit

---

## Getting Started with Next Features

To implement any of these features:

1. Create database migrations in `supabase/migrations/`
2. Update TypeScript types in `lib/types/`
3. Create service layer functions in `lib/services/`
4. Build server actions in `app/actions/`
5. Create UI components in `components/`
6. Add new pages in `app/` directory
7. Test thoroughly
8. Update this roadmap

---

**Last Updated:** November 2025
