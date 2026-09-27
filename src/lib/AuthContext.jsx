import React, { createContext, useState, useContext, useEffect } from 'react';
import { authActions } from '@/api/base44Client';

/**
 * The signed-in user: Firebase identity fields plus whatever the app stores in
 * the `users` document (full_name, company_name, phone, ...), so screens can
 * read profile fields without a cast.
 *
 * @typedef {object} AuthUser
 * @property {string} id
 * @property {string} [email]
 * @property {string} [displayName]
 * @property {string} [photoURL]
 * @property {string} [full_name]
 * @property {string} [company_name]
 * @property {string} [phone]
 * @property {string} [user_type]
 * @property {string} [role]
 * @property {any} [extra]
 *
 * @typedef {object} AuthContextValue
 * @property {AuthUser | null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoadingAuth
 * @property {boolean} isLoadingPublicSettings
 * @property {string | null} authError
 * @property {boolean} authChecked
 * @property {{ id: string, public_settings: Record<string, any> }} appPublicSettings
 * @property {(shouldRedirect?: boolean) => void} logout
 * @property {() => void} navigateToLogin
 */

/** @type {import('react').Context<AuthContextValue>} */
const AuthContext = createContext(/** @type {any} */ (undefined));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'default', public_settings: {} });

  useEffect(() => {
    // Listen to auth state changes.
    //
    // Goes through authActions.observeAuth rather than calling Firebase's
    // onAuthStateChanged with the `auth` export. When Firebase is not
    // configured that export is a signed-out stub, and Firebase reads
    // `auth.app.settings` off it and throws
    // "Cannot read properties of undefined (reading 'settings')". Because this
    // subscription runs on every page mount, that took down the whole app on
    // every route — the sign-in button looked dead because no request was ever
    // made. observeAuth reports `null` and returns a no-op unsubscribe instead.
    const unsubscribe = authActions.observeAuth(async (currentUser) => {
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
    authActions.signOut()
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

/** @returns {AuthContextValue} */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Exported so state tests can supply a signed-in context value without booting
// Firebase. Not used by app code.
export { AuthContext };
