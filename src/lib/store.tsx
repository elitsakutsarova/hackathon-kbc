import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { createInitialState, type AppState } from './dreams';

const STORAGE_KEY = 'kbc-dream-calendar-v1';

type ConfettiBurst = { id: number; x: number; y: number };

type AppContextValue = {
  state: AppState;
  isReady: boolean;
  update: (change: (state: AppState) => AppState) => void;
  replace: (state: AppState) => void;
  toast: { id: number; message: string } | null;
  showToast: (message: string) => void;
  confettiBursts: ConfettiBurst[];
  launchConfetti: (x: number, y: number) => void;
  isWrappedOpen: boolean;
  setWrappedOpen: (isOpen: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);
  const [isReady, setIsReady] = useState(false);
  const [toast, setToast] = useState<AppContextValue['toast']>(null);
  const [confettiBursts, setConfettiBursts] = useState<ConfettiBurst[]>([]);
  const [isWrappedOpen, setWrappedOpen] = useState(false);
  const nextId = useRef(0);

  // Load what the user did last time. Storage can be empty or blocked: just start fresh.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((savedText) => {
        if (savedText) {
          setState({ ...createInitialState(), ...JSON.parse(savedText), addStep: 1, draft: null });
        }
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  // Not being able to save is fine for a prototype.
  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, isReady]);

  const value: AppContextValue = {
    state,
    isReady,
    update: (change) => setState((current) => change(current)),
    replace: setState,
    toast,
    showToast: (message) => setToast({ id: nextId.current++, message }),
    confettiBursts,
    launchConfetti: (x, y) => {
      const id = nextId.current++;
      setConfettiBursts((bursts) => [...bursts, { id, x, y }]);
      setTimeout(() => setConfettiBursts((bursts) => bursts.filter((burst) => burst.id !== id)), 1000);
    },
    isWrappedOpen,
    setWrappedOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
