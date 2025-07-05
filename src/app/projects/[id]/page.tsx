"use client";

import { ChangeEvent, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/store";
import blobToBase64 from "@/utils/blobToBase64";
import { PiPlayFill } from "react-icons/pi";
import Preview from "@/components/Preview";
import FrameImage from "@/components/Image";
import Frame from "@/components/Frame";

export default function ProjectPage() {
  const [preview, setPreview] = useState(false);
  const { id } = useParams();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);
  const [editing, setEditing] = useState<string | null>(project?.frames?.[0]?.id || null);

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

  return (
    <div className="h-full" onClick={(e) => {
      if (e.currentTarget === e.target) {
        setEditing(null)
      }
    }}>
      <div className="p-4 grid grid-cols-4 max-w-5xl mx-auto gap-2">
        {project.frames.map((frame, i, frames) => (
          <div onClick={() => editFrame(frame.id)} key={frame.id} className="relative">
            <FrameImage key={frame.id} id={frame.id} ratio="aspect-[calc(3/4)]" onReposition={onReposition} alt="" editing={editing === frame.id} />
            {editing === frame.id && frames[i - 1] && <FrameImage id={frames[i - 1].id} ratio="aspect-[calc(3/4)]" alt="" className="absolute top-0 left-0 opacity-30 pointer-events-none" />}
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
      {/* {editing && <div
        className="fixed flex top-0 left-0 right-0 bottom-0 bg-black/90 z-30"
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            setEditing(null)
          }
        }}
      >
        <Frame {...project.frames.find((f) => f.id === editing)!} editing />
      </div>
      } */}
    </div >
  );
}
