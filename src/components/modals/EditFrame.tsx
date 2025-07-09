import { useEffect } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

import useFrames from "@/hooks/useFrames";
import Image from "@/components/Image";
import useFrame from "@/hooks/useFrame";

import { BaseModal } from "@/components/modals/Base";

type Props = {
  onClose: () => void;
  onChange: (frameId: string) => void;
  projectId: string;
  frameId: string;
};

export default function EditFrameModal({
  onClose,
  onChange,
  projectId,
  frameId,
}: Props) {
  const { frames } = useFrames(projectId);

  const frame = useFrame(projectId, frameId);
  const frameIndex = frames.findIndex((frame) => frame.id === frameId);
  const prevFrameIndex = frameIndex - 1;
  const nextFrameIndex = frameIndex + 1;

  useEffect(() => {
    if (!frame) {
      onClose();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [frame]);

  const handleChange = (direction: "prev" | "next") => {
    return () =>
      onChange(
        direction === "prev"
          ? frames[prevFrameIndex].id
          : frames[nextFrameIndex].id
      );
  };

  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        return;
      }
      if (e.key === "ArrowLeft") {
        if (prevFrameIndex >= 0) {
          onChange(frames[prevFrameIndex].id);
        }
      }
      if (e.key === "ArrowRight") {
        if (nextFrameIndex < frames.length) {
          onChange(frames[nextFrameIndex].id);
        }
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeypress);
    return () => {
      document.removeEventListener("keydown", handleKeypress);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [frames, nextFrameIndex, prevFrameIndex]);

  return (
    <BaseModal open={true} onClose={onClose} variant="dark" className="flex">
      <div className="absolute bottom-2 md:bottom-auto md:top-1/2 left-0 right-0 md:-translate-y-1/2 flex items-center px-2 pointer-events-none text-black">
        {prevFrameIndex >= 0 && (
          <button
            className="bg-white/80 md:bg-white/50 h-12 !px-1 hover:bg-white pointer-events-auto mr-auto"
            onClick={handleChange("prev")}
          >
            <MdKeyboardArrowLeft className="h-8 w-8" />
          </button>
        )}
        {nextFrameIndex < frames.length && (
          <button
            className="bg-white/80 md:bg-white/50 h-12 !px-1 hover:bg-white pointer-events-auto ml-auto"
            onClick={handleChange("next")}
          >
            <MdKeyboardArrowRight className="h-8 w-8" />
          </button>
        )}
      </div>
      <div className="my-auto relative w-full max-w-xl mx-auto text-black">
        <Image
          key={frameId}
          id={frameId}
          ratio="aspect-[calc(3/4)]"
          className="m-auto w-full lg:w-xl my-auto"
          projectId={projectId}
          alt={frame?.caption || `${projectId} frame ${frameIndex + 1}`}
          editing
        />
      </div>
    </BaseModal>
  );
}
