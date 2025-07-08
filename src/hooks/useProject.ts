import { useAppStore } from "@/store";

export default function useProject(projectId: string) {
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  return project;
}
