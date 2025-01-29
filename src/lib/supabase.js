import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a custom fetch function with retry logic
const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: localStorage,
    storageKey: 'expense-tracker-auth',
    flowType: 'pkce',
    fetch: fetchWithRetry,
    cookieOptions: {
      name: 'expense-tracker-session',
      lifetime: 24 * 60 * 60,
      domain: window.location.hostname,
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'expense-tracker'
    }
  }
});

// Session timeout after 30 minutes of inactivity
let inactivityTimeout;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

const resetInactivityTimer = () => {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }
  inactivityTimeout = setTimeout(async () => {
    await supabase.auth.signOut();
    window.location.reload();
  }, INACTIVITY_TIMEOUT);
};

if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
  });
}

// Add error handling for failed requests
supabase.handleFailedRequest = async (error, retryCount = 0) => {
  if (retryCount < 3 && error.message === 'Failed to fetch') {
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
    return true;
  }
  return false;
};

// Add offline detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    document.dispatchEvent(new CustomEvent('supabase-online'));
  });
  
  window.addEventListener('offline', () => {
    document.dispatchEvent(new CustomEvent('supabase-offline'));
  });
}

export const isPasswordValid = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial
  );
};

// Add offline storage
export const offlineStorage = {
  pendingActions: [],

  addPendingAction(action) {
    this.pendingActions.push(action);
    this.savePendingActions();
  },

  async processPendingActions() {
    const actions = [...this.pendingActions];
    this.pendingActions = [];
    this.savePendingActions();

    for (const action of actions) {
      try {
        await action();
      } catch (error) {
        console.error('Error processing pending action:', error);
        this.addPendingAction(action);
      }
    }
  },

  savePendingActions() {
    localStorage.setItem('pendingActions', JSON.stringify(this.pendingActions));
  },

  loadPendingActions() {
    const saved = localStorage.getItem('pendingActions');
    if (saved) {
      this.pendingActions = JSON.parse(saved);
    }
  }
};

// Process pending actions when coming online
document.addEventListener('supabase-online', () => {
  offlineStorage.processPendingActions();
});

// Load pending actions on startup
offlineStorage.loadPendingActions();