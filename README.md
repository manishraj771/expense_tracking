# Expense Tracker

A modern, full-stack expense tracking application built with React, Material-UI, and Supabase. Track your expenses, visualize spending patterns, and manage your financial data securely.

## Features

- 💰 **Expense Management**
  - Add, edit, and delete expenses
  - Categorize expenses with custom categories
  - Add descriptions and dates
  - Import/Export expenses as CSV
  - Recurring expenses support

- 📊 **Financial Insights**
  - Category distribution pie chart
  - Monthly spending trends
  - Category-wise breakdowns
  - Total spending insights
  - Budget tracking and alerts

- 💼 **Budget Management**
  - Set monthly budgets
  - Track spending against budget
  - Visual progress indicators
  - Over-budget warnings
  - Remaining budget calculations

- 🔐 **Secure Authentication**
  - Email & password authentication
  - Session management
  - Automatic session timeout
  - Secure password requirements
  - Activity logging

- 🎨 **Modern UI/UX**
  - Responsive Material Design
  - Dark/Light theme support
  - Interactive charts and graphs
  - Smooth animations
  - Mobile-friendly interface

## Tech Stack

- **Frontend**
  - React 18
  - Material-UI v5
  - MUI X-Charts
  - date-fns
  - Vite

- **Backend & Database**
  - Supabase
  - PostgreSQL
  - Row Level Security (RLS)
  - Real-time subscriptions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
expense-tracker/
├── src/
│   ├── components/           # React components
│   │   ├── Auth.jsx         # Authentication component
│   │   ├── BudgetManager.jsx
│   │   ├── ExpenseForm.jsx
│   │   ├── ExpenseList.jsx
│   │   ├── ExpenseInsights.jsx
│   │   ├── LoadingState.jsx
│   │   ├── Navbar.jsx
│   │   ├── OfflineIndicator.jsx
│   │   └── RecurringExpenses.jsx
│   ├── lib/                 # Utility functions
│   │   └── supabase.js      # Supabase client
│   └── App.jsx              # Main application component
├── supabase/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## Features in Detail

### Expense Management
- Add one-time or recurring expenses
- Categorize expenses for better organization
- Filter and search expenses
- Import/Export functionality for data backup
- Bulk operations support

### Budget Tracking
- Set and manage monthly budgets
- Visual progress indicators
- Category-wise budget allocation
- Overspending alerts
- Monthly rollover tracking

### Data Visualization
- Interactive pie charts for category distribution
- Monthly trend analysis
- Spending patterns visualization
- Budget vs actual comparison
- Category-wise breakdowns

### Security Features
- Row Level Security (RLS)
- Secure password storage
- Session management
- Activity logging
- Data encryption

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Material-UI](https://mui.com/) for the beautiful components
- [Supabase](https://supabase.com/) for the backend infrastructure
-  [Node.js](https://Nodejs.org/)for the backend
- [React](https://reactjs.org/) for the frontend framework
- [Vite](https://vitejs.dev/) for the build tool