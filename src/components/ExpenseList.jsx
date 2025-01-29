import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Box,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
  Collapse,
  Typography,
  Tooltip,
  Fade,
  InputAdornment,
  InputBase,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

const categories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

const categoryColors = {
  Food: '#FF6B6B',
  Transportation: '#4ECDC4',
  Entertainment: '#4A90E2',
  Shopping: '#F7B731',
  Bills: '#A3A1FB',
  Other: '#8E8E93'
};

export default function ExpenseList({ expenses, onExpenseDeleted }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, expense: null });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = selectedCategory ? expense.category === selectedCategory : true;
    const matchesDateRange = dateRange.start && dateRange.end
      ? new Date(expense.date) >= new Date(dateRange.start) &&
        new Date(expense.date) <= new Date(dateRange.end)
      : true;
    const matchesSearch = searchQuery
      ? expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.amount.toString().includes(searchQuery) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesDateRange && matchesSearch;
  });

  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      if (onExpenseDeleted) onExpenseDeleted();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditDialog({ open: true, expense: { ...expense } });
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: parseFloat(editDialog.expense.amount),
          category: editDialog.expense.category,
          description: editDialog.expense.description,
          date: editDialog.expense.date,
        })
        .eq('id', editDialog.expense.id);

      if (error) throw error;
      if (onExpenseDeleted) onExpenseDeleted();
      setEditDialog({ open: false, expense: null });
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedCategory('');
  };

  const handleExport = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const csvData = [
      headers,
      ...filteredExpenses.map(expense => [
        format(new Date(expense.date), 'yyyy-MM-dd'),
        expense.category,
        expense.description,
        expense.amount
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n').slice(1); // Skip header row
          
          for (const row of rows) {
            const [date, category, description, amount] = row.split(',');
            if (date && category && amount) {
              await supabase.from('expenses').insert([{
                date,
                category,
                description: description || '',
                amount: parseFloat(amount),
                user_id: (await supabase.auth.getUser()).data.user.id
              }]);
            }
          }
          
          if (onExpenseDeleted) onExpenseDeleted();
        } catch (error) {
          console.error('Error importing expenses:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const hasActiveFilters = dateRange.start || dateRange.end || selectedCategory;

  return (
    <>
      <Box sx={{ mb: 3, px: { xs: 2, sm: 0 } }}>
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Expense List
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasActiveFilters && (
              <Tooltip title="Clear all filters">
                <IconButton 
                  onClick={clearFilters}
                  size="small"
                  color="primary"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={showFilters ? "Hide filters" : "Show filters"}>
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                size="small"
                color={hasActiveFilters ? "primary" : "default"}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}>
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              borderRadius: 2,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              }
            />
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Export expenses">
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              >
                Export
              </Button>
            </Tooltip>
            
            <Tooltip title="Import expenses">
              <Button
                component="label"
                startIcon={<FileUploadIcon />}
                variant="outlined"
                size={isMobile ? "small" : "medium"}
              >
                Import
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleImport}
                />
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              background: theme.palette.background.paper,
            }}
          >
            <Box sx={{ 
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }
            }}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size={isMobile ? "small" : "medium"}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
                size={isMobile ? "small" : "medium"}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                select
                label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                size={isMobile ? "small" : "medium"}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: categoryColors[category],
                        }}
                      />
                      {category}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Paper>
        </Collapse>

        {hasActiveFilters && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {dateRange.start && dateRange.end && (
              <Chip
                label={`${format(new Date(dateRange.start), 'MMM d, yyyy')} - ${format(new Date(dateRange.end), 'MMM d, yyyy')}`}
                onDelete={() => setDateRange({ start: '', end: '' })}
                size={isMobile ? "small" : "medium"}
                sx={{ borderRadius: 2 }}
              />
            )}
            {selectedCategory && (
              <Chip
                label={selectedCategory}
                onDelete={() => setSelectedCategory('')}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: `${categoryColors[selectedCategory]}15`,
                  borderColor: `${categoryColors[selectedCategory]}30`,
                  '& .MuiChip-deleteIcon': {
                    color: categoryColors[selectedCategory],
                  }
                }}
              />
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ px: { xs: 2, sm: 0 } }}>
        <TableContainer 
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            '.MuiTableCell-root': {
              px: { xs: 1, sm: 2 },
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.8rem', sm: '1rem' },
              borderColor: 'divider',
            },
            '.MuiTableHead-root .MuiTableCell-root': {
              fontWeight: 600,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
            }
          }}
        >
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedExpenses.map((expense) => (
                <TableRow 
                  key={expense.id}
                  sx={{
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Chip
                      label={expense.category}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        bgcolor: `${categoryColors[expense.category]}15`,
                        color: categoryColors[expense.category],
                        border: '1px solid',
                        borderColor: `${categoryColors[expense.category]}30`,
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell align="right">₹{expense.amount.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit expense" arrow>
                      <IconButton
                        onClick={() => handleEdit(expense)}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <EditIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete expense" arrow>
                      <IconButton
                        onClick={() => handleDelete(expense.id)}
                        color="error"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No expenses found {hasActiveFilters && 'matching the filters'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, expense: null })}
        TransitionComponent={Fade}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={editDialog.expense?.amount || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                expense: { ...editDialog.expense, amount: e.target.value }
              })}
              size={isMobile ? "small" : "medium"}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              select
              label="Category"
              value={editDialog.expense?.category || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                expense: { ...editDialog.expense, category: e.target.value }
              })}
              size={isMobile ? "small" : "medium"}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: categoryColors[category],
                      }}
                    />
                    {category}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={editDialog.expense?.description || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                expense: { ...editDialog.expense, description: e.target.value }
              })}
              size={isMobile ? "small" : "medium"}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="Date"
              type="date"
              value={editDialog.expense?.date || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                expense: { ...editDialog.expense, date: e.target.value }
              })}
              InputLabelProps={{ shrink: true }}
              size={isMobile ? "small" : "medium"}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button 
            onClick={() => setEditDialog({ open: false, expense: null })}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 100,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}