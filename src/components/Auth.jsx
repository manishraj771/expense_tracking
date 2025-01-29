import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Tabs, 
  Tab,
  useTheme,
  useMediaQuery,
  FormHelperText,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

function Auth() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [resetData, setResetData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (!PASSWORD_REGEX.uppercase.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!PASSWORD_REGEX.lowercase.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!PASSWORD_REGEX.number.test(password)) {
      errors.push('One number');
    }
    if (!PASSWORD_REGEX.special.test(password)) {
      errors.push('One special character');
    }

    return errors;
  };

  const passwordErrors = validatePassword(formData.password);
  const showPasswordErrors = !isLogin && passwordTouched && passwordErrors.length > 0;
  const resetPasswordErrors = validatePassword(resetData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
          options: {
            cookieOptions: {
              name: 'expense-tracker-session',
              lifetime: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
              sameSite: 'strict',
              secure: true,
              httpOnly: true,
            }
          }
        });
        if (error) throw error;

        await supabase.from('auth_logs').insert([{
          event: 'login',
          user_email: formData.email,
          success: true,
          ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip),
          user_agent: navigator.userAgent
        }]);
      } else {
        if (passwordErrors.length > 0) {
          setError('Please fix the password requirements');
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName
            }
          }
        });
        if (signUpError) throw signUpError;

        await supabase.from('auth_logs').insert([{
          event: 'registration',
          user_email: formData.email,
          success: true,
          ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip),
          user_agent: navigator.userAgent
        }]);
      }
    } catch (error) {
      setError(error.message);
      await supabase.from('auth_logs').insert([{
        event: isLogin ? 'login_failed' : 'registration_failed',
        user_email: formData.email,
        success: false,
        error_message: error.message,
        ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip),
        user_agent: navigator.userAgent
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'password') {
      setPasswordTouched(true);
    }
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleRequestCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Force numeric OTP code
      const { error } = await supabase.auth.signInWithOtp({
        email: resetData.email,
        options: {
          shouldCreateUser: false,
          data: {
            type: 'sms' // This forces numeric codes instead of magic links
          }
        }
      });
      
      if (error) throw error;

      setSuccess('A 6-digit verification code has been sent to your email');
      setResetStep(1);

      await supabase.from('auth_logs').insert([{
        event: 'reset_code_requested',
        user_email: resetData.email,
        success: true,
        ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip),
        user_agent: navigator.userAgent
      }]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (resetPasswordErrors.length > 0) {
      setError('Please fix the password requirements');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Verify OTP
      const { error: verifyError, data } = await supabase.auth.verifyOtp({
        email: resetData.email,
        token: resetData.code,
        type: 'email'
      });
      
      if (verifyError) throw verifyError;

      // If verification successful, update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: resetData.newPassword
      });

      if (updateError) throw updateError;

      setSuccess('Password has been reset successfully');
      setResetDialog(false);
      setResetStep(0);
      setResetData({
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: '',
      });

      await supabase.from('auth_logs').insert([{
        event: 'password_reset_success',
        user_email: resetData.email,
        success: true,
        ip_address: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip),
        user_agent: navigator.userAgent
      }]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSteps = ['Request Code', 'Reset Password'];

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
        p: { xs: 2, sm: 3 },
        width: '100%',
      }}
    >
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        gutterBottom
        sx={{ textAlign: 'center' }}
      >
        Expense Tracker
      </Typography>

      <Tabs
        value={isLogin ? 0 : 1}
        onChange={(_, newValue) => {
          setIsLogin(!newValue);
          setError(null);
          setSuccess(null);
          setPasswordTouched(false);
        }}
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab label="Sign In" />
        <Tab label="Sign Up" />
      </Tabs>
      
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      
      {!isLogin && (
        <>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required={!isLogin}
            size={isMobile ? "small" : "medium"}
            fullWidth
          />
          
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required={!isLogin}
            size={isMobile ? "small" : "medium"}
            fullWidth
          />
        </>
      )}
      
      <TextField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        size={isMobile ? "small" : "medium"}
        fullWidth
      />
      
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        size={isMobile ? "small" : "medium"}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {showPasswordErrors && (
        <Box sx={{ mt: -1 }}>
          <FormHelperText error component="div">
            Password must contain:
          </FormHelperText>
          <Box component="ul" sx={{ mt: 0.5, pl: 3 }}>
            {passwordErrors.map((error, index) => (
              <Box component="li" key={index} sx={{ color: theme.palette.error.main }}>
                {error}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            color="primary"
          />
        }
        label="Remember me"
      />
      
      <Button
        type="submit"
        variant="contained"
        disabled={loading || (!isLogin && passwordErrors.length > 0)}
        size={isMobile ? "small" : "medium"}
        fullWidth
      >
        {isLogin ? 'Sign In' : 'Sign Up'}
      </Button>

      {isLogin && (
        <Button
          variant="text"
          onClick={() => setResetDialog(true)}
          size={isMobile ? "small" : "medium"}
        >
          Forgot Password?
        </Button>
      )}

      <Dialog 
        open={resetDialog} 
        onClose={() => {
          setResetDialog(false);
          setResetStep(0);
          setResetData({
            email: '',
            code: '',
            newPassword: '',
            confirmPassword: '',
          });
          setError(null);
          setSuccess(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', mt: 2, mb: 3 }}>
            <Stepper activeStep={resetStep} alternativeLabel>
              {resetSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {resetStep === 0 ? (
            <TextField
              label="Email"
              type="email"
              name="email"
              value={resetData.email}
              onChange={handleResetChange}
              fullWidth
              required
              size={isMobile ? "small" : "medium"}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Verification Code"
                name="code"
                value={resetData.code}
                onChange={handleResetChange}
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={resetData.newPassword}
                onChange={handleResetChange}
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={resetData.confirmPassword}
                onChange={handleResetChange}
                fullWidth
                required
                size={isMobile ? "small" : "medium"}
              />
              {resetPasswordErrors.length > 0 && (
                <Box>
                  <FormHelperText error component="div">
                    Password must contain:
                  </FormHelperText>
                  <Box component="ul" sx={{ mt: 0.5, pl: 3 }}>
                    {resetPasswordErrors.map((error, index) => (
                      <Box component="li" key={index} sx={{ color: theme.palette.error.main }}>
                        {error}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => {
              setResetDialog(false);
              setResetStep(0);
              setResetData({
                email: '',
                code: '',
                newPassword: '',
                confirmPassword: '',
              });
              setError(null);
              setSuccess(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={resetStep === 0 ? handleRequestCode : handleVerifyCode}
            variant="contained"
            disabled={loading || (resetStep === 0 ? !resetData.email : !resetData.code || !resetData.newPassword || !resetData.confirmPassword)}
          >
            {resetStep === 0 ? 'Send Code' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Auth;