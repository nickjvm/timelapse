"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { notFound, useParams } from "next/dist/client/components/navigation";
import { Frame as FrameType, useAppStore, useProjects } from "@/store";

type Props = {
  comparison?: FrameType;
} & FrameType;
export default function Frame({ image, id, comparison, ...frame }: Props) {
  const [editing, setEditing] = useState(false);
  const { id: projectId } = useParams();
  const projects = useProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    notFound();
  }
  const { updateProject } = useAppStore();

  const x = useMotionValue(frame.position.x || 0);
  const y = useMotionValue(frame.position.y || 0);
  const scale = useMotionValue(frame.scale || 1);

  const controls = useAnimationControls();

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [constraints, setConstraints] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });

  const saveFramePosition = () => {
    updateProject(projectId as string, {
      frames: project.frames.map((frame) => {
        if (frame.id === id) {
          return {
            ...frame,
            position: { x: x.get(), y: y.get() },
            scale: scale.get(),
          };
        }
        return frame;
      }),
    });
  };

  const onScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    scale.set(newScale);
    saveFramePosition();
  };

  useEffect(() => {
    calculateConstraints();
  }, []);

  useMotionValueEvent(scale, "change", calculateConstraints);
  useMotionValueEvent(x, "change", saveFramePosition);
  useMotionValueEvent(y, "change", saveFramePosition);

  function calculateConstraints() {
    if (imageRef.current && containerRef.current) {
      const internalScale =
        imageRef.current.offsetWidth / imageRef.current.naturalWidth;

      const newWidth =
        imageRef.current.naturalWidth * internalScale * scale.get();
      const newHeight =
        imageRef.current.naturalHeight * internalScale * scale.get();

      const maxY =
        newHeight > containerRef.current.offsetHeight
          ? (newHeight - containerRef.current.offsetHeight) / 2
          : (containerRef.current.offsetHeight - newHeight) / 2;
      const maxX =
        newWidth > containerRef.current.offsetWidth
          ? (newWidth - containerRef.current.offsetWidth) / 2
          : (containerRef.current.offsetWidth - newWidth) / 2;

      if (x.get() > maxX) {
        x.set(maxX);
      } else if (x.get() < -maxX) {
        x.set(-maxX);
      }

      if (y.get() > maxY) {
        y.set(maxY);
      } else if (y.get() < -maxY) {
        y.set(-maxY);
      }

      setConstraints({
        top: -maxY,
        left: -maxX,
        bottom: maxY,
        right: maxX,
      });
    }
  }

  return (
    <div className="block w-3xs shrink-0 relative">
      <button
        onClick={() => setEditing(!editing)}
        className="absolute top-2 right-2 z-10 bg-white p-1 rounded shadow"
      >
        {editing ? "Done" : "Edit"}
      </button>
      <div
        ref={containerRef}
        className="aspect-[calc(3/4)] max-w-3xs border border-neutral-200 shadow overflow-hidden bg-neutral-200 relative"
      >
        <motion.div
          drag
          style={{ x, y, scale }}
          dragTransition={{
            bounceStiffness: 1000,
          }}
          className="relative aspect-[calc(3/4)] w-full"
          dragMomentum={false}
          dragElastic={0.05}
          // dragControls={dragControls}
          animate={controls}
          dragConstraints={constraints}
          onDragStart={calculateConstraints}
        >
          <Image
            ref={imageRef}
            src={image}
            alt="Selected"
            fill
            draggable={false}
            className={`object-scale-down select-none h-auto`}
          />
        </motion.div>
        {editing && comparison && (
          <div
            className="absolute w-full h-full z-20 top-0 left-0 opacity-10 pointer-events-none"
            style={{
              transform: `scale(${comparison.scale})`,
              left: comparison.position.x,
              top: comparison.position.y,
            }}
          >
            <Image
              src={comparison.image}
              alt="Selected"
              fill
              className={`object-scale-down select-none h-auto`}
            />
          </div>
        )}
      </div>
      {editing && (
        <input
          type="range"
          min=".5"
          max="3"
          step="0.1"
          defaultValue={frame.scale || 1}
          onChange={onScaleChange}
          className="relative z-10 w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-200"
        />
      )}
    </div>
  );
}
