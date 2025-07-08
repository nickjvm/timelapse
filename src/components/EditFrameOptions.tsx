import { BsSymmetryHorizontal, BsSymmetryVertical } from "react-icons/bs";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { MdDelete, MdOutlineRotateLeft } from "react-icons/md";
import { RiGhost2Fill, RiGhost2Line } from "react-icons/ri";
import { RxReset } from "react-icons/rx";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

import { useAppStore, useSettings } from "@/store";
import cn from "@/utils/cn";
import { useImageContext } from "./Image";
import { flipImage } from "@/utils/flipImage";

export default function EditFrameOptions() {
  const {
    project,
    frame,
    alterationType,
    setAlterationType,
    position,
    scale,
    rotation,
  } = useImageContext();
  const settings = useSettings();
  const { updateSettings, updateFrame, updateProject } = useAppStore();

  async function onFlip(direction: "horizontal" | "vertical") {
    const flippedImage = await flipImage(frame.image, direction);

    updateFrame(project.id, frame.id, {
      image: flippedImage,
    });
  }

  const onDelete = () => {
    if (confirm("Are you sure you want to delete this frame?")) {
      updateProject(project.id, {
        frames: project.frames.filter((frame) => frame.id !== frame.id),
      });
    }
  };

  const onReset = () => {
    updateFrame(project.id, frame.id, {
      position: {
        x: 0,
        y: 0,
      },
      scale: 1,
      rotation: 0,
    });
    position.x.set(0);
    position.y.set(0);
    scale.set(1);
    rotation.set(0);
  };

  const onShowHide = () => {
    updateFrame(project.id, frame.id, {
      hidden: !frame?.hidden,
    });
  };

  const onToggleGhost = () => {
    updateSettings({
      ghost: !settings.ghost,
    });
  };

  return (
    <div className="z-50 px-2 py-0.5 bg-white transition-opacity opacity-20 hover:shadow hover:opacity-85 w-13 rounded-full  relative flex flex-col justify-center items-center overflow-hidden">
      <button
        onClick={() =>
          setAlterationType(alterationType === "rotate" ? null : "rotate")
        }
        className={cn(
          "hover:text-white !rounded-full !p-3 hover:bg-blue-600",
          alterationType === "rotate" && "bg-blue-600 text-white"
        )}
      >
        <MdOutlineRotateLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() =>
          setAlterationType(alterationType === "zoom" ? null : "zoom")
        }
        className={cn(
          "hover:text-white !rounded-full !p-3 hover:bg-blue-600",
          alterationType === "zoom" && "bg-blue-600 text-white"
        )}
      >
        <HiOutlineMagnifyingGlass className="w-6 h-6" />
      </button>
      <button
        onClick={() => onFlip("horizontal")}
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        <BsSymmetryVertical className="w-6 h-6" />
      </button>
      <button
        onClick={() => onFlip("vertical")}
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        <BsSymmetryHorizontal className="w-6 h-6" />
      </button>
      <button
        onClick={onToggleGhost}
        className={cn(
          "hover:text-white !rounded-full !p-3 hover:bg-purple-600",
          settings.ghost ? "text-purple-600" : ""
        )}
      >
        {settings.ghost ? (
          <RiGhost2Fill className="w-6 h-6" />
        ) : (
          <RiGhost2Line className="w-6 h-6" />
        )}
      </button>
      <button
        onClick={onReset}
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        <RxReset className="w-6 h-6" />
      </button>
      <button
        onClick={onShowHide}
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        {frame?.hidden ? (
          <FaEyeSlash className="w-6 h-6" />
        ) : (
          <FaEye className="w-6 h-6" />
        )}
      </button>
      <button
        onClick={onDelete}
        className="hover:text-white !rounded-full !p-3 hover:bg-red-600"
      >
        <MdDelete className="w-6 h-6" />
      </button>
    </div>
  );
}
