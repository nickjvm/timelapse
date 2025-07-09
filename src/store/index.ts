import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { indexedDBStorage } from "@/store/indexeddb-storage";

export type Frame = {
  id: string;
  image: string;
  caption: string;
  hidden: boolean;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  scale: number;
};

export type Project = AppState["projects"][0];

export type NewProject = Omit<
  AppState["projects"][0],
  "id" | "createdAt" | "updatedAt"
>;

export const PLAYBACK_SPEEDS = {
  "1x": 1000,
  "2x": 500,
  "3x": 250,
  "4x": 125,
};
export interface AppState {
  projects: Array<{
    id: string;
    name: string;
    frames: Frame[];
    createdAt: Date;
    updatedAt: Date;
  }>;

  settings: {
    ghost: boolean;
    playbackSpeed: keyof typeof PLAYBACK_SPEEDS;
  };
}

export interface AppActions {
  addProject: (project: NewProject) => string;
  updateProject: (
    id: string,
    updates: Partial<AppState["projects"][0]>
  ) => void;
  deleteProject: (id: string) => void;
  updateFrame: (
    projectId: string,
    frameId: string,
    updates: Partial<Frame>
  ) => void;
  deleteFrame: (projectId: string, frameId: string) => void;
  updateSettings: (settings: Partial<AppState["settings"]>) => void;
}

// Combine state and actions
export type AppStore = AppState & AppActions;

// Initial state
const initialState: AppState = {
  projects: [],
  settings: {
    ghost: false,
    playbackSpeed: "1x",
  },
};

// Create the store
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

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

      updateProject: (id: string, updates: Partial<AppState["projects"][0]>) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      updateFrame: (
        projectId: string,
        frameId: string,
        updates: Partial<Frame>
      ) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  frames: p.frames.map((f) =>
                    f.id === frameId ? { ...f, ...updates } : f
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        })),

      deleteFrame: (projectId: string, frameId: string) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  frames: p.frames.filter((f) => f.id !== frameId),
                  updatedAt: new Date(),
                }
              : p
          ),
        })),

      deleteProject: (id: string) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      updateSettings: (settings: Partial<AppState["settings"]>) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
    }),
    {
      name: "timelapse-app-storage",
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        // Only persist these parts of the state
        projects: state.projects,
        settings: state.settings,
      }),
    }
  )
);

export const useProjects = () => useAppStore((state) => state.projects);
export const useSettings = () => useAppStore((state) => state.settings);
