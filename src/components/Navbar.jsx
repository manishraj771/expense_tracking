import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip,
  Button,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import InsightsIcon from '@mui/icons-material/Insights';
import { supabase } from '../lib/supabase';

export default function Navbar({ user, darkMode, onThemeChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage or session data
      localStorage.removeItem('expense-tracker-auth');
      sessionStorage.clear();
      
      // Force reload the page to clear the application state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleClose();
  };

  const getInitials = () => {
    const firstName = user?.user_metadata?.first_name || '';
    const lastName = user?.user_metadata?.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const scrollToInsights = () => {
    const insightsSection = document.querySelector('#insights-section');
    if (insightsSection) {
      insightsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AppBar 
      position="sticky" 
      color="primary" 
      elevation={1}
      sx={{
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          component="div" 
          sx={{ flexGrow: 1 }}
        >
          Expense Tracker
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            startIcon={<InsightsIcon />}
            onClick={scrollToInsights}
            color="inherit"
            sx={{
              display: { xs: 'none', sm: 'flex' },
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Insights
          </Button>
          <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
            <IconButton onClick={onThemeChange} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Typography 
            variant={isMobile ? "body2" : "body1"}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </Typography>
          <IconButton
            onClick={handleClick}
            size={isMobile ? "small" : "medium"}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          >
            <Avatar 
              sx={{ 
                width: isMobile ? 28 : 32, 
                height: isMobile ? 28 : 32, 
                bgcolor: 'secondary.main',
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}
            >
              {getInitials()}
            </Avatar>
          </IconButton>
        </Box>
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 120,
              mt: 1,
              '& .MuiMenuItem-root': {
                transition: 'background-color 0.2s',
              },
            }
          }}
        >
          {isMobile && (
            <MenuItem onClick={scrollToInsights}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsightsIcon fontSize="small" />
                Insights
              </Box>
            </MenuItem>
          )}
          <MenuItem 
            onClick={handleSignOut}
            sx={{
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              },
            }}
          >
            Sign Out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}