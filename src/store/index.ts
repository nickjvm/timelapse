import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "./indexeddb-storage";

export type Frame = {
  id: string;
  image: string;
  order: number;
  caption: string;
  description: string;
  position: {
    x: number;
    y: number;
  };
  scale: number;
};

export type NewProject = Omit<
  AppState["projects"][0],
  "id" | "createdAt" | "updatedAt"
>;
// Define your app state interface
export interface AppState {
  // User preferences
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;

  // App data - customize these based on your needs
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
  };

  // Example: timelapse-specific data
  projects: Array<{
    id: string;
    name: string;
    description: string;
    frames: Frame[];
    createdAt: Date;
    updatedAt: Date;
  }>;

  currentProject: string | null;

  // Settings
  settings: {
    autoSave: boolean;
    notifications: boolean;
    language: string;
  };
}

// Define your app actions interface
export interface AppActions {
  // Theme actions
  setTheme: (theme: AppState["theme"]) => void;
  toggleSidebar: () => void;

  // User actions
  setUser: (user: Partial<AppState["user"]>) => void;
  clearUser: () => void;

  // Project actions
  addProject: (
    project: Omit<AppState["projects"][0], "id" | "createdAt" | "updatedAt">
  ) => string;
  updateProject: (
    id: string,
    updates: Partial<AppState["projects"][0]>
  ) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;

  // Settings actions
  updateSettings: (settings: Partial<AppState["settings"]>) => void;

  // Utility actions
  reset: () => void;
}

// Combine state and actions
export type AppStore = AppState & AppActions;

// Initial state
const initialState: AppState = {
  theme: "system",
  sidebarOpen: true,
  user: {
    id: null,
    name: null,
    email: null,
  },
  projects: [],
  currentProject: null,
  settings: {
    autoSave: true,
    notifications: true,
    language: "en",
  },
};

// Create the store
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Theme actions
      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // User actions
      setUser: (user) =>
        set((state) => ({
          user: { ...state.user, ...user },
        })),

      clearUser: () =>
        set({
          user: { id: null, name: null, email: null },
        }),

      // Project actions
      addProject: (project) => {
        const id = crypto.randomUUID();
        const now = new Date();
        set((state) => {
          return {
            projects: [
              ...state.projects,
              {
                ...project,
                id,
                createdAt: now,
                updatedAt: now,
              },
            ],
          };
        });

        return id;
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject === id ? null : state.currentProject,
        })),

      setCurrentProject: (id) => set({ currentProject: id }),

      // Settings actions
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      // Utility actions
      reset: () => set(initialState),
    }),
    {
      name: "timelapse-app-storage",
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        // Only persist these parts of the state
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        user: state.user,
        projects: state.projects,
        currentProject: state.currentProject,
        settings: state.settings,
      }),
    }
  )
);

// Selectors for better performance
export const useTheme = () => useAppStore((state) => state.theme);
export const useSidebar = () => useAppStore((state) => state.sidebarOpen);
export const useUser = () => useAppStore((state) => state.user);
export const useProjects = () => useAppStore((state) => state.projects);
export const useCurrentProject = () =>
  useAppStore((state) => state.currentProject);
export const useSettings = () => useAppStore((state) => state.settings);
