"use client";

import { ChangeEvent, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/store";
import blobToBase64 from "@/utils/blobToBase64";
import { PiPlayFill } from "react-icons/pi";
import Preview from "@/components/Preview";
import FrameImage from "@/components/Image";
import Compare from "@/components/Compare";

export default function ProjectPage() {
  const [preview, setPreview] = useState(false);
  const { id } = useParams();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);
  const [editing, setEditing] = useState<string | null>(null);
  const [compareFrames, setCompareFrames] = useState<string[]>([])
  const { updateProject } = useAppStore();

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
        image: await blobToBase64(file),
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

  const compare = project.frames.findIndex((frame) => frame.id === editing) - 1

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
        <div className="relative">
          <FrameImage id={editing} ratio="aspect-[calc(3/4)]" className="m-auto w-xl my-auto" onReposition={onReposition} alt="" editing />
          {compare >= 0 && <FrameImage id={project.frames[compare].id} ratio="aspect-[calc(3/4)]" alt="" className="w-xl absolute top-0 left-0 opacity-30 pointer-events-none" />}
        </div>
      </div>
      }
      {compareFrames.length === 2 && <Compare a={compareFrames[0]!} b={compareFrames[1]!} onClose={() => setCompareFrames([])} />}
    </div>
  );
}
