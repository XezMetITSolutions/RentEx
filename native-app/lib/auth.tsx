import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { Storage, StorageKeys } from './storage';
import { syncPushTokenOnAuth } from './notifications';
import type { Customer, Staff } from './types';

export type AuthRole = 'customer' | 'staff';

interface AuthContextValue {
  role: AuthRole | null;
  user: Customer | null;
  staff: Staff | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  signInAsStaff: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function clearAll() {
  await Storage.remove(StorageKeys.authToken);
  await Storage.remove(StorageKeys.authUser);
  await Storage.remove(StorageKeys.staffUser);
  await Storage.remove(StorageKeys.authRole);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AuthRole | null>(null);
  const [user, setUser] = useState<Customer | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const token = await Storage.get(StorageKeys.authToken);
      const savedRole = (await Storage.get(StorageKeys.authRole)) as AuthRole | null;
      if (!token || !savedRole) {
        setRole(null);
        setUser(null);
        setStaff(null);
        return;
      }

      if (savedRole === 'staff') {
        const cached = await Storage.get(StorageKeys.staffUser);
        if (cached) {
          try { setStaff(JSON.parse(cached)); } catch {}
        }
        try {
          const fresh = await api.adminMe();
          setStaff(fresh);
          setRole('staff');
          await Storage.set(StorageKeys.staffUser, JSON.stringify(fresh));
          syncPushTokenOnAuth().catch(() => {});
        } catch {
          await clearAll();
          setRole(null);
          setStaff(null);
        }
      } else {
        const cached = await Storage.get(StorageKeys.authUser);
        if (cached) {
          try { setUser(JSON.parse(cached)); } catch {}
        }
        try {
          const fresh = await api.me();
          setUser(fresh);
          setRole('customer');
          await Storage.set(StorageKeys.authUser, JSON.stringify(fresh));
          syncPushTokenOnAuth().catch(() => {});
        } catch {
          await clearAll();
          setRole(null);
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    await Storage.set(StorageKeys.authToken, session.token);
    await Storage.set(StorageKeys.authUser, JSON.stringify(session.customer));
    await Storage.set(StorageKeys.authRole, 'customer');
    await Storage.set(StorageKeys.lastEmail, email);
    setUser(session.customer);
    setStaff(null);
    setRole('customer');
    syncPushTokenOnAuth().catch(() => {});
  }, []);

  const signUp = useCallback(async (data: Parameters<AuthContextValue['signUp']>[0]) => {
    const session = await api.register(data);
    await Storage.set(StorageKeys.authToken, session.token);
    await Storage.set(StorageKeys.authUser, JSON.stringify(session.customer));
    await Storage.set(StorageKeys.authRole, 'customer');
    await Storage.set(StorageKeys.lastEmail, data.email);
    setUser(session.customer);
    setStaff(null);
    setRole('customer');
    syncPushTokenOnAuth().catch(() => {});
  }, []);

  const signInAsStaff = useCallback(async (email: string, password: string) => {
    const session = await api.adminLogin(email, password);
    await Storage.set(StorageKeys.authToken, session.token);
    await Storage.set(StorageKeys.staffUser, JSON.stringify(session.staff));
    await Storage.set(StorageKeys.authRole, 'staff');
    await Storage.set(StorageKeys.lastStaffEmail, email);
    setStaff(session.staff);
    setUser(null);
    setRole('staff');
    syncPushTokenOnAuth().catch(() => {});
  }, []);

  const signOut = useCallback(async () => {
    if (role === 'customer') {
      try { await api.logout(); } catch {}
    }
    await clearAll();
    setUser(null);
    setStaff(null);
    setRole(null);
  }, [role]);

  const refresh = useCallback(async () => {
    try {
      if (role === 'staff') {
        const fresh = await api.adminMe();
        setStaff(fresh);
        await Storage.set(StorageKeys.staffUser, JSON.stringify(fresh));
      } else if (role === 'customer') {
        const fresh = await api.me();
        setUser(fresh);
        await Storage.set(StorageKeys.authUser, JSON.stringify(fresh));
      }
    } catch {}
  }, [role]);

  return (
    <AuthContext.Provider
      value={{ role, user, staff, loading, signIn, signUp, signInAsStaff, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
