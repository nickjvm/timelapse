"use client";

import { ChangeEvent, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { MdCheck, MdCompare, MdDelete, MdEdit } from "react-icons/md";
import { PiPlayFill } from "react-icons/pi";
import { FaEyeSlash } from "react-icons/fa6";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import Preview from "@/components/modals/Preview";
import FrameImage from "@/components/Image";
import Compare from "@/components/modals/Compare";
import SortableItem from "@/components/SortableItem";
import { SmartPointerSensor } from "@/components/PointerSensor";
import useProject from "@/hooks/useProject";
import Header from "@/components/Header";
import EditFrameModal from "@/components/modals/EditFrame";
import UploadFrame from "@/components/UploadFrame";
import Dropzone from "@/components/Dropzone";

import { useAppStore } from "@/store";
import cn from "@/utils/cn";
import EmptyProject from "@/components/EmptyProject";
import useActionQueue from "@/hooks/useActionQueue";
import { useNotifications } from "@/providers/Notifications";

export default function ProjectPage() {
  const [preview, setPreview] = useState(false);
  const { id } = useParams();
  const project = useProject(id as string);
  const [editing, setEditing] = useState<string | null>(null);
  const [compareFrames, setCompareFrames] = useState<string[]>([]);
  const { updateProject, deleteProject } = useAppStore();
  const { queueAction } = useActionQueue();
  const { addNotification } = useNotifications();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!project) {
    notFound();
  }

  const editFrame = (frameId: string) => {
    setEditing(frameId);
  };

  const handleCompareChange = (event: ChangeEvent<HTMLInputElement>) => {
    const frameId = event.target.value;
    const frames = [...compareFrames];
    if (frames.includes(frameId)) {
      frames.splice(frames.indexOf(frameId), 1);
    } else {
      frames.push(frameId);
    }
    setCompareFrames(frames);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && project) {
      const oldIndex = project.frames.findIndex(
        (frame) => frame.id === active.id
      );
      const newIndex = project.frames.findIndex(
        (frame) => frame.id === over?.id
      );

      updateProject(project.id, {
        frames: arrayMove(project.frames, oldIndex, newIndex),
      });
    }
  }

  function handleDelete() {
    if (!project) {
      return;
    }
    if (confirm("Are you sure you want to delete this project?")) {
      queueAction(() => {
        deleteProject(project.id);
        addNotification({
          message: `Project ${project.name} deleted.`,
          type: "success",
        });
      });
      router.push("/");
    }
  }

  function handleFrameDelete(id: string) {
    if (!project) {
      return;
    }
    if (confirm("Are you sure you want to delete this frame?")) {
      updateProject(project.id, {
        frames: project.frames.filter((frame) => frame.id !== id),
      });
      setEditing(null);
      addNotification({
        message: `Frame deleted.`,
        type: "success",
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Dropzone projectId={project.id} className="pb-36">
        <Header
          prevUrl="/"
          title={project.name}
          onEdit={(name) => updateProject(project.id, { name })}
          buttons={[
            <button
              key="delete"
              className=" bg-white text-red-800 hover:bg-white hover:underline text-sm"
              onClick={handleDelete}
            >
              Delete
            </button>,
            <button
              key="play"
              className={cn(
                " bg-blue-500 text-white",
                !project.frames.length && "opacity-50 !cursor-not-allowed",
                project.frames.length && "hover:bg-blue-800"
              )}
              onClick={() => setPreview(true)}
              disabled={!project.frames.length}
            >
              <PiPlayFill /> Play
            </button>,
          ]}
        />
        {project.frames.length === 0 && <EmptyProject projectId={project.id} />}
        {project.frames.length > 0 && (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto gap-2">
            <SortableContext items={project.frames}>
              {project.frames.map((frame) => (
                <SortableItem key={frame.id} id={frame.id}>
                  <div
                    key={frame.id}
                    className={cn("relative", frame.hidden && "opacity-50")}
                  >
                    <div className="relative group">
                      {frame.hidden && (
                        <FaEyeSlash className="absolute top-1/2 left-1/2 -translate-1/2 w-8 h-8 text-black z-10" />
                      )}
                      <div
                        className="z-10 absolute top-0 left-0 w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity p-2"
                        data-no-dnd="true"
                      >
                        <button
                          onClick={() => editFrame(frame.id)}
                          className="!gap-1 !py-1 !px-2 bg-white/50 rounded-lg hover:bg-white"
                        >
                          <MdEdit className="w-5 h-5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleFrameDelete(frame.id)}
                          className="!gap-1 !py-1 !px-2 text-red-800 bg-white/50 rounded-lg hover:bg-red-800 hover:text-white"
                        >
                          Delete
                          <MdDelete className="w-5 h-5" />
                        </button>
                      </div>
                      <div
                        className="z-10 absolute bottom-0 left-0 w-full flex items-center justify-center p-2"
                        data-no-dnd="true"
                      >
                        <input
                          type="checkbox"
                          value={frame.id}
                          checked={compareFrames.includes(frame.id)}
                          onChange={handleCompareChange}
                          id={`compare-${frame.id}`}
                          className="sr-only peer"
                        />
                        <label
                          htmlFor={`compare-${frame.id}`}
                          className="btn !gap-1 !py-1 !px-2 bg-white/50 rounded-lg hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 peer-checked:opacity-100 peer-checked:bg-white"
                        >
                          {compareFrames.includes(frame.id) ? (
                            <MdCheck className="w-5 h-5" />
                          ) : (
                            <MdCompare className="w-5 h-5" />
                          )}
                          Compare
                        </label>
                      </div>
                      <FrameImage
                        projectId={project.id}
                        key={frame.image}
                        id={frame.id}
                        className="rounded"
                        ratio="aspect-[calc(3/4)]"
                        alt={frame.caption || ""}
                      />
                      {frame.caption && (
                        <div className="group-hover:opacity-0 transition-opacity absolute bottom-0 left-0 w-full flex items-center justify-center p-1 bg-black/50 text-white text-xs line-clamp-1 overflow-ellipsis rounded-b">
                          {frame.caption}
                        </div>
                      )}
                    </div>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
            <UploadFrame projectId={project.id} />
          </div>
        )}
        {preview && (
          <Preview projectId={project.id} onClose={() => setPreview(false)} />
        )}
        {editing && (
          <EditFrameModal
            projectId={project.id}
            frameId={editing}
            onClose={() => setEditing(null)}
            onChange={setEditing}
          />
        )}
        {compareFrames.length === 2 && (
          <Compare
            projectId={project.id}
            leftFrameId={compareFrames[0]!}
            rightFrameId={compareFrames[1]!}
            onClose={() => setCompareFrames([])}
          />
        )}
      </Dropzone>
    </DndContext>
  );
}
