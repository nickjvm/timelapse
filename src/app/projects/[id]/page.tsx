"use client";

import { ChangeEvent, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

import Frame from "@/components/Frame";
import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/store";
import blobToBase64 from "@/utils/blobToBase64";

export default function ProjectPage() {
  const { id } = useParams();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);

  const { updateProject } = useAppStore();
  console.log(project);
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

  return (
    <div>
      <div className="p-4 flex items-start gap-4 overflow-auto before:content-[''] after:content-[''] before:ml-auto after:mr-auto">
        {project.frames.map((frame, index, frames) => (
          <Frame key={index} {...frame} comparison={frames[index - 1]} />
        ))}
        <div className="block w-3xs relative shrink-0">
          <label className="block aspect-[calc(3/4)] max-w-3xs border border-dashed border-neutral-200 overflow-hidden bg-neutral-50 cursor-pointer">
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
    </div>
  );
}
