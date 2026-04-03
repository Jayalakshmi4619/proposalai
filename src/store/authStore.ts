import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setAuth: (user: User | null, profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setAuth: (user, profile) => set({ user, profile, loading: false }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const newProfile = { ...profile, ...updates };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    set({ profile: newProfile });
  },
}));
