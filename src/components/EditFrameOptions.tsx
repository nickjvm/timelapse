import { BsSymmetryHorizontal, BsSymmetryVertical } from "react-icons/bs";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { MdDelete, MdOutlineRotateLeft } from "react-icons/md";
import { RiGhost2Fill, RiGhost2Line } from "react-icons/ri";
import { RxReset } from "react-icons/rx";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

import { useAppStore, useSettings } from "@/store";
import useFrame from "@/hooks/useFrame";
import cn from "@/utils/cn";

type Props = {
  alterationType: "rotate" | "zoom" | "caption" | null;
  setAlterationType: (alterationType: "rotate" | "zoom" | null) => void;
  handleImageFlip: (direction: "horizontal" | "vertical") => void;
  handleReset: () => void;
  projectId: string;
  frameId: string;
};

export default function EditFrameOptions({
  alterationType,
  setAlterationType,
  handleImageFlip,
  handleReset,
  projectId,
  frameId,
}: Props) {
  const settings = useSettings();
  const frame = useFrame(projectId, frameId);
  const { updateSettings, deleteFrame, updateFrame } = useAppStore();

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
        onClick={(e) => {
          e.preventDefault();
          handleImageFlip("horizontal");
        }}
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        <BsSymmetryVertical className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          handleImageFlip("vertical");
        }}
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        <BsSymmetryHorizontal className="w-6 h-6" />
      </button>
      <button
        onClick={() => updateSettings({ ghost: !settings.ghost })}
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
        onClick={handleReset}
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        <RxReset className="w-6 h-6" />
      </button>
      <button
        onClick={() =>
          updateFrame(projectId, frameId, { hidden: !frame?.hidden })
        }
        className="hover:text-white !rounded-full !p-3 hover:bg-blue-600"
      >
        {frame?.hidden ? (
          <FaEye className="w-6 h-6" />
        ) : (
          <FaEyeSlash className="w-6 h-6" />
        )}
      </button>
      <button
        onClick={() => deleteFrame(projectId, frameId)}
        className="hover:text-white !rounded-full !p-3 hover:bg-red-600"
      >
        <MdDelete className="w-6 h-6" />
      </button>
    </div>
  );
}
