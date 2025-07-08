# Global State Management with Zustand + IndexedDB

This project uses Zustand with IndexedDB persistence for global state management. Data persists across browser sessions and page refreshes.

## Features

- ✅ **Zustand**: Lightweight state management
- ✅ **IndexedDB**: Persistent storage that survives browser restarts
- ✅ **TypeScript**: Full type safety
- ✅ **Hydration**: Proper SSR/client-side hydration handling
- ✅ **Performance**: Selective subscriptions with custom selectors

## File Structure

```
src/
├── store/
│   ├── index.ts           # Main store definition
│   ├── indexeddb-storage.ts # IndexedDB storage adapter
│   └── provider.tsx       # React provider for hydration
└── components/
    └── StoreDemo.tsx      # Example usage component
```

## Basic Usage

### 1. Import the store

```typescript
import { useAppStore } from "../store";

// Or use individual selectors for better performance
import { useTheme, useUser, useProjects } from "../store";
```

### 2. Use in components

```typescript
function MyComponent() {
  // Get state and actions
  const { theme, setTheme, user, setUser } = useAppStore();

  // Or use selectors for better performance
  const theme = useTheme();
  const user = useUser();
  const setTheme = useAppStore((state) => state.setTheme);

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>Switch to Dark</button>
    </div>
  );
}
```

## State Structure

The store includes:

- **Theme**: Light/dark/system theme preference
- **UI State**: Sidebar open/closed state
- **User**: User information (id, name, email)
- **Projects**: Array of project objects with CRUD operations
- **Settings**: App-wide settings (autoSave, notifications, language)

## Available Actions

### Theme Actions

- `setTheme(theme)` - Set theme to 'light', 'dark', or 'system'
- `toggleSidebar()` - Toggle sidebar open/closed

### User Actions

- `setUser(user)` - Set user data (partial updates supported)
- `clearUser()` - Clear user data

### Project Actions

- `addProject(project)` - Add new project
- `updateProject(id, updates)` - Update existing project
- `deleteProject(id)` - Delete project
- `setCurrentProject(id)` - Set active project

### Settings Actions

- `updateSettings(settings)` - Update app settings

### Utility Actions

- `reset()` - Reset all state to initial values

## Performance Optimization

Use individual selectors instead of the main store for better performance:

```typescript
// ❌ This will cause re-renders when ANY state changes
const { theme, user, projects } = useAppStore();

// ✅ This only re-renders when theme changes
const theme = useTheme();
const user = useUser();
const projects = useProjects();
```

## Persistence

The store automatically persists to IndexedDB:

- Data persists across browser sessions
- Survives page refreshes
- Works offline
- Automatic hydration on app start

## Custom Storage Operations

You can also manually interact with IndexedDB:

```typescript
import { clearAllData, getAllKeys } from "../store/indexeddb-storage";

// Clear all persisted data
await clearAllData();

// Get all storage keys
const keys = await getAllKeys();
```

## Adding New State

To add new state:

1. Update the `AppState` interface in `src/store/index.ts`
2. Add corresponding actions to `AppActions`
3. Update the initial state
4. Add action implementations in the store creator
5. Optionally create custom selectors for performance

Example:

```typescript
// 1. Add to AppState
interface AppState {
  // ...existing state...
  newFeature: {
    enabled: boolean;
    config: string;
  };
}

// 2. Add to AppActions
interface AppActions {
  // ...existing actions...
  updateNewFeature: (config: Partial<AppState["newFeature"]>) => void;
}

// 3. Update initial state
const initialState: AppState = {
  // ...existing state...
  newFeature: {
    enabled: false,
    config: "default",
  },
};

// 4. Add action implementation
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ...existing state and actions...
      updateNewFeature: (config) =>
        set((state) => ({
          newFeature: { ...state.newFeature, ...config },
        })),
    }),
    // ... persist config
  ),
);

// 5. Add selector
export const useNewFeature = () => useAppStore((state) => state.newFeature);
```

## Error Handling

The IndexedDB storage includes error handling:

- Graceful fallback when IndexedDB is unavailable
- Console logging for debugging
- Continues working even if storage fails

## Development

Run the development server to see the demo:

```bash
npm run dev
```

The demo page shows all store functionality with interactive examples.
