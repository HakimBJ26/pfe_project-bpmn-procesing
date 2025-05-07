import { secureStorage } from "@/lib/secureStorage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GlobalState {
  developerMode: boolean;
  setDeveloperMode: (developerMode: boolean) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      developerMode: false,
      setDeveloperMode: (developerMode: boolean) =>
        set({
          developerMode,
        }),
    }),
    {
      name: "global-storage",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        developerMode: state.developerMode,
      }),
    }
  )
);
