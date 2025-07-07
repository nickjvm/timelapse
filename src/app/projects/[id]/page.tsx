"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { MdCheck, MdCloudUpload, MdCompare, MdDelete, MdEdit, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

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
import SortableItem from "@/components/SortableItem";
import { SmartPointerSensor } from "@/components/PointerSensor";
import { flipImage } from "@/utils/flipImage";
import { BsSymmetryHorizontal, BsSymmetryVertical } from "react-icons/bs";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";

export default function ProjectPage() {
  const [editProjectName, setEditProjectName] = useState(false)
  const [preview, setPreview] = useState(false);
  const { id } = useParams();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);
  const [editing, setEditing] = useState<string | null>(null);
  const [compareFrames, setCompareFrames] = useState<string[]>([])
  const { updateProject, deleteProject } = useAppStore();
  const [ghost, setGhost] = useState(false)
  const sensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
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
        caption: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(file.lastModified)),
        description: "",
        position: {
          x: 0,
          y: 0,
        },
        rotation: 0,
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

  const onReposition = (x: number, y: number, scale: number, rotation: number) => {
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
            rotation,
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
  const nextFrameIndex = project.frames.findIndex((frame) => frame.id === editing) + 1

  const handleCompareChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('here')
    const frameId = event.target.value;
    const frames = [...compareFrames];
    if (frames.includes(frameId)) {
      frames.splice(frames.indexOf(frameId), 1);
    } else {
      frames.push(frameId);
    }
    setCompareFrames(frames);

    console.log('here')
  }

  const deleteFrame = (frameId: string) => {
    updateProject(project.id, {
      frames: project.frames.filter((frame) => frame.id !== frameId),
    });
    setEditing(null);
  }

  const toggleGhost = () => {
    setGhost(!ghost)
  }

  function toggleEditProjectName() {
    setEditProjectName(!editProjectName)
  }

  const projectNameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (prevFrameIndex >= 0) {
          setEditing(project.frames[prevFrameIndex].id)
        }
      }
      if (e.key === 'ArrowRight') {
        if (nextFrameIndex < project.frames.length) {
          setEditing(project.frames[nextFrameIndex].id)
        }
      }
      if (e.key === 'Escape') {
        setEditing(null)
      }
    }
    if (editing) {
      document.removeEventListener('keydown', handleKeypress)
      document.addEventListener('keydown', handleKeypress)
    }
    return () => {
      document.removeEventListener('keydown', handleKeypress)
    }
  }, [editing, nextFrameIndex, prevFrameIndex, project.frames])

  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCompareFrames([])
      }
    }
    if (compareFrames.length > 1) {
      document.addEventListener('keydown', handleKeypress)
    }
    return () => {
      document.removeEventListener('keydown', handleKeypress)
    }
  }, [compareFrames])


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && project) {
      const oldIndex = project.frames.findIndex((frame) => frame.id === active.id);
      const newIndex = project.frames.findIndex((frame) => frame.id === over?.id);

      updateProject(project.id, {
        frames: arrayMove(project.frames, oldIndex, newIndex)
      });
    }
  }

  async function handleImageFlip(direction: 'horizontal' | 'vertical') {
    if (!project || !editing) {
      return;
    }
    const frame = project.frames.find((frame) => frame.id === editing);
    if (!frame) {
      return;
    }
    const flippedImage = await flipImage(frame.image, direction);

    updateProject(project.id, {
      frames: project.frames.map((frame) =>
        frame.id === editing ? { ...frame, image: flippedImage } : frame
      ),
    });
  }

  function handleDelete() {
    if (!project) {
      return
    }
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(project.id);
      window.location.href = '/'
    }
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="h-full pb-36" onClick={(e) => {
        if (e.currentTarget === e.target) {
          setEditing(null)
        }
      }}>
        <div className="sticky top-0 z-50 bg-white shadow w-full">
          <div className="max-w-5xl mx-auto flex items-center justify-between p-4 gap-2">
            <Link href="/" className="inline-block mr-2">
              <FaArrowLeftLong />
            </Link>
            <h2 className="text-xl font-bold w-full">
              {!editProjectName && <button onClick={toggleEditProjectName} className="group !p-0">{project.name} <MdEdit className="opacity-30 transition-opacity group-hover:opacity-100 w-5 h-5" /></button>}
              {editProjectName && <input autoFocus ref={projectNameRef} type="text" value={project.name} onChange={(e) => updateProject(project.id, { name: e.target.value })} onBlur={() => toggleEditProjectName()} className="w-full p-2 block -my-2 -ml-2" />}
            </h2>

            <button className=" bg-white text-red-800 hover:bg-white hover:underline text-sm" onClick={handleDelete}>
              Delete
            </button>
            <button className=" bg-blue-500 text-white hover:bg-blue-800" onClick={() => setPreview(true)}>
              <PiPlayFill /> Play
            </button>
          </div>
        </div>
        <div className="p-4 grid grid-cols-4 max-w-5xl mx-auto gap-2">
          <SortableContext items={project.frames}>
            {project.frames.map((frame) => (
              <SortableItem key={frame.id} id={frame.id}>
                <div key={frame.id} className="relative">
                  <div className="relative group">
                    <div className="z-10 absolute top-0 left-0 w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity p-2" data-no-dnd="true">
                      <button onClick={() => editFrame(frame.id)} className="!gap-1 !py-1 !px-2 bg-white/50 rounded-lg hover:bg-white">
                        <MdEdit className="w-5 h-5" />
                        Edit
                      </button>
                      <button onClick={() => deleteFrame(frame.id)} className="!gap-1 !py-1 !px-2 text-red-800 bg-white/50 rounded-lg hover:bg-red-800 hover:text-white">
                        Delete
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="z-10 absolute bottom-0 left-0 w-full flex items-center justify-center p-2" data-no-dnd="true">
                      <input type="checkbox" value={frame.id} checked={compareFrames.includes(frame.id)} onChange={handleCompareChange} id={`compare-${frame.id}`} className="sr-only peer" />
                      <label htmlFor={`compare-${frame.id}`} className="btn !gap-1 !py-1 !px-2 bg-white/50 rounded-lg hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 peer-checked:opacity-100 peer-checked:bg-white">
                        {compareFrames.includes(frame.id) ? <MdCheck className="w-5 h-5" /> : <MdCompare className="w-5 h-5" />}
                        Compare
                      </label>
                    </div>
                    <FrameImage projectId={project.id} key={frame.id} id={frame.id} ratio="aspect-[calc(3/4)]" onReposition={onReposition} alt="" />
                    {frame.caption && <div className="group-hover:opacity-0 transition-opacity absolute bottom-0 left-0 w-full flex items-center justify-center p-1 bg-black/50 text-white text-xs line-clamp-1 overflow-ellipsis">{frame.caption}</div>}
                  </div>
                </div>
              </SortableItem>
            ))}
          </SortableContext>
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
        {preview && <Preview onClose={() => setPreview(false)} />}
        {
          editing && <div
            className="fixed flex items-center justify-center w-full h-full top-0 left-0 right-0 bottom-0 bg-black/90 z-50"
            onClick={(e) => {
              if (e.currentTarget === e.target) {
                setEditing(null)
              }
            }}
          >
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center px-2 pointer-events-none">
              {prevFrameIndex >= 0 && <button className="bg-white/50 h-12 !px-1 hover:bg-white pointer-events-auto mr-auto" onClick={() => setEditing(project.frames[prevFrameIndex].id)}>
                <MdKeyboardArrowLeft className="h-8 w-8" />
              </button>}
              {nextFrameIndex < project.frames.length && <button className="bg-white/50 h-12 !px-1 hover:bg-white pointer-events-auto ml-auto" onClick={() => setEditing(project.frames[nextFrameIndex].id)}>
                <MdKeyboardArrowRight className="h-8 w-8" />
              </button>}
            </div>
            <div className="grid grid-cols-12 gap-8 max-w-3xl mx-auto">
              <div className="relative col-span-9">
                <FrameImage projectId={project.id} key={editing} id={editing} ratio="aspect-[calc(3/4)]" className="m-auto w-xl my-auto" onReposition={onReposition} alt="" editing />
                {ghost && prevFrameIndex >= 0 && <FrameImage projectId={project.id} id={project.frames[prevFrameIndex].id} ratio="aspect-[calc(3/4)]" alt="" className="w-xl absolute top-0 opacity-30 pointer-events-none left-1/2 -translate-x-1/2" />}
              </div>
              <div className="col-span-3 space-y-4 flex flex-col">
                <button className="bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-purple-400 hover:text-white transition-colors cursor-pointer" onClick={toggleGhost}><RiGhost2Fill /> {ghost ? 'Disable' : 'Enable'} Ghost</button>
                <button className="bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-green-600 hover:text-white transition-colors cursor-pointer" onClick={() => setEditing(null)}><FaCheck /> Done</button>
                <button className="bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-green-600 hover:text-white transition-colors cursor-pointer" onClick={() => handleImageFlip("horizontal")}><BsSymmetryVertical className="w-5 h-5" /></button>
                <button className="bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-green-600 hover:text-white transition-colors cursor-pointer" onClick={() => handleImageFlip("vertical")}><BsSymmetryHorizontal className="w-5 h-5" /></button>
                <input type="text" placeholder="Add a caption..." value={project.frames.find((frame) => frame.id === editing)?.caption || ""} onChange={handleCaptionChange} name="caption" className="bg-white text-black p-2 rounded w-full" />
                <button className="mt-auto bg-white p-2 rounded flex gap-2 items-center w-full justify-center hover:bg-red-800 hover:text-white transition-colors cursor-pointer" onClick={() => deleteFrame(editing)}><IoClose /> Delete</button>
              </div>
            </div>
          </div>
        }
        {compareFrames.length === 2 && <Compare projectId={project.id} a={compareFrames[0]!} b={compareFrames[1]!} onClose={() => setCompareFrames([])} />}
      </div >
    </DndContext>
  );
}
