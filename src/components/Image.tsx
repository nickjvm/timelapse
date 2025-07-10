/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ChangeEvent,
} from "react";
import {
  HTMLMotionProps,
  motion,
  MotionValue,
  useAnimationControls,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import {
  HiMiniMagnifyingGlassMinus,
  HiMiniMagnifyingGlassPlus,
} from "react-icons/hi2";
import { MdOutlineRotateLeft, MdOutlineRotateRight } from "react-icons/md";
import { RxText } from "react-icons/rx";

import cn from "@/utils/cn";
import { Frame, Project, useAppStore } from "@/store";
import useFrame from "@/hooks/useFrame";
import useProject from "@/hooks/useProject";
import useFrames from "@/hooks/useFrames";

export type AlterationsTypes = "rotate" | "zoom" | "caption" | null;

type ImageContext = {
  frame: Frame;
  project: Project;
  ratio: string;
  scale: MotionValue<number>;
  rotation: MotionValue<number>;
  position: {
    x: MotionValue<number>;
    y: MotionValue<number>;
  };
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const ImageContext = createContext<ImageContext | undefined>(undefined);

export function useImageContext() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageContext must be used within an Image component");
  }
  return context;
}

type Props = {
  projectId: string;
  id: string;
  ratio: string;
  alt: string;
} & HTMLMotionProps<"div"> &
  React.PropsWithChildren;

export default function Image({
  projectId,
  id,
  ratio,
  className,
  children,
}: Props) {
  const project = useProject(projectId);
  const frame = useFrame(projectId, id);

  const x = useMotionValue(frame?.position.x || 0);
  const y = useMotionValue(frame?.position.y || 0);
  const scale = useMotionValue(frame?.scale || 1);
  const rotation = useMotionValue(frame?.rotation || 0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!frame) {
      return;
    }

    const pixelPosition = getPixelPosition(frame.position.x, frame.position.y);

    x.set(pixelPosition.x);
    y.set(pixelPosition.y);
    scale.set(frame.scale);
    rotation.set(frame.rotation);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [frame?.id]);

  // Convert percentage back to pixels for rendering
  const getPixelPosition = (xPercent: number, yPercent: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const x = xPercent * containerWidth;
    const y = yPercent * containerHeight;

    return { x, y };
  };

  if (!frame || !project) {
    return null;
  }

  return (
    <ImageContext.Provider
      value={{
        frame,
        project,
        ratio,
        scale,
        rotation,
        containerRef,
        position: {
          x,
          y,
        },
      }}
    >
      <div className={cn("overflow-hidden rounded w-full", ratio, className)}>
        {children}
      </div>
    </ImageContext.Provider>
  );
}

type ImageDraggableProps = {
  saveOnChange?: boolean;
};
Image.Draggable = function ImageDraggable({
  saveOnChange = true,
}: ImageDraggableProps) {
  const {
    project,
    frame,
    position: { x, y },
    scale,
    rotation,
    containerRef,
    ratio,
  } = useImageContext();

  const [dragging, setDragging] = useState(false);
  const controls = useAnimationControls();
  const { updateFrame } = useAppStore();

  const [constraints, setConstraints] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });

  useEffect(() => {
    if (containerRef.current) {
      setConstraints({
        top: -containerRef.current.offsetHeight / 2,
        left: -containerRef.current.offsetWidth / 2,
        bottom: containerRef.current.offsetHeight / 2,
        right: containerRef.current.offsetWidth / 2,
      });
    }
  }, [containerRef]);

  const getPositionPercentages = (pixelX: number, pixelY: number) => {
    if (!containerRef.current) return { xPercent: 0, yPercent: 0 };

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    const xPercent = pixelX / containerWidth;
    const yPercent = pixelY / containerHeight;

    return { xPercent, yPercent };
  };

  const onReposition = () => {
    if (!saveOnChange) {
      return;
    }
    const pixelX = x.get();
    const pixelY = y.get();
    const { xPercent, yPercent } = getPositionPercentages(pixelX, pixelY);

    updateFrame(project.id, frame.id, {
      position: {
        x: xPercent,
        y: yPercent,
      },
      scale: scale.get(),
      rotation: rotation.get(),
    });
  };

  useMotionValueEvent(x, "change", onReposition);
  useMotionValueEvent(y, "change", onReposition);
  useMotionValueEvent(rotation, "change", onReposition);
  useMotionValueEvent(scale, "change", onReposition);

  return (
    <div
      ref={containerRef}
      className={cn(
        ratio,
        "w-full overflow-hidden bg-neutral-200 relative rounded"
      )}
    >
      <motion.div
        className={cn("cursor-grab", dragging && "cursor-grabbing")}
        drag
        style={{ x, y, scale, rotate: rotation }}
        dragTransition={{
          bounceStiffness: 1000,
        }}
        dragMomentum={false}
        dragElastic={0.05}
        animate={controls}
        dragConstraints={constraints}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setDragging(false)}
      >
        <img
          src={frame.image}
          alt={frame.caption || ""}
          className="w-full h-auto pointer-events-none"
        />
      </motion.div>
    </div>
  );
};

