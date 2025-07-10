"use client";
import { motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";
import { MdDownload, MdDragIndicator } from "react-icons/md";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";

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
  const [frames, setFrames] = useState<string[]>([leftFrameId, rightFrameId]);
  const x = useMotionValue(100);

  const [mode, setMode] = useState<"side-by-side" | "overlaid">("side-by-side");
  const [compareWidth, setCompareWidth] = useState(x.get());

  useMotionValueEvent(x, "change", setCompareWidth);

  const leftFrame = useFrame(projectId, frames[0]);
  const rightFrame = useFrame(projectId, frames[1]);

  const { downloadImage, isPending } = useDownloadImage(containerRef);

  return (
    <BaseModal
      open={true}
      onClose={onClose}
      variant="dark"
      className="flex flex-col space-y-2 items-center justify-center"
    >
      <div className="flex items-center justify-center mb-4 space-x-2">
        <button
          title="Switch"
          className="!rounded-full border border-white !p-2.5 hover:bg-white hover:text-black transition-colors"
          onClick={() => setFrames((prev) => prev.toReversed())}
        >
          <span className="sr-only">Switch</span>
          <HiOutlineSwitchHorizontal className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center">
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
        </div>
        <button
          title="Download"
          className="!rounded-full border border-white !p-2.5 hover:bg-white hover:text-black transition-colors"
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
              key={frames[0]}
              projectId={projectId}
              id={frames[0]}
              ratio="aspect-[calc(3/4)]"
              className="w-xs sm:w-sm md:w-md"
              alt={leftFrame?.caption || ""}
            >
              <Image.Draggable />
              <Image.Caption className="text-shadow-lg bg-transparent md:p-1.5 whitespace-nowrap text-right font-bold" />
            </Image>
          </div>
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: compareWidth + "px" }}
          >
            <Image
              key={frames[1]}
              projectId={projectId}
              id={frames[1]}
              ratio="aspect-[calc(3/4)]"
              className="w-xs sm:w-sm md:w-md"
              alt={rightFrame?.caption || ""}
            >
              <Image.Draggable />
              <Image.Caption className="text-shadow-lg bg-transparent md:p-1.5 whitespace-nowrap text-left font-bold" />
            </Image>
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
            "relative items-center justify-center grid grid-cols-2 gap-2 w-full max-w-3xl p-4",
            isPending && "bg-black/50"
          )}
        >
          <div className="relative">
            <Image
              projectId={projectId}
              id={frames[0]}
              ratio="aspect-[calc(3/4)]"
              className="w-full"
              alt={leftFrame?.caption || ""}
            >
              <Image.Draggable saveOnChange={false} />
              <Image.Rotate
                size="small"
                className="absolute left-2 top-full right-2 mt-2 md:opacity-30 hover:opacity-100 transition-opacity"
              />
              <Image.Zoom
                size="small"
                direction="vertical"
                className="absolute right-full top-2 bottom-2 mr-2 md:opacity-30 hover:opacity-100 transition-opacity"
              />
              <Image.Caption className="md:text-xs md:p-1.5" />
            </Image>
          </div>
          <div className="relative">
            <Image
              projectId={projectId}
              id={frames[1]}
              ratio="aspect-[calc(3/4)]"
              className="w-full"
              alt={rightFrame?.caption || ""}
            >
              <Image.Draggable saveOnChange={false} />
              <Image.Rotate
                size="small"
                className="absolute left-2 top-full right-2 mt-2 md:opacity-30 hover:opacity-100 transition-opacity"
              />
              <Image.Zoom
                size="small"
                direction="vertical"
                className="absolute left-full top-2 bottom-2 ml-2 md:opacity-30 hover:opacity-100 transition-opacity"
              />
              <Image.Caption className="md:text-xs md:p-1.5" />
            </Image>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
