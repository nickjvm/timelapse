import { ElementType } from "react";
import {
  BsGrid3X3,
  BsSymmetryHorizontal,
  BsSymmetryVertical,
} from "react-icons/bs";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { MdDelete, MdDownload, MdOutlineRotateLeft } from "react-icons/md";
import { RiGhost2Fill, RiGhost2Line } from "react-icons/ri";
import { RxReset } from "react-icons/rx";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { AppStore, useAppStore, useSettings } from "@/store";
import cn from "@/utils/cn";
import { flipImage } from "@/utils/flipImage";
import { useNotifications } from "@/providers/Notifications";
import { AlterationsTypes, useImageContext } from "@/components/Image";
import useDownloadImage from "@/hooks/useDownloadImage";

type Props = {
  onClick: (alterationType: AlterationsTypes) => void;
  alterationType: AlterationsTypes;
};
export default function EditFrameOptions({ onClick, alterationType }: Props) {
  const { project, frame, position, scale, rotation, containerRef } =
    useImageContext();
  const settings = useSettings();
  const { updateSettings, updateFrame, updateProject } = useAppStore();
  const { addNotification } = useNotifications();
  const frameIndex = project.frames.findIndex((f) => f.id === frame.id);
  const { downloadImage } = useDownloadImage(containerRef);

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

  const toggleSetting = (setting: keyof AppStore["settings"]) => () => {
    updateSettings({
      [setting]: !settings[setting],
    });
  };

  return (
    <div className="z-50 px-2 py-0.5 bg-white transition-opacity opacity-60 md:opacity-20 hover:shadow md:hover:opacity-85 md:w-13 w-10 rounded-full  relative flex flex-col justify-center items-center">
      <OptionButton
        label="Rotate"
        icon={MdOutlineRotateLeft}
        onClick={() => onClick(alterationType === "rotate" ? null : "rotate")}
        isActive={alterationType === "rotate"}
        color="blue"
      />
      <OptionButton
        label="Zoom In/Out"
        icon={HiOutlineMagnifyingGlass}
        onClick={() => onClick(alterationType === "zoom" ? null : "zoom")}
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
          label="Toggle frame ghost"
          icon={settings.ghost ? RiGhost2Fill : RiGhost2Line}
          isActive={settings.ghost}
          onClick={toggleSetting("ghost")}
          color="purple"
        />
      )}
      <OptionButton
        label="Toggle Grid"
        icon={BsGrid3X3}
        onClick={toggleSetting("grid")}
        isActive={settings.grid}
        color="blue"
      />
      <OptionButton
        label="Revert Changes"
        icon={RxReset}
        onClick={onReset}
        color="blue"
      />
      <OptionButton
        label="Download"
        icon={MdDownload}
        onClick={() => downloadImage(`frame-${frame.caption}-${frame.id}`)}
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
  // group-hover:bg-blue-600/75
  // group-hover:bg-purple-600/75
  // group-hover:bg-red-600/75
  // !bg-red-600
  // !bg-blue-600
  // !bg-purple-600
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
          `rounded-full bg-transparent group-hover:bg-${color}-600/75 p-2 md:p-3 hover:text-white relative transition-colors`,
          isActive && `!bg-${color}-600 text-white`
        )}
      >
        <Icon className="w-4 h-4 md:w-6 md:h-6" />
      </div>
    </button>
  );
}
