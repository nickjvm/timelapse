'use client'

import { useAppStore } from "@/store";
import FrameImage from "@/components/Image";
import Link from "next/link";
import { MdEdit } from "react-icons/md";
import { PiNoteBlank, PiPlus } from "react-icons/pi";
import { useRouter } from "next/navigation";

export default function Home() {
  const { projects } = useAppStore()
  const sortedProjects = projects.toSorted((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const router = useRouter();
  const { addProject } = useAppStore();

  const handleClick = () => {
    const newProject = {
      name: `My Timeline ${new Date().toLocaleDateString()}`,
      description: '',
      frames: [],
    };
    const id = addProject(newProject);

    router.push(`/projects/${id}`);
  };

  return (
    <div>
      <div className="sticky top-0 z-50 bg-white shadow w-full">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-4 gap-2">
          <h2 className="text-xl font-bold w-full">
            My Projects
          </h2>
          <button className=" bg-blue-500 text-white hover:bg-blue-800 whitespace-nowrap" onClick={handleClick}>
            <PiPlus /> New Project
          </button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-3 max-w-5xl mx-auto gap-4">
        {sortedProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="space-y-4">
            <div className="relative block">
              <div className="absolute top-0 left-0 w-full h-full bg-white/50 z-10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-lg gap-2">
                <MdEdit /> Edit
              </div>
              {project.frames.length > 0 && <FrameImage projectId={project.id} className="rounded z-0 border border-neutral-400" ratio="aspect-[calc(3/4)]" id={project.frames[project.frames.length - 1].id} alt="" />}
              {!project.frames.length && <div className="w-full aspect-[calc(3/4)] bg-neutral-100 rounded z-0 border border-neutral-400 flex items-center justify-center text-neutral-300"><PiNoteBlank className="w-12 h-12" /></div>}
              <div className="absolute top-[8px] left-[8px] w-full aspect-[calc(3/4)] border border-neutral-400 rounded -z-20 shadow"></div>
              <div className="absolute top-[4px] left-[4px] w-full aspect-[calc(3/4)] border border-neutral-400 rounded -z-10 bg-white"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold hover:underline">{project.name}</h2>
              <p className="text-sm text-neutral-500">{project.frames.length} frame{project.frames.length === 1 ? '' : 's'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
