import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { supabase } from '../lib/supabase';

export default function BudgetManager({ expenses }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBudgetSet, setIsBudgetSet] = useState(false);


  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) setMonthlyBudget(data.amount);
      setIsBudgetSet(true); // Budget exists, so hide input fields

    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          amount: monthlyBudget
        });

      if (error) throw error;
      setIsBudgetSet(true); // Hide input after saving

    } catch (error) {
      setError(error.message);
    }
  };
  const handleEditBudget = () => {
    setIsBudgetSet(false); // Show input field again
  };


  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() &&
           expenseDate.getFullYear() === now.getFullYear();
  });

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const spendingPercentage = (totalSpent / monthlyBudget) * 100;
  const remainingBudget = monthlyBudget - totalSpent;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        mb: 3,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Budget Manager
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          label="Monthly Budget"
          type="number"
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(parseFloat(e.target.value))}
          size={isMobile ? "small" : "medium"}
          fullWidth
          InputProps={{
            startAdornment: <Typography>₹</Typography>,
          }}
        />
        <Button
          variant="contained"
          onClick={handleSaveBudget}
          sx={{ minWidth: { xs: '100%', sm: 120 } }}
        >
          Save Budget
        </Button>
      </Box>

      {monthlyBudget > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Monthly Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {spendingPercentage.toFixed(1)}%
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={Math.min(spendingPercentage, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              mb: 2,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: spendingPercentage > 90 ? 'error.main' :
                               spendingPercentage > 75 ? 'warning.main' :
                               'success.main',
              },
            }}
          />

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2 
          }}>
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ₹{monthlyBudget.toFixed(0)}
              </Typography>
              <Typography variant="body2">
                Monthly Budget
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ₹{totalSpent.toFixed(0)}
              </Typography>
              <Typography variant="body2">
                Spent
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: remainingBudget >= 0 ? 'success.main' : 'error.main',
                color: 'success.contrastText',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ₹{Math.abs(remainingBudget).toFixed(0)}
              </Typography>
              <Typography variant="body2">
                {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}
    </Paper>
  );
}