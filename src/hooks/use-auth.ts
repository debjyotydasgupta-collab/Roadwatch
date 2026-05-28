import { useEffect, useState } from "react";
import { User, Role } from "@/lib/mock-api";

export interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
}

// Global mock state
let currentUser: User | null = null;
const listeners = new Set<(state: AuthState) => void>();

export const mockAuth = {
  login: (user: User) => {
    currentUser = user;
    notify();
  },
  logout: () => {
    currentUser = null;
    notify();
  },
  getUser: () => currentUser,
};

function notify() {
  const state = { user: currentUser, role: currentUser?.role || null, loading: false };
  listeners.forEach(l => l(state));
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: currentUser,
    role: currentUser?.role || null,
    loading: false,
  });

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}
