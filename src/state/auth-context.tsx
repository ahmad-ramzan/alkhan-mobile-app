import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import * as mobileAuthService from '@/services/mobile-auth-service';

type AuthContextValue = {
  isLoggedIn: boolean;
  customerName: string | null;
  phone: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const loggedIn = await mobileAuthService.isLoggedIn();
    setIsLoggedIn(loggedIn);
    setCustomerName(await mobileAuthService.getCachedCustomerName());
    setPhone(await mobileAuthService.getCachedPhone());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const logout = async () => {
    await mobileAuthService.logout();
    await refresh();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, customerName, phone, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
