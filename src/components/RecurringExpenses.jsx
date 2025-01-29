import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../lib/supabase';

const frequencies = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function RecurringExpenses({ onExpenseAdded }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [dialog, setDialog] = useState({ open: false, expense: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  const fetchRecurringExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRecurringExpenses(data || []);
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const expense = {
        ...dialog.expense,
        user_id: user.id,
        amount: parseFloat(dialog.expense.amount),
      };

      const { error } = dialog.expense.id
        ? await supabase
            .from('recurring_expenses')
            .update(expense)
            .eq('id', expense.id)
        : await supabase
            .from('recurring_expenses')
            .insert([expense]);

      if (error) throw error;
      
      fetchRecurringExpenses();
      setDialog({ open: false, expense: null });
    } catch (error) {
      console.error('Error saving recurring expense:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
    }
  };

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
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Recurring Expenses
        </Typography>
        <Button
          variant="contained"
          onClick={() => setDialog({
            open: true,
            expense: {
              amount: '',
              category: '',
              description: '',
              frequency: 'monthly',
              day_of_month: 1,
            }
          })}
        >
          Add Recurring
        </Button>
      </Box>

      <TableContainer>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Day</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recurringExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell align="right">₹{expense.amount.toFixed(2)}</TableCell>
                <TableCell>{expense.frequency}</TableCell>
                <TableCell>{expense.day_of_month}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => setDialog({ open: true, expense })}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(expense.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, expense: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog.expense?.id ? 'Edit' : 'Add'} Recurring Expense
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={dialog.expense?.amount || ''}
              onChange={(e) => setDialog({
                ...dialog,
                expense: { ...dialog.expense, amount: e.target.value }
              })}
              fullWidth
            />
            <TextField
              label="Category"
              value={dialog.expense?.category || ''}
              onChange={(e) => setDialog({
                ...dialog,
                expense: { ...dialog.expense, category: e.target.value }
              })}
              fullWidth
            />
            <TextField
              label="Description"
              value={dialog.expense?.description || ''}
              onChange={(e) => setDialog({
                ...dialog,
                expense: { ...dialog.expense, description: e.target.value }
              })}
              fullWidth
            />
            <TextField
              select
              label="Frequency"
              value={dialog.expense?.frequency || 'monthly'}
              onChange={(e) => setDialog({
                ...dialog,
                expense: { ...dialog.expense, frequency: e.target.value }
              })}
              fullWidth
            >
              {frequencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Day of Month"
              type="number"
              value={dialog.expense?.day_of_month || 1}
              onChange={(e) => setDialog({
                ...dialog,
                expense: { ...dialog.expense, day_of_month: parseInt(e.target.value) }
              })}
              fullWidth
              InputProps={{
                inputProps: { min: 1, max: 31 }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, expense: null })}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}