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
  size?: 'small' | 'medium' | 'large'
  editable?: boolean
  editing?: boolean
} & FrameType;
export default function Frame({ image, id, comparison, editing, ...frame }: Props) {
  const { id: projectId } = useParams();
  const projects = useProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    notFound();
  }
  const { updateProject } = useAppStore();

  const x = useMotionValue(frame.position.x * frame.scale || 0);
  const y = useMotionValue(frame.position.y * frame.scale || 0);
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
            position: { x: x.get() / scale.get(), y: y.get() / scale.get() },
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
    if (containerRef.current) {
      setConstraints({
        top: -containerRef.current.offsetHeight / 2,
        left: -containerRef.current.offsetWidth / 2,
        bottom: containerRef.current.offsetHeight / 2,
        right: containerRef.current.offsetWidth / 2,
      });
    }
  }, []);

  // useMotionValueEvent(scale, "change", calculateConstraints);
  useMotionValueEvent(x, "change", saveFramePosition);
  useMotionValueEvent(y, "change", saveFramePosition);

  return (
    <div className="flex flex-col mx-auto w-full max-w-xl space-y-4 my-auto">
      <div
        ref={containerRef}
        className={`aspect-[calc(3/4)] overflow-hidden bg-neutral-200 relative`}
      >
        <motion.div
          drag={editing}
          style={{ x, y, scale }}
          dragTransition={{
            bounceStiffness: 1000,
          }}
          className="relative w-full"
          dragMomentum={false}
          dragElastic={0.05}
          // dragControls={dragControls}
          animate={controls}
          dragConstraints={constraints}
        >
          <Image
            ref={imageRef}
            src={image}
            alt="Selected"
            width={400}
            height={400}
            draggable={false}
            className={`w-full object-contain select-none h-auto`}
          />
        </motion.div>
        {editing && comparison && (
          <div
            className="absolute w-full h-full z-20 top-0 left-0 opacity-20 pointer-events-none"
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