Image.Static = function ImageStatic({
  className,
  frameIndex,
  ref,
}: {
  className?: string;
  frameIndex?: number;
  ref?: React.RefObject<HTMLDivElement | null>;
}) {
  const { project, frame, containerRef, ratio } = useImageContext();
  const ghostFrame = project.frames[frameIndex ?? -1] || frame;

  return (
    <div
      ref={ref ?? containerRef}
      className={cn(
        ratio,
        "w-full overflow-hidden bg-neutral-200 relative rounded",
        className
      )}
    >
      <img
        className="w-full h-auto relative"
        src={ghostFrame.image}
        alt={ghostFrame.caption || ""}
        style={{
          left: `${ghostFrame.position.x * 100}%`,
          top: `${ghostFrame.position.y * 100}%`,
          transform: `scale(${ghostFrame.scale}) rotate(${ghostFrame.rotation}deg)`,
        }}
      />
    </div>
  );
};

Image.Ghost = function ImageGhost() {
  const { project, frame } = useImageContext();
  const { frames } = useFrames(project.id);
  const prevFrameIndex = frames.findIndex((f) => f.id === frame.id) - 1;

  const ref = useRef<HTMLDivElement>(null);

  if (prevFrameIndex < 0) {
    return null;
  }

  return (
    <Image.Static
      ref={ref}
      frameIndex={prevFrameIndex}
      className="opacity-30 top-0 left-0 absolute pointer-events-none"
    />
  );
};

Image.Caption = function ImageCaption({
  editable = false,
  className,
}: {
  editable?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const { project, frame } = useImageContext();
  const { updateFrame } = useAppStore();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFrame(project.id, frame.id, {
      caption: event.target.value,
    });
    setEditing(false);
  };

  if (editable) {
    if (!editing && !frame.caption) {
      return (
        <button
          onClick={() => setEditing(true)}
          className="absolute bottom-2 left-2  bg-black/50 text-white !p-2.5 text-lg !rounded-full text-center hover:bg-black/75 transition-colors"
        >
          <RxText className="w-7 h-7" />
        </button>
      );
    } else {
      return (
        <label>
          <span className="sr-only">Add a caption</span>
          <input
            placeholder="Add a caption..."
            type="text"
            autoFocus={!frame.caption}
            defaultValue={frame.caption || ""}
            onBlur={onChange}
            className="absolute bottom-2 left-2 right-2 bg-black/75 text-white p-2 md:p-2.5 px-4 text-xs md:text-lg rounded-full text-center"
          />
        </label>
      );
    }
  }

  if (frame.caption) {
    return (
      <div
        className={cn(
          "absolute bottom-2 left-2 right-2 bg-black/75 text-white p-2 md:p-2.5 px-4 text-xs md:text-lg rounded-full text-center",
          className
        )}
      >
        {frame.caption}
      </div>
    );
  }

  return "null";
};

