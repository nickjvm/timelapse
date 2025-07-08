import { useAppStore } from "@/store";

export default function useFrames(projectId: string) {
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const frames = project?.frames || [];
  const visibleFrames = frames.filter((f) => !f.hidden);

  return {
    frames,
    visibleFrames,
  };
}
