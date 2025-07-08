"use client";
import { useAppStore } from "@/store";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/providers/Notifications";
import { useEffect } from "react";
export default function useProject(projectId: string) {
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const { addNotification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (!project) {
      addNotification({
        title: "Project Not Found",
        message: `Project not found`,
        type: "error",
      });
      router.back();
    }
  }, [project, addNotification, router]);

  return project;
}
