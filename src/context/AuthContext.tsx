import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  loginWithGoogle, 
  logout as firebaseLogout, 
  signInWithRedirect, 
  getRedirectResult 
} from '../lib/firebase';
import { syncUserProfile, ADMIN_EMAIL } from '../lib/firestore-service';
import { UserProfile } from '../types';

export interface AuthErrorInfo {
  code: string;
  message: string;
  domain?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  authError: AuthErrorInfo | null;
  clearAuthError: () => void;
  login: () => Promise<void>;
  loginWithRedirectMode: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  authError: null,
  clearAuthError: () => {},
  login: async () => {},
  loginWithRedirectMode: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);

  // Check redirect results and listen to auth state changes
  useEffect(() => {
    // Process redirect result if page was reloaded from signInWithRedirect
    getRedirectResult(auth)
      .then(result => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err: unknown) => {
        const errorObj = err as { code?: string; message?: string };
        const code = errorObj?.code || '';
        const msg = errorObj?.message || String(err);
        if (code === 'auth/unauthorized-domain') {
          setAuthError({
            code,
            message: 'This domain is not authorized for Google OAuth in Firebase Console.',
            domain: window.location.hostname,
          });
        } else if (code && code !== 'auth/popup-closed-by-user') {
          setAuthError({ code, message: msg });
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser) {
        setAuthError(null);
        try {
          const userProfile = await syncUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });
          setProfile(userProfile);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj?.code || '';
      const msg = errorObj?.message || 'Login failed';

      if (code === 'auth/unauthorized-domain') {
        setAuthError({
          code,
          message: 'This domain is not authorized for Google OAuth in Firebase Console.',
          domain: window.location.hostname,
        });
      } else if (code === 'auth/popup-blocked') {
        setAuthError({
          code,
          message: 'Popup was blocked by your browser. Please try redirect sign-in.',
        });
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setAuthError({
          code: code || 'auth/unknown',
          message: msg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithRedirectMode = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Redirect login error:', err);
      const errorObj = err as { code?: string; message?: string };
      const code = errorObj?.code || '';
      const msg = errorObj?.message || 'Redirect login failed';

      if (code === 'auth/unauthorized-domain') {
        setAuthError({
          code,
          message: 'This domain is not authorized for Google OAuth in Firebase Console.',
          domain: window.location.hostname,
        });
      } else {
        setAuthError({ code, message: msg });
      }
      setLoading(false);
    }
  };

  const logout = async () => {
    await firebaseLogout();
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const isAdmin =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        authError,
        clearAuthError,
        login,
        loginWithRedirectMode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
