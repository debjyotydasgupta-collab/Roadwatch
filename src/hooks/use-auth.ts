import { useEffect, useState } from "react";
import { User, Role } from "@/lib/mock-api";

export interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
}

const STORAGE_KEY = "rw_user";

function loadStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

let currentUser: User | null = loadStoredUser();
const listeners = new Set<(state: AuthState) => void>();

export const mockAuth = {
  login: (user: User) => {
    currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    notify();
  },
  logout: () => {
    currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    notify();
  },
  signup: (data: { name: string; email: string; role?: Role }) => {
    const user: User = {
      id: "u" + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role ?? "citizen",
      points: 0,
    };
    mockAuth.login(user);
    return user;
  },
  getUser: () => currentUser,
};

function notify() {
  const state = { user: currentUser, role: currentUser?.role || null, loading: false };
  listeners.forEach((l) => l(state));
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: currentUser,
    role: currentUser?.role || null,
    loading: true,
  });

  useEffect(() => {
    if (!currentUser) currentUser = loadStoredUser();
    setState({ user: currentUser, role: currentUser?.role || null, loading: false });
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
}
