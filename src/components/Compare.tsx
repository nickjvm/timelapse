"use client";
import { motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MdDragIndicator } from "react-icons/md";

import FrameImage from "@/components/Image";
import useFrame from "@/hooks/useFrame";

type Props = {
  projectId: string;
  leftFrameId: string;
  rightFrameId: string;
  onClose: () => void;
};

export default function Compare({
  projectId,
  leftFrameId,
  rightFrameId,
  onClose,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(100);

  const [mode, setMode] = useState<"side-by-side" | "overlaid">("side-by-side");
  const [compareWidth, setCompareWidth] = useState(x.get());

  useMotionValueEvent(x, "change", setCompareWidth);

  const leftFrame = useFrame(projectId, leftFrameId);
  const rightFrame = useFrame(projectId, rightFrameId);

  // useEffect(() => {
  //     if (mode === 'overlaid' && containerRef.current) {
  //         x.set(containerRef.current.offsetWidth / 2)
  //     }
  //     /* eslint-disable-next-line react-hooks/exhaustive-deps */
  // }, [mode])

  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeypress);
    return () => {
      document.removeEventListener("keydown", handleKeypress);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <div
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          onClose();
        }
      }}
      className="fixed w-full h-full top-0 left-0 right-0 bottom-0 bg-black/90 z-50 space-y-3 flex items-center flex-col justify-center"
    >
      <div className="flex items-center justify-center space-x-2">
        <button
          className={` text-black px-2 py-1 rounded border border-white ${mode === "side-by-side" ? "bg-white" : "text-white"}`}
          onClick={() => setMode("side-by-side")}
        >
          Side by Side
        </button>
        <button
          className={` text-black px-2 py-1 rounded border border-white ${mode === "overlaid" ? "bg-white" : "text-white"}`}
          onClick={() => setMode("overlaid")}
        >
          Overlaid
        </button>
      </div>
      <div className="flex items-center justify-center">
        {mode === "overlaid" && (
          <div
            ref={containerRef}
            className="relative items-center justify-center aspect-[calc(3/4)]"
          >
            <div>
              <FrameImage
                projectId={projectId}
                id={leftFrameId}
                ratio="aspect-[calc(3/4)]"
                className="w-md"
                alt=""
              />
              <p className="absolute bottom-0 left-0 right-0 text-right text-lg text-shadow-lg font-bold text-white p-2">
                {leftFrame?.caption}
              </p>
            </div>
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: compareWidth + "px" }}
            >
              <FrameImage
                projectId={projectId}
                id={rightFrameId}
                ratio="aspect-[calc(3/4)]"
                className="w-md"
                alt=""
              />
              <p className="absolute bottom-0 left-0 right-0 text-left text-lg text-shadow-lg font-bold text-white p-2 whitespace-nowrap overflow-hidden">
                {rightFrame?.caption}
              </p>
            </div>
            <motion.div
              drag
              style={{ x }}
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={containerRef}
              className="p-0 bg-neutral-600 absolute top-0 bottom-0 cursor-ew-resize shadow-lg flex items-center justify-center"
            >
              <MdDragIndicator className="text-neutral-400 w-3 h-3" />
            </motion.div>
          </div>
        )}
        {mode === "side-by-side" && (
          <div className="relative items-center justify-center flex gap-2">
            <div className="relative">
              <FrameImage
                projectId={projectId}
                id={leftFrameId}
                ratio="aspect-[calc(3/4)]"
                className="w-md"
                alt=""
              />
              <p className="absolute top-full left-0 right-0 text-center text-xl font-bold text-white p-2">
                {leftFrame?.caption}
              </p>
            </div>
            <div className="relative">
              <FrameImage
                projectId={projectId}
                id={rightFrameId}
                ratio="aspect-[calc(3/4)]"
                className="w-md"
                alt=""
              />
              <p className="absolute top-full left-0 right-0 text-center text-xl font-bold text-white p-2">
                {rightFrame?.caption}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
