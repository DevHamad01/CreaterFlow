import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '@/api/base44Client';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'default', public_settings: {} });

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser({
            id: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setAuthError({
          type: 'auth_error',
          message: error.message || 'Authentication error'
        });
      } finally {
        setIsLoadingAuth(false);
        setIsLoadingPublicSettings(false);
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = (shouldRedirect = true) => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setIsAuthenticated(false);
        if (shouldRedirect) {
          window.location.href = '/login';
        }
      })
      .catch((error) => {
        console.error('Logout error:', error);
        setAuthError({
          type: 'logout_error',
          message: error.message
        });
      });
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
