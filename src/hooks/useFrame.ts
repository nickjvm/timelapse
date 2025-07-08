import { useAppStore } from "@/store";

export default function useFrame(projectId: string, frameId: string) {
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === projectId);
  const frame = project?.frames.find((f) => f.id === frameId);
  return frame;
}