type ZoomRotateProps = {
  direction?: "horizontal" | "vertical";
  className?: string;
  size?: "small" | "medium" | "large";
};
Image.Zoom = function ImageZoom({
  direction = "horizontal",
  className,
  size = "medium",
}: ZoomRotateProps) {
  const { scale } = useImageContext();

  return (
    <div
      className={cn(
        "flex items-center md:gap-4 bg-black/75 rounded-full",
        direction === "vertical" && "flex-col",
        className
      )}
    >
      <button
        onClick={() => scale.set(scale.get() - 0.1)}
        className={cn(
          "!p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors",
          direction === "vertical" ? "!rounded-t-full" : "!rounded-l-full"
        )}
      >
        <HiMiniMagnifyingGlassMinus
          className={cn(
            size === "small" && "w-4 h-4 md:w-6 md:h-6",
            size === "medium" && "w-6 h-6 md:w-8 md:h-8",
            size === "large" && "w-8 h-8 md:w-10 md:h-10"
          )}
        />
      </button>
      <input
        type="range"
        min=".5"
        max="3"
        step=".01"
        defaultValue={scale.get()}
        className={cn(
          direction,
          "grow w-full bg-gray-200 rounded-lg appearance-none cursor-pointer",
          size === "large" && direction === "horizontal" ? "h-2" : "h-1.5",
          direction === "vertical" ? "h-full" : "w-full",
          size === "large" && direction === "vertical" ? "w-2" : "w-1.5"
        )}
        onChange={(e) => scale.set(parseFloat(e.target.value))}
      />
      <button
        onClick={() => scale.set(scale.get() + 0.1)}
        className={cn(
          "!p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors",
          direction === "vertical" ? "!rounded-b-full" : "!rounded-r-full"
        )}
      >
        <HiMiniMagnifyingGlassPlus
          className={cn(
            size === "small" && "w-4 h-4 md:w-6 md:h-6",
            size === "medium" && "w-6 h-6 md:w-8 md:h-8",
            size === "large" && "w-8 h-8 md:w-10 md:h-10"
          )}
        />
      </button>
    </div>
  );
};

Image.Grid = function ImageGrid() {
  return (
    <>
      <div
        className={cn(
          "absolute -inset-px pointer-events-none bg-size-[calc(100%/3)_calc(100%/3)] opacity-30",
          "bg-gradient-to-r from-white from-[1px] to-transparent to-[1px] mix-blend-difference"
        )}
      />
      <div
        className={cn(
          "absolute -inset-px pointer-events-none bg-size-[calc(100%/3)_calc(100%/3)] opacity-30",
          "bg-gradient-to-b from-white from-[1px] to-transparent to-[1px] mix-blend-difference"
        )}
      />
    </>
  );
};

Image.Rotate = function ImageRotate({
  direction = "horizontal",
  className,
  size = "medium",
}: ZoomRotateProps) {
  const { rotation } = useImageContext();

  return (
    <div
      className={cn(
        "flex items-center md:gap-4 mt-3 bg-black/75 rounded-full",
        direction === "vertical" && "flex-col",
        className
      )}
    >
      <button
        onClick={() => rotation.set(rotation.get() - 1)}
        className={cn(
          "!p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors",
          direction === "vertical" ? "!rounded-t-full" : "!rounded-l-full"
        )}
      >
        <MdOutlineRotateLeft
          className={cn(
            size === "small" && "w-4 h-4 md:w-6 md:h-6",
            size === "medium" && "w-6 h-6 md:w-8 md:h-8",
            size === "large" && "w-8 h-8 md:w-10 md:h-10"
          )}
        />
      </button>
      <input
        type="range"
        min="-180"
        max="180"
        step="1"
        defaultValue={rotation.get()}
        className={cn(
          direction,
          "grow w-full bg-gray-200 rounded-lg appearance-none cursor-pointer",
          size === "large" && direction === "horizontal" ? "h-2" : "h-1.5",
          direction === "vertical" ? "h-full" : "w-full",
          size === "large" && direction === "vertical" ? "w-2" : "w-1.5"
        )}
        onChange={(e) => rotation.set(parseFloat(e.target.value))}
      />
      <button
        onClick={() => rotation.set(rotation.get() + 1)}
        className={cn(
          "!p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors",
          direction === "vertical" ? "!rounded-b-full" : "!rounded-r-full"
        )}
      >
        <MdOutlineRotateRight
          className={cn(
            size === "small" && "w-4 h-4 md:w-6 md:h-6",
            size === "medium" && "w-6 h-6 md:w-8 md:h-8",
            size === "large" && "w-8 h-8 md:w-10 md:h-10"
          )}
        />
      </button>
    </div>
  );
};
