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

import EditFrameOptions from "@/components/EditFrameOptions";
import cn from "@/utils/cn";
import { Frame, Project, useAppStore, useSettings } from "@/store";
import useFrame from "@/hooks/useFrame";
import useProject from "@/hooks/useProject";
import useFrames from "@/hooks/useFrames";
import useDownloadImage from "@/hooks/useDownloadImage";

type AlterationsTypes = "rotate" | "zoom" | "caption" | null;

type ImageContext = {
  frame: Frame;
  project: Project;
  ratio: string;
  alterationType: AlterationsTypes;
  setAlterationType: (alterationType: AlterationsTypes) => void;
  scale: MotionValue<number>;
  rotation: MotionValue<number>;
  position: {
    x: MotionValue<number>;
    y: MotionValue<number>;
  };
  editing?: boolean;
  downloadImage: (filename: string) => void;
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
  editing?: boolean;
} & HTMLMotionProps<"div">;

export default function Image({
  projectId,
  id,
  ratio,
  className,
  editing,
}: Props) {
  const [alterationType, setAlterationType] = useState<AlterationsTypes>(null);

  const project = useProject(projectId);
  const frame = useFrame(projectId, id);

  const x = useMotionValue(frame?.position.x || 0);
  const y = useMotionValue(frame?.position.y || 0);
  const scale = useMotionValue(frame?.scale || 1);
  const rotation = useMotionValue(frame?.rotation || 0);

  const containerRef = useRef<HTMLDivElement>(null);

  const { downloadImage, isPending: isDownloadPending } =
    useDownloadImage(containerRef);

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
  }, [frame?.id, editing]);

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
        alterationType,
        setAlterationType,
        scale,
        rotation,
        editing,
        downloadImage,
        position: {
          x,
          y,
        },
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          ratio,
          "overflow-hidden bg-neutral-200 relative rounded",
          className
        )}
      >
        <Image.Draggable containerRef={containerRef} />
        {!isDownloadPending && <Image.Ghost />}
      </div>
      {editing && (
        <div className="absolute right-2 top-2">
          <EditFrameOptions />
        </div>
      )}
      <Image.Caption />
      <Image.Zoom />
      <Image.Rotate />
    </ImageContext.Provider>
  );
}

Image.Draggable = function ImageDraggable({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const {
    project,
    frame,
    editing,
    position: { x, y },
    scale,
    rotation,
  } = useImageContext();

  const [dragging, setDragging] = useState(false);
  const controls = useAnimationControls();
  const { updateFrame } = useAppStore();

  const imageRef = useRef<HTMLImageElement>(null);

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
    if (!editing) {
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

  if (editing) {
    return (
      <motion.div
        className={cn("cursor-grab", dragging && "cursor-grabbing")}
        drag={editing}
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
          ref={imageRef}
          src={frame.image}
          alt={frame.caption || ""}
          className="w-full h-auto pointer-events-none"
        />
      </motion.div>
    );
  }

  return (
    <img
      src={frame.image}
      alt={frame.caption || ""}
      className="w-full h-auto relative"
      style={{
        left: `${frame.position.x * 100}%`,
        top: `${frame.position.y * 100}%`,
        transform: `scale(${frame.scale}) rotate(${frame.rotation}deg)`,
      }}
    />
  );
};

Image.Ghost = function ImageGhost() {
  const { project, frame, editing } = useImageContext();
  const { ghost } = useSettings();
  const { frames } = useFrames(project.id);
  const prevFrameIndex = frames.findIndex((f) => f.id === frame.id) - 1;

  if (!editing || !ghost || prevFrameIndex < 0) {
    return null;
  }

  return (
    <Image
      projectId={project.id}
      id={frames[prevFrameIndex].id}
      ratio="aspect-[calc(3/4)]"
      alt="previous frame ghost"
      className="w-full absolute top-0 opacity-30 pointer-events-none left-1/2 -translate-x-1/2"
    />
  );
};

Image.Caption = function ImageCaption() {
  const { project, frame, alterationType, setAlterationType, editing } =
    useImageContext();
  const { updateFrame } = useAppStore();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateFrame(project.id, frame.id, {
      caption: event.target.value,
    });
    setAlterationType(null);
  };

  if (!editing) {
    return null;
  }

  if (!alterationType && !frame.caption) {
    return (
      <button
        onClick={() => setAlterationType("caption")}
        className="absolute bottom-2 left-2  bg-black/50 text-white !p-2 text-lg !rounded-full text-center hover:bg-black/75 transition-colors"
      >
        <RxText className="w-7 h-7" />
      </button>
    );
  } else if (
    alterationType === "caption" ||
    (!alterationType && frame.caption)
  ) {
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
};

Image.Zoom = function ImageZoom() {
  const { alterationType, scale, editing } = useImageContext();

  if (!editing || alterationType !== "zoom") {
    return null;
  }

  return (
    <div className="flex items-center md:gap-4 mt-3 absolute bottom-2 left-2 right-2 bg-black/75 rounded-full">
      <button
        onClick={() => scale.set(scale.get() - 0.1)}
        className="!rounded-l-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors"
      >
        <HiMiniMagnifyingGlassMinus className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <input
        type="range"
        min=".5"
        max="3"
        step=".01"
        value={scale.get()}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        onChange={(e) => scale.set(parseFloat(e.target.value))}
      />
      <button
        onClick={() => scale.set(scale.get() + 0.1)}
        className="!rounded-r-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors"
      >
        <HiMiniMagnifyingGlassPlus className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </div>
  );
};

Image.Rotate = function ImageRotate() {
  const { alterationType, rotation, editing } = useImageContext();

  if (!editing || alterationType !== "rotate") {
    return null;
  }

  return (
    <div className="flex items-center md:gap-4 mt-3 absolute bottom-2 left-2 right-2 bg-black/75 rounded-full">
      <button
        onClick={() => rotation.set(rotation.get() - 1)}
        className="!rounded-l-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors"
      >
        <MdOutlineRotateLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <input
        type="range"
        min="-180"
        max="180"
        step="1"
        value={rotation.get()}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        onChange={(e) => rotation.set(parseFloat(e.target.value))}
      />
      <button
        onClick={() => rotation.set(rotation.get() + 1)}
        className="!rounded-r-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors"
      >
        <MdOutlineRotateRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </div>
  );
};
