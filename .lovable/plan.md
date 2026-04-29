## Plan: Full-featured Gaming/Betting Admin Dashboard

Build a secure admin-only dashboard with persistent database storage, CRUD screens for all requested modules, bid management, analytics, and global search/filtering.

## Scope

### 1. Authentication and admin access
- Add admin login using email/password authentication.
- Protect all dashboard routes so unauthenticated users see only the login page.
- Because you selected “No profiles needed,” avoid a profiles table.
- Add a separate roles table for admin authorization, so admin permissions are not stored on users/profiles.
- Use secure server-side/database role checks instead of client-side flags.

### 2. Dashboard layout
- Replace the placeholder page with a full admin app shell.
- Add a sidebar navigation with sections:
  - Dashboard
  - Users
  - Withdraw Details
  - Markets
  - Results
  - Bids
  - Win History
  - Market Records
  - Reports
- Add a top bar with global search, date/market/status filters where relevant, and logout.
- Ensure the layout works on desktop and mobile with a collapsible sidebar.

### 3. Database-backed modules

#### Users module
Create CRUD screens and database table for:
- ID
- Name
- Phone
- Password field handling: do not store plain text passwords in the users table. Admin login will use Supabase Auth; app-player password handling should be avoided or migrated to secure auth if needed.
- Balance
- Total Game Amount
- Total Won
- Total Withdraw
- Total Bonus
- Status: blocked/unblocked
- Created At

Operations:
- Create user
- View users with search/filter
- Update user details, balance, and status
- Delete user
- Add/deduct balance with validation and transaction history

#### Withdraw details module
Create CRUD for:
- User
- Account holder name
- UPI name
- Account number
- IFSC code
- UPI ID
- Created At

Operations:
- Add, view, update, delete records
- Link withdraw details to a user where possible

#### Markets module
Create CRUD for:
- Market name
- Status: open/closed
- Open time
- Created At

Operations:
- Create market
- Start/stop market
- Update market time
- Delete market

#### Results module
Create CRUD for:
- Date
- Market
- Open pana
- Open digit

Operations:
- Create result
- Update result
- Delete result
- View previous results

#### Bids module
Because you selected “Include bid CRUD,” add a complete bid management module with:
- User
- Market
- Date
- Bid type: single digit, single pana, double pana, triple pana, etc.
- Number played
- Amount
- Status/result state where useful
- Created At

Operations:
- Create bid
- View/search/filter bids
- Update bid
- Delete bid

#### Win history module
Create read/reporting screens for:
- ID
- Market name
- Winner name
- Winner phone
- Amount
- Number played
- Win amount
- Created At

Operations:
- View win history
- Filter by date and market

#### Market records / bids data
Create aggregated views for:
- Date
- Market name
- Total bids
- Single digit count for 0–9
- Single pana totals
- Double pana totals
- Triple pana totals

### 4. Analytics dashboard
Show live stats computed from database data:
- Total users
- Total bids
- Total bid amount
- Total commission amount
- Total deposit
- Total withdraw

Add bid analysis widgets:
- Single ank totals for 0–9
- Patti/ank distribution
- Market-wise stats
- Date-wise reports
- Recent users, bids, withdrawals, and results

### 5. Global search and filters
Implement reusable filters across modules:
- Search by name or phone
- Filter by date
- Filter by market
- Filter by status
- Table-level filtering, sorting, and pagination for large datasets

### 6. UX and visual design
- Use a modern dark admin dashboard style suitable for a gaming/betting system.
- Use cards for analytics, data tables for records, modal/drawer forms for create/update actions, and clear status badges.
- Add confirmation dialogs for destructive actions like delete.
- Add success/error notifications for all CRUD operations.
- Add empty states and loading states.

## Security and data rules

- Enable Row Level Security on all database tables.
- Only authenticated admins can access dashboard data.
- Store admin roles in a dedicated `user_roles` table, not on users/profiles.
- Do not rely on localStorage/sessionStorage for admin permissions.
- Validate form input on the client side and enforce constraints in the database.
- Do not store plain text passwords. If app players need real login later, they should use a secure authentication flow instead of a custom password column.
- Add balance transaction records so add/deduct operations are auditable.

## Technical implementation details

- Use Lovable Cloud/Supabase for database, authentication, and RLS.
- Add database schema for:
  - `user_roles`
  - `app_users`
  - `balance_transactions`
  - `withdraw_details`
  - `markets`
  - `results`
  - `bids`
  - optional computed/reporting views or RPCs for dashboard analytics
- Add React routes/pages for each dashboard module.
- Use TanStack Query for loading and mutating database data.
- Use existing shadcn UI components for tables, dialogs, forms, inputs, selects, badges, cards, and sidebar.
- Add Supabase client integration if it is not already present.

## Implementation order

1. Set up Lovable Cloud/Supabase integration, auth, admin role table, and protected routing.
2. Create the database schema with RLS policies and validation constraints.
3. Build the admin app shell: login page, sidebar, top bar, protected dashboard layout.
4. Build CRUD modules for users, withdraw details, markets, results, and bids.
5. Build win history, market records, and analytics dashboards.
6. Add global filters, table search, pagination, loading states, confirmations, and notifications.
7. Test flows for login, CRUD operations, filters, balance updates, and analytics calculations.