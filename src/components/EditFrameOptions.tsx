import { ElementType } from "react";
import { BsSymmetryHorizontal, BsSymmetryVertical } from "react-icons/bs";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { MdDelete, MdOutlineRotateLeft } from "react-icons/md";
import { RiGhost2Fill, RiGhost2Line } from "react-icons/ri";
import { RxReset } from "react-icons/rx";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

import { useAppStore, useSettings } from "@/store";
import cn from "@/utils/cn";
import { flipImage } from "@/utils/flipImage";
import { useNotifications } from "@/providers/Notifications";
import { useImageContext } from "@/components/Image";

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
  const { addNotification } = useNotifications();
  const frameIndex = project.frames.findIndex((f) => f.id === frame.id);

  async function onFlip(direction: "horizontal" | "vertical") {
    const flippedImage = await flipImage(frame.image, direction);

    updateFrame(project.id, frame.id, {
      image: flippedImage,
    });
  }

  const onDelete = () => {
    if (confirm("Are you sure you want to delete this frame?")) {
      updateProject(project.id, {
        frames: project.frames.filter((f) => f.id !== frame.id),
      });
      addNotification({
        message: `Frame deleted.`,
        type: "success",
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
    <div className="z-50 px-2 py-0.5 bg-white transition-opacity opacity-20 hover:shadow hover:opacity-85 w-13 rounded-full  relative flex flex-col justify-center items-center">
      <OptionButton
        label="Rotate"
        icon={MdOutlineRotateLeft}
        onClick={() =>
          setAlterationType(alterationType === "rotate" ? null : "rotate")
        }
        isActive={alterationType === "rotate"}
        color="blue"
      />
      <OptionButton
        label="Zoom In/Out"
        icon={HiOutlineMagnifyingGlass}
        onClick={() =>
          setAlterationType(alterationType === "zoom" ? null : "zoom")
        }
        isActive={alterationType === "zoom"}
        color="blue"
      />
      <OptionButton
        label="Flip Horizontal"
        icon={BsSymmetryVertical}
        onClick={() => onFlip("horizontal")}
        color="blue"
      />
      <OptionButton
        label="Flip Vertical"
        icon={BsSymmetryHorizontal}
        onClick={() => onFlip("vertical")}
        color="blue"
      />
      <OptionButton
        label={frame?.hidden ? "Show" : "Hide"}
        icon={frame?.hidden ? FaEyeSlash : FaEye}
        onClick={onShowHide}
        color="blue"
      />
      {frameIndex > 0 && (
        <OptionButton
          label={settings.ghost ? "Hide Ghost Frame" : "Show Ghost Frame"}
          icon={settings.ghost ? RiGhost2Fill : RiGhost2Line}
          onClick={onToggleGhost}
          color="purple"
        />
      )}
      <OptionButton
        label="Revert Changes"
        icon={RxReset}
        onClick={onReset}
        color="blue"
      />
      <OptionButton
        label="Delete"
        icon={MdDelete}
        onClick={onDelete}
        color="red"
      />
    </div>
  );
}

function OptionButton({
  onClick,
  color,
  icon,
  label,
  isActive,
}: {
  onClick: () => void;
  color: "blue" | "purple" | "red";
  icon: ElementType;
  label: string;
  isActive?: boolean;
}) {
  // tailwind hack to get dynamic colors to render
  // group-hover:bg-blue-600
  // group-hover:bg-purple-600
  // group-hover:bg-red-600
  // bg-red-600
  // bg-blue-600
  // bg-purple-600
  // text-red-600
  // text-blue-600
  // text-purple-600

  const Icon = icon;
  return (
    <button onClick={onClick} className="hover:text-white !p-0 relative group">
      <span
        className={cn(
          `whitespace-nowrap pointer-events-none text-${color}-600 bg-white rounded-full py-3 pl-4 pr-16 absolute top-1/2 right-0 -translate-y-1/2 group-hover:opacity-100 opacity-0 transition-opacity`
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          `rounded-full group-hover:bg-${color}-600 p-3 hover:text-white relative`,
          isActive && `bg-${color}-600 text-white`
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
    </button>
  );
}
