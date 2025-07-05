"use client";

import { ChangeEvent, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/store";
import { PiPlayFill } from "react-icons/pi";
import Preview from "@/components/Preview";
import FrameImage from "@/components/Image";
import Compare from "@/components/Compare";
import compressAndEncodeFile from "@/utils/compressFileUpload";
import { RiGhost2Fill } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function ProjectPage() {
  const [preview, setPreview] = useState(false);
  const { id } = useParams();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);
  const [editing, setEditing] = useState<string | null>(null);
  const [compareFrames, setCompareFrames] = useState<string[]>([])
  const { updateProject } = useAppStore();
  const [ghost, setGhost] = useState(false)
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!project || !files?.length) {
      return;
    }

    const frames = []
    const filesArray = Array.from(files);
    filesArray.sort((a, b) => (a.lastModified < b.lastModified ? -1 : 1));
    for (const file of filesArray) {
      frames.push({
        id: crypto.randomUUID(),
        image: await compressAndEncodeFile(file, 1024),
        order: project?.frames.length || 0,
        caption: "",
        description: "",
        position: {
          x: 0,
          y: 0,
        },
        scale: 1,
      })
    }
    updateProject(project.id, {
      frames: [
        ...(project?.frames || []),
        ...frames,
      ],
    });
  };

  const handleCaptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!project || !editing) {
      return
    }

    updateProject(project.id, {
      frames: project.frames.map((frame) => {
        if (frame.id === editing) {
          return {
            ...frame,
            caption: event.target.value,
          };
        }
        return frame;
      }),
    });
  }

  if (!project) {
    notFound();
  }

  const onReposition = (x: number, y: number, scale: number) => {
    updateProject(project.id, {
      frames: project.frames.map((frame) => {
        if (frame.id === editing) {
          return {
            ...frame,
            position: {
              x,
              y,
            },
            scale,
          };
        }
        return frame;
      }),
    });
  }

  const editFrame = (frameId: string) => {
    setEditing(frameId);
  }

  const prevFrameIndex = project.frames.findIndex((frame) => frame.id === editing) - 1

  const handleCompareChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()
    const frameId = event.target.value;
    const frames = [...compareFrames];
    if (frames.includes(frameId)) {
      frames.splice(frames.indexOf(frameId), 1);
    } else {
      frames.push(frameId);
    }
    setCompareFrames(frames);

    return false
  }

  const deleteFrame = () => {
    updateProject(project.id, {
      frames: project.frames.filter((frame) => frame.id !== editing),
    });
    setEditing(null);
  }

  const toggleGhost = () => {
    setGhost(!ghost)
  }
  return (
    <div className="h-full" onClick={(e) => {
      if (e.currentTarget === e.target) {
        setEditing(null)
      }
    }}>
      <div className="p-4 grid grid-cols-4 max-w-5xl mx-auto gap-2">
        {project.frames.map((frame) => (
          <div key={frame.id} className="relative">
            <div onClick={() => editFrame(frame.id)} className="relative">
              <FrameImage key={frame.id} id={frame.id} ratio="aspect-[calc(3/4)]" onReposition={onReposition} alt="" />
            </div>
            <input type="checkbox" value={frame.id} checked={compareFrames.includes(frame.id)} onChange={handleCompareChange} />
          </div>
        ))}
        <div className="block w-full relative shrink-0">
          <label className="relative block aspect-[calc(3/4)] w-full border border-dashed border-neutral-200 overflow-hidden bg-neutral-50 cursor-pointer">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neutral-400 flex items-center flex-col gap-2">
              <MdCloudUpload className="w-8 h-8" />
              <span className="text-sm text-center">Upload an image</span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleChange}
              className="absolute top-0 left-0 right-0 bottom-0 hidden opacity-0"
            />
          </label>
        </div>
      </div>
      <button className="p-4 py-2 bg-blue-500 text-white rounded flex gap-2 items-center" onClick={() => setPreview(true)}>
        <PiPlayFill /> Play
      </button>
      {preview && <Preview onClose={() => setPreview(false)} />}
      {editing && <div
        className="fixed flex items-center justify-center w-full h-full top-0 left-0 right-0 bottom-0 bg-black/90 z-30"
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            setEditing(null)
          }
        }}
      >
        <div className="grid grid-cols-12 gap-8 max-w-3xl mx-auto">
          <div className="relative col-span-9">
            <FrameImage id={editing} ratio="aspect-[calc(3/4)]" className="m-auto w-xl my-auto" onReposition={onReposition} alt="" editing />
            {ghost && prevFrameIndex >= 0 && <FrameImage id={project.frames[prevFrameIndex].id} ratio="aspect-[calc(3/4)]" alt="" className="w-xl absolute top-0 opacity-30 pointer-events-none left-1/2 -translate-x-1/2" />}
          </div>
          <div className="col-span-3 space-y-4 flex flex-col">
            <button className="bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-purple-400 hover:text-white transition-colors cursor-pointer" onClick={toggleGhost}><RiGhost2Fill /> {ghost ? 'Disable' : 'Enable'} Ghost</button>
            <button className="bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-green-600 hover:text-white transition-colors cursor-pointer" onClick={() => setEditing(null)}><FaCheck /> Done</button>
            <input type="text" placeholder="Add a caption..." value={project.frames.find((frame) => frame.id === editing)?.caption || ""} onChange={handleCaptionChange} name="caption" className="bg-white text-black p-2 rounded w-full" />
            <button className="mt-auto bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-red-800 hover:text-white transition-colors cursor-pointer" onClick={deleteFrame}><IoClose /> Delete</button>
          </div>
        </div>
      </div>
      }
      {compareFrames.length === 2 && <Compare a={compareFrames[0]!} b={compareFrames[1]!} onClose={() => setCompareFrames([])} />}
    </div>
  );
}
