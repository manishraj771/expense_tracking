import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { supabase } from '../lib/supabase';

const categories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export default function ExpenseForm({ onExpenseAdded }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('expenses').insert([
        {
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
          user_id: user.id
        },
      ]);

      if (error) throw error;

      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      if (onExpenseAdded) onExpenseAdded();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
        p: 3,
        width: '100%',
        px: { xs: 2, sm: 3 },
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Amount"
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        required
        fullWidth
        size={isMobile ? "small" : "medium"}
      />

      <TextField
        select
        label="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        required
        fullWidth
        size={isMobile ? "small" : "medium"}
      >
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        fullWidth
        size={isMobile ? "small" : "medium"}
      />

      <TextField
        type="date"
        label="Date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
        InputLabelProps={{ shrink: true }}
        fullWidth
        size={isMobile ? "small" : "medium"}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        fullWidth
        size={isMobile ? "small" : "medium"}
      >
        Add Expense
      </Button>
    </Box>
  );
}