"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ensure the store is hydrated before rendering
    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Also check if already hydrated
    if (useAppStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  if (!isHydrated) {
    // You can customize this loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to check if the store is ready
export function useStoreReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    if (useAppStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return unsubscribe;
  }, []);

  return isReady;
}
