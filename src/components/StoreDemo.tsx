"use client";

import { useAppStore, useTheme, useProjects, useUser } from "../store";

export function StoreDemo() {
  const { theme, sidebarOpen, user, projects, currentProject, settings } =
    useAppStore();

  const {
    setTheme,
    toggleSidebar,
    setUser,
    clearUser,
    addProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    updateSettings,
    reset,
  } = useAppStore();

  // Example handlers
  const handleAddProject = () => {
    addProject({
      name: `Project ${projects.length + 1}`,
      description: `Description for project ${projects.length + 1}`,
    });
  };

  const handleSetUser = () => {
    setUser({
      id: "1",
      name: "John Doe",
      email: "john@example.com",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Global State Demo</h1>

      {/* Theme Controls */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Theme Controls</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`px-4 py-2 rounded ${
              theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`px-4 py-2 rounded ${
              theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`px-4 py-2 rounded ${
              theme === "system" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            System
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">Current theme: {theme}</p>
      </div>

      {/* Sidebar Toggle */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Sidebar Controls</h2>
        <button
          onClick={toggleSidebar}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {sidebarOpen ? "Close" : "Open"} Sidebar
        </button>
        <p className="mt-2 text-sm text-gray-600">
          Sidebar is {sidebarOpen ? "open" : "closed"}
        </p>
      </div>

      {/* User Controls */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">User Controls</h2>
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleSetUser}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set User
          </button>
          <button
            onClick={clearUser}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear User
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {user.id ? (
            <div>
              <p>ID: {user.id}</p>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
            </div>
          ) : (
            <p>No user set</p>
          )}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Projects</h2>
        <button
          onClick={handleAddProject}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-3"
        >
          Add Project
        </button>

        {projects.length > 0 ? (
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentProject(project.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentProject === project.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {currentProject === project.id ? "Current" : "Select"}
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No projects yet</p>
        )}
      </div>

      {/* Settings */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Settings</h2>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => updateSettings({ autoSave: e.target.checked })}
              className="mr-2"
            />
            Auto Save
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) =>
                updateSettings({ notifications: e.target.checked })
              }
              className="mr-2"
            />
            Notifications
          </label>
          <div className="flex items-center">
            <label className="mr-2">Language:</label>
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="px-2 py-1 border rounded"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Reset</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset All Data
        </button>
        <p className="mt-2 text-sm text-gray-600">
          This will reset all state to initial values
        </p>
      </div>

      {/* Current State Display */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Current State</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(
            {
              theme,
              sidebarOpen,
              user,
              projects: projects.map((p) => ({
                ...p,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
              })),
              currentProject,
              settings,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
