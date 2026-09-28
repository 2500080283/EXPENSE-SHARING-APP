# ShareWise — Smart Group Expense Sharing & Debt Settlement Platform

ShareWise is a web application designed to simplify bill splitting, manage group living expenses, track who owes whom, and eliminate disputes with smart debt simplification and automated payment reminders.

---

## 🌟 Key Features

### 👤 User Module
- **Net Balance Hub**: Instant summary of your overall balance (*You are owed*, *You owe*, or *Settled up*).
- **Smart Debt Simplification**: Built-in greedy min-cash-flow algorithm reducing multi-person criss-crossing debts into the minimum number of transactions.
- **Group Management & Detail**:
  - Filterable group expenses feed with expandable split allocations.
  - Subtab toggles between **Simplified Debts** and **Direct Pairwise Debts**.
  - 1-Click **Settle** button for every suggested transfer.
  - CSV export for group expenditures.
- **Expense Logging**:
  - Equal split (with penny precision adjustment).
  - Exact dollar amounts (with mismatch validation).
  - Percentages (with sum-to-100% check).
  - Weight-based shares.
- **Settlement & Confetti**: Record payments via Venmo, Cash, UPI/GPay, PayPal, Bank Transfer, or Revolut with celebration fireworks via `canvas-confetti`.
- **Payment Reminders**: Tone presets (*Friendly Nudge*, *Casual Chat*, *Formal Notice*) with WhatsApp, SMS, clipboard copy, and in-app notifications.
- **Friends & 1-on-1 Splits**: Pairwise debt tracking and direct settlement without needing a group.
- **Visual Analytics**: Interactive SVG donut chart by category, spenders leaderboard, and group breakdowns.

---

### 🛡️ Admin Module
- **System Control Dashboard**: Live KPIs for total users, groups, transacted volume, and open disputes.
- **User Accounts Management**: Activate / Suspend accounts, toggle Admin / User roles, and register new members.
- **Groups Oversight**: Audit all collaborative spaces, total spends, and archive/delete inactive groups.
- **Dispute Mediation Desk**: Review member disputes, examine reasons, and enter official admin resolution notes to close tickets.
- **High-Value Expense Ledger**: Automatic monitoring and flagging of transactions over $400.
- **Custom Categories & Settings**: Create custom categories with color pickers and icon selectors; adjust default currency and max group size.
- **Database Backup & Maintenance**: Real-time storage footprint meter, full system JSON backup export, JSON restore, and factory demo data reset.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite 8
- **Styling**: Modern Vanilla CSS (`src/index.css`) with Glassmorphism and CSS Custom Properties
- **Icons**: `lucide-react`
- **Effects**: `canvas-confetti`
- **Storage**: Client-side resilient LocalStorage engine with pre-loaded demo data

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

### 3. Build for Production
```bash
npm run build
```
