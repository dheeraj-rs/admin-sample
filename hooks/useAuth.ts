import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clearUserData } from '@/lib/auth';

interface User {
  username: string;
  role: string;
  isActive: boolean;
  _id: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Global flag to prevent multiple simultaneous auth checks
let globalAuthCheckInProgress = false;
let globalAuthState: AuthState | null = null;

// Function to reset global auth state (useful for testing or logout)
export const resetGlobalAuthState = () => {
  globalAuthCheckInProgress = false;
  globalAuthState = null;
};

// Function to get auth token from cookies
const getAuthToken = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
  return authCookie ? authCookie.split('=')[1] : null;
};

// Function to get user data from cookies
const getUserData = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const userCookie = cookies.find(cookie => cookie.trim().startsWith('user_data='));
  if (userCookie) {
    try {
      const cookieValue = userCookie.split('=')[1];
      // Check if the value is undefined, empty, or malformed
      if (!cookieValue || cookieValue === 'undefined' || cookieValue === 'null' || cookieValue === '""') {
        return null;
      }
      
      // Try to decode the URI component first
      let decodedValue;
      try {
        decodedValue = decodeURIComponent(cookieValue);
      } catch (decodeError) {
        console.error('Error decoding cookie value:', decodeError);
        // Clear the malformed cookie
        document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return null;
      }
      
      // Validate the decoded value
      if (!decodedValue || decodedValue === 'undefined' || decodedValue === 'null' || decodedValue === '""') {
        return null;
      }
      
      // Try to parse the JSON
      const parsedData = JSON.parse(decodedValue);
      
      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object' || !parsedData.username || !parsedData.role) {
        console.error('Invalid user data structure:', parsedData);
        // Clear the invalid cookie
        document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return null;
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      // Clear the invalid cookie
      document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return null;
    }
  }
  return null;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize with global state if available
    if (globalAuthState) {
      return globalAuthState;
    }
    
    // Check if we have auth data in cookies on initialization
    const token = getAuthToken();
    const userData = getUserData();
    
    if (token && userData) {
      const initialState = {
        isAuthenticated: true,
        user: userData,
        isLoading: false,
        error: null,
      };
      globalAuthState = initialState;
      return initialState;
    }
    
    return {
      isAuthenticated: false,
      user: null,
      isLoading: true,
      error: null,
    };
  });
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    // Prevent multiple simultaneous auth checks globally
    if (globalAuthCheckInProgress) {
      return;
    }

    // Prevent multiple checks in this instance
    if (hasCheckedAuth.current) {
      return;
    }

    try {
      globalAuthCheckInProgress = true;
      hasCheckedAuth.current = true;
      
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      const newAuthState = {
        isAuthenticated: response.ok && data.authenticated,
        user: response.ok && data.authenticated ? data.user : null,
        isLoading: false,
        error: response.ok ? null : (data.error || 'Authentication failed'),
      };

      // Update global state
      globalAuthState = newAuthState;
      setAuthState(newAuthState);

      if (!response.ok) {
        // Clear invalid cookies
        clearUserData();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearUserData();
      
      const errorState = {
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Failed to check authentication',
      };
      
      globalAuthState = errorState;
      setAuthState(errorState);
    } finally {
      globalAuthCheckInProgress = false;
      hasCheckedAuth.current = false;
    }
  }, []);

  const logout = useCallback(() => {
    clearUserData();
    const logoutState = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    };
    globalAuthState = logoutState;
    setAuthState(logoutState);
    router.push('/auth/pin');
  }, [router]);

  // Check authentication only once on mount
  useEffect(() => {
    if (!hasCheckedAuth.current && !globalAuthState) {
      checkAuth();
    } else if (globalAuthState) {
      // Use cached global state
      setAuthState(globalAuthState);
    }
  }, []); // Empty dependency array to run only once

  return {
    ...authState,
    checkAuth,
    logout,
  };
}; 