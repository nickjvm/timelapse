"use client";

import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { PiPlayFill, PiPlus } from "react-icons/pi";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/store";
import AlbumCover from "@/components/AlbumCover";
import Header from "@/components/Header";
import GetStarted from "@/components/GetStarted";
import cn from "@/utils/cn";
import { useState } from "react";
import Preview from "@/components/modals/Preview";
import SettingsMenu from "@/components/SettingsMenu";

export default function Home() {
  const [playingProjectId, setPlayingProjectId] = useState<string | null>(null);
  const { projects } = useAppStore();
  const sortedProjects = projects.toSorted(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const router = useRouter();
  const { addProject } = useAppStore();

  const createProject = () => {
    const newProject = {
      name: `My Timeline ${new Date().toLocaleDateString()}`,
      frames: [],
    };
    const id = addProject(newProject);

    router.push(`/projects/${id}`);
  };

  return (
    <div>
      <Header
        title="My Timelines"
        buttons={[
          <button
            key="new-project"
            className={cn(
              " bg-blue-500 text-white hover:bg-blue-800 whitespace-nowrap",
              !projects.length && "!hidden"
            )}
            onClick={createProject}
          >
            <PiPlus /> New Timeline
          </button>,
          <SettingsMenu key="settings" />,
        ]}
      />
      {!projects.length && <GetStarted onClick={createProject} />}
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto gap-4">
        {sortedProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="space-y-4"
          >
            <div className="block relative">
              <div className="absolute top-0 left-0 w-full h-full md:bg-white/50 z-10 md:opacity-0 md:hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-lg gap-2 md:backdrop-blur-xs">
                <span className="text-sm md:text-base whitespace-nowrap flex gap-2 items-center bg-white/50 md:bg-transparent md:hover:bg-white px-4 py-2 rounded">
                  <MdEdit /> Edit
                </span>
                {project.frames.length > 0 && (
                  <button
                    className="bg-white/50 md:bg-transparent md:hover:bg-white "
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPlayingProjectId(project.id);
                    }}
                  >
                    <PiPlayFill /> Play
                  </button>
                )}
              </div>
              <AlbumCover projectId={project.id} />
            </div>
            <div>
              <h2 className="text-sm md:text-lg font-bold hover:underline">
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
      {playingProjectId && (
        <Preview
          projectId={playingProjectId}
          onClose={() => setPlayingProjectId(null)}
        />
      )}
    </div>
  );
}
