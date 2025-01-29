# Expense Tracker

A modern, full-stack expense tracking application built with React, Material-UI, and Supabase. Track your expenses, visualize spending patterns, and manage your financial data securely.

![Expense Tracker Screenshot](https://i.imgur.com/example.png)

## Features

- 🔐 **Secure Authentication**
  - Email & password authentication
  - Password reset with verification codes
  - Session management with auto-logout
  - Secure password requirements

- 💰 **Expense Management**
  - Add, edit, and delete expenses
  - Categorize expenses
  - Add descriptions and dates
  - Filter expenses by date range and category

- 📊 **Visual Analytics**
  - Category distribution pie chart
  - Monthly spending trends
  - Category-wise breakdowns
  - Total spending insights

- 🎨 **Modern UI/UX**
  - Responsive design for all devices
  - Dark/Light theme support
  - Material Design components
  - Smooth animations and transitions

- 🛡️ **Security Features**
  - Row Level Security (RLS)
  - Secure password storage
  - Protected API endpoints
  - Activity logging

## Tech Stack

- **Frontend**
  - React 18
  - Material-UI v5
  - MUI X-Charts
  - date-fns
  - Vite

- **Backend**
  - Supabase
  - PostgreSQL
  - Row Level Security
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

### Database Setup

The application requires the following tables in your Supabase database:

1. `expenses` - Stores user expenses
2. `auth_logs` - Tracks authentication events

Run the provided migration files in the `supabase/migrations` directory to set up the database schema and security policies.

## Project Structure

```
expense-tracker/
├── src/
│   ├── components/         # React components
│   │   ├── Auth.jsx       # Authentication component
│   │   ├── ExpenseForm.jsx
│   │   ├── ExpenseList.jsx
│   │   ├── ExpenseInsights.jsx
│   │   └── Navbar.jsx
│   ├── lib/               # Utility functions
│   │   └── supabase.js    # Supabase client
│   └── App.jsx            # Main application component
├── supabase/
│   └── migrations/        # Database migrations
└── public/               # Static assets
```

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Session timeout after 30 minutes of inactivity
- Secure password reset with verification codes
- All authentication events are logged

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
- [React](https://reactjs.org/) for the frontend framework
- [Vite](https://vitejs.dev/) for the build tool

## Support

