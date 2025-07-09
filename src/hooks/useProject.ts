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
        message: "Timeline not found",
        type: "error",
      });
    }
  }, [project, addNotification]);

  return project;
}
