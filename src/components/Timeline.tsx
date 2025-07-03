import { AppState, useAppStore } from "@/store";
import a from "next/navigation";
import { useRouter } from "next/navigation";

export default function Timeline() {
  const router = useRouter();
  const { addProject, setCurrentProject } = useAppStore();

  const handleClick = () => {
    const newProject = {
      name: `My Timeline ${Date.now().toLocaleString()}`,
      description: `Description for project ${Date.now()}`,
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
