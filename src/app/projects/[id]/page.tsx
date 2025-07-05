"use client";

import { ChangeEvent, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/store";
import blobToBase64 from "@/utils/blobToBase64";
import { PiPlayFill } from "react-icons/pi";
import Preview from "@/components/Preview";
import FrameImage from "@/components/FrameImage";
import Frame from "@/components/Frame";

export default function ProjectPage() {
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const { id } = useParams();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);

  const { updateProject } = useAppStore();

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!project || !file) {
      return;
    }
    updateProject(project.id, {
      frames: [
        ...(project?.frames || []),
        {
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
        },
      ],
    });
  };

  if (!project) {
    notFound();
  }

  const editFrame = (frameId: string) => {
    setEditing(frameId);
  }

  return (
    <div>
      <div className="p-4 grid grid-cols-4 max-w-5xl mx-auto gap-2">
        {project.frames.map((frame) => (
          <FrameImage key={frame.id} frame={frame} onClick={() => editFrame(frame.id)} />
        ))}
        <div className="block w-full relative shrink-0">
          <label className="block aspect-[calc(3/4)] w-full border border-dashed border-neutral-200 overflow-hidden bg-neutral-50 cursor-pointer">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neutral-400 flex items-center flex-col gap-2">
              <MdCloudUpload className="w-8 h-8" />
              <span>Upload an image</span>
            </div>
            <input
              type="file"
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
        className="fixed flex top-0 left-0 right-0 bottom-0 bg-black/90 z-30"
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            setEditing(null)
          }
        }}
      >
        <Frame {...project.frames.find((f) => f.id === editing)!} editing />
      </div>
      }
    </div>
  );
}
