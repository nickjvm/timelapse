"use client";
import { motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";
import { MdDownload, MdDragIndicator } from "react-icons/md";

import useFrame from "@/hooks/useFrame";
import useDownloadImage from "@/hooks/useDownloadImage";
import cn from "@/utils/cn";

import Image from "@/components/Image";
import { BaseModal } from "@/components/modals/Base";

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

  const { downloadImage, isPending } = useDownloadImage(containerRef);

  return (
    <BaseModal
      open={true}
      onClose={onClose}
      variant="dark"
      className="flex flex-col space-y-2 items-center justify-center"
    >
      <div className="flex items-center justify-center mb-4 space">
        <button
          className={cn(
            "text-black px-2 py-1 !rounded-l-full border border-white w-36 text-center justify-center",
            mode === "side-by-side" ? "bg-white" : "text-white"
          )}
          onClick={() => setMode("side-by-side")}
        >
          Side by Side
        </button>
        <button
          className={cn(
            "text-black px-2 py-1 !rounded-r-full border border-white w-36 text-center justify-center",
            mode === "overlaid" ? "bg-white" : "text-white"
          )}
          onClick={() => setMode("overlaid")}
        >
          Overlaid
        </button>
        <button
          title="Download"
          className="!rounded-full border border-white !p-2.5 hover:bg-white hover:text-black transition-colors ml-2"
          onClick={() =>
            downloadImage(
              `compare-${leftFrame?.caption}-${rightFrame?.caption}`
            )
          }
        >
          <span className="sr-only">Download Comparison</span>
          <MdDownload className="w-5 h-5" />
        </button>
      </div>
      {mode === "overlaid" && (
        <div
          ref={containerRef}
          className="relative items-center justify-center aspect-[calc(3/4)]"
        >
          <div>
            <Image
              projectId={projectId}
              id={leftFrameId}
              ratio="aspect-[calc(3/4)]"
              className="w-xs sm:w-sm md:w-md"
              alt={leftFrame?.caption || ""}
            />
            <p className="absolute bottom-0 left-0 right-0 text-right md:text-lg text-shadow-lg font-bold text-white p-2">
              {leftFrame?.caption}
            </p>
          </div>
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: compareWidth + "px" }}
          >
            <Image
              projectId={projectId}
              id={rightFrameId}
              ratio="aspect-[calc(3/4)]"
              className="w-xs sm:w-sm md:w-md"
              alt={rightFrame?.caption || ""}
            />
            <p className="absolute bottom-0 left-0 right-0 text-left md:text-lg text-shadow-lg font-bold text-white p-2 whitespace-nowrap overflow-hidden">
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
        <div
          ref={containerRef}
          className={cn(
            "relative items-center justify-center grid grid-cols-2 gap-2 w-full max-w-3xl pb-12 pt-4 px-4",
            isPending && "bg-black/50"
          )}
        >
          <div className="relative">
            <Image
              projectId={projectId}
              id={leftFrameId}
              ratio="aspect-[calc(3/4)]"
              className="w-full"
              alt={leftFrame?.caption || ""}
            />
            <p className="absolute top-full left-0 right-0 text-center text-sm md:text-xl font-bold text-white p-2">
              {leftFrame?.caption}
            </p>
          </div>
          <div className="relative">
            <Image
              projectId={projectId}
              id={rightFrameId}
              ratio="aspect-[calc(3/4)]"
              className="w-full"
              alt={rightFrame?.caption || ""}
            />
            <p className="absolute top-full left-0 right-0 text-center text-sm md:text-xl font-bold text-white p-2">
              {rightFrame?.caption}
            </p>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
