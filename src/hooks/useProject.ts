"use client";
import { useAppStore } from "@/store";
import { useNotifications } from "@/providers/Notifications";
import { useEffect } from "react";

export default function useProject(projectId: string) {
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!project) {
      addNotification({
        title: "Project Not Found",
        message: `Project not found`,
        type: "error",
      });
    }
  }, [project, addNotification]);

  return project;
}
