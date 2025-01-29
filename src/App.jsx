import React, { useState, useEffect, Suspense } from 'react';
import { 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  useMediaQuery,
  Box,
  CircularProgress,
} from '@mui/material';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
//import BudgetManager from './components/BudgetManager';
// ####-------BudgetManager me abhi kaaam baaki hai isliye isko abhi comment--------########
//import RecurringExpenses from './components/RecurringExpenses';
// ####--------- RecurringExpenses me bhi kaaam baaki cheee ------------ #########
import LoadingState from './components/LoadingState';
import OfflineIndicator from './components/OfflineIndicator';

// Lazy load components for better performance
const ExpenseForm = React.lazy(() => import('./components/ExpenseForm'));
const ExpenseList = React.lazy(() => import('./components/ExpenseList'));
const ExpenseInsights = React.lazy(() => import('./components/ExpenseInsights'));

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [session, setSession] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121E30' : '#F5F7FA',
        paper: darkMode ? '#152D4A' : '#FFFFFF',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000);
        const timeUntilExpiry = expiresAt - new Date();
        
        setTimeout(async () => {
          const { data, error } = await supabase.auth.refreshSession();
          if (!error && data.session) {
            setSession(data.session);
          } else {
            await supabase.auth.signOut();
            setSession(null);
          }
        }, timeUntilExpiry - 5 * 60 * 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchExpenses();
    }
  }, [session]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh',
            width: '100vw',
            p: 3,
            background: darkMode
              ? 'linear-gradient(135deg, #0A1929 0%, #1A365D 100%)'
              : 'linear-gradient(135deg, #F5F7FA 0%, #E4E7EB 100%)',
          }}
        >
          <Container maxWidth="xl">
            <LoadingState type="list" count={5} />
            <LoadingState type="chart" />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: darkMode
              ? 'linear-gradient(135deg, #0A1929 0%, #1A365D 100%)'
              : 'linear-gradient(135deg, #F5F7FA 0%, #E4E7EB 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: darkMode
                ? 'radial-gradient(circle at 50% 0%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)'
                : 'radial-gradient(circle at 50% 0%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)',
              zIndex: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              background: darkMode
                ? 'radial-gradient(circle at 50% 50%, rgba(245, 0, 87, 0.05) 0%, transparent 50%)'
                : 'radial-gradient(circle at 50% 50%, rgba(245, 0, 87, 0.03) 0%, transparent 50%)',
              zIndex: 1,
            },
          }}
        >
          <Container 
            maxWidth="sm" 
            sx={{ 
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Auth />
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box sx={{ 
          minHeight: '100vh',
          width: '100vw',
          background: darkMode
            ? 'linear-gradient(135deg, #0A1929 0%, #1A365D 100%)'
            : 'linear-gradient(135deg, #F5F7FA 0%, #E4E7EB 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: darkMode
              ? 'radial-gradient(circle at 0% 0%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 0% 0%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)',
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '70%',
            height: '70%',
            background: darkMode
              ? 'radial-gradient(circle at 100% 100%, rgba(245, 0, 87, 0.05) 0%, transparent 50%)'
              : 'radial-gradient(circle at 100% 100%, rgba(245, 0, 87, 0.03) 0%, transparent 50%)',
            zIndex: 1,
          },
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Navbar 
            user={session.user} 
            darkMode={darkMode}
            onThemeChange={() => setDarkMode(!darkMode)}
          />
          <Box 
            component="main" 
            sx={{ 
              flex: 1,
              width: '100%',
              py: { xs: 2, sm: 4 },
              position: 'relative',
              zIndex: 2,
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            <Container maxWidth="xl">
              <Suspense fallback={<LoadingState type="list" count={3} />}>
                {/* <BudgetManager expenses={expenses} /> */}
                {/* /<RecurringExpenses onExpenseAdded={fetchExpenses} /> */}
                <ExpenseForm onExpenseAdded={fetchExpenses} />
                <ExpenseList expenses={expenses} onExpenseDeleted={fetchExpenses} />
                <ExpenseInsights expenses={expenses} />
              </Suspense>
            </Container>
          </Box>
        </Box>
        <OfflineIndicator />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App