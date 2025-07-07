'use client'

import { useAppStore } from "@/store";
import { useRouter } from "next/navigation";

export default function Timeline() {
  const router = useRouter();
  const { addProject } = useAppStore();

  const handleClick = () => {
    const newProject = {
      name: `My Timeline ${new Date().toLocaleDateString()}`,
      description: `Description for project ${new Date().toLocaleDateString()}`,
      frames: [],
    };
    const id = addProject(newProject);

    router.push(`/projects/${id}`);
  };
  return (
    <button
      onClick={handleClick}
      className="p-4 bg-blue-500 text-white rounded"
    >
      Add Project
    </button>
  );
}
