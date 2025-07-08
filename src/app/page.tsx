"use client";

import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { PiPlus } from "react-icons/pi";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store";
import AlbumCover from "@/components/AlbumCover";
import Header from "@/components/Header";

export default function Home() {
  const { projects } = useAppStore();
  const sortedProjects = projects.toSorted(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const router = useRouter();
  const { addProject } = useAppStore();

  const handleClick = () => {
    const newProject = {
      name: `My Timeline ${new Date().toLocaleDateString()}`,
      description: "",
      frames: [],
    };
    const id = addProject(newProject);

    router.push(`/projects/${id}`);
  };

  return (
    <div>
      <Header
        title="My Projects"
        buttons={[
          <button
            key="new-project"
            className=" bg-blue-500 text-white hover:bg-blue-800 whitespace-nowrap"
            onClick={handleClick}
          >
            <PiPlus /> New Project
          </button>,
        ]}
      />
      <div className="p-4 grid grid-cols-3 max-w-5xl mx-auto gap-4">
        {sortedProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="space-y-4"
          >
            <div className="relative block">
              <div className="absolute top-0 left-0 w-full h-full bg-white/50 z-10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-lg gap-2">
                <MdEdit /> Edit
              </div>
              <AlbumCover projectId={project.id} />
            </div>
            <div>
              <h2 className="text-lg font-bold hover:underline">
                {project.name}
              </h2>
              <p className="text-sm text-neutral-500">
                {project.frames.length} frame
                {project.frames.length === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
