import { useCallback, useEffect, useRef, useState } from "react";
import { PiPlayFill } from "react-icons/pi";

import { useSettings, useAppStore, PLAYBACK_SPEEDS } from "@/store";
import Image from "@/components/Image";
import { BaseModal } from "@/components/modals/Base";
import DownloadVideo from "@/components/DownloadVideo";

import useFrames from "@/hooks/useFrames";
import cn from "@/utils/cn";

type Props = {
  onClose: () => void;
  projectId: string;
};

export default function Preview({ onClose, projectId }: Props) {
  const [autoplay, setAutoplay] = useState(false);
  const { playbackSpeed } = useSettings();
  const { updateSettings } = useAppStore();

  const { visibleFrames } = useFrames(projectId);

  const startingIndex = visibleFrames.findIndex((frame) => !frame.hidden) || 0;
  const [index, setIndex] = useState(startingIndex);
  const frame = visibleFrames[index];

  const timer = useRef<NodeJS.Timeout>(null);

  const goToNext = useCallback(() => {
    const findNextIndex = (currentIndex: number) => {
      const nextIndex =
        currentIndex + 1 >= (visibleFrames?.length || 0) ? 0 : currentIndex + 1;
      if (visibleFrames[nextIndex].hidden) {
        return findNextIndex(nextIndex);
      }
      return nextIndex;
    };
    setIndex(findNextIndex(index));
  }, [index, visibleFrames]);

  useEffect(() => {
    if (autoplay) {
      timer.current = setTimeout(
        goToNext,
        index === visibleFrames.length - 1
          ? 3000
          : PLAYBACK_SPEEDS[playbackSpeed]
      );
    } else {
      if (timer.current) {
        clearInterval(timer.current);
      }
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [autoplay, index, playbackSpeed, goToNext]);

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
  }, [onClose]);

  if (!visibleFrames.length) {
    return null;
  }

  return (
    <BaseModal open={true} onClose={onClose} variant="dark" className="flex">
      <div className="m-auto w-full max-w-md">
        <div className="flex items-center justify-center mb-2 px-4">
          <div>
            <DownloadVideo projectId={projectId} speed={playbackSpeed} />
          </div>
          <div className="ml-auto flex">
            {Object.keys(PLAYBACK_SPEEDS).map((value, i) => (
              <label
                key={value}
                className={cn(
                  "flex gap-2 items-center cursor-pointer border border-r-0 border-white px-2 !rounded-none",
                  value === playbackSpeed
                    ? "bg-white text-black"
                    : "text-white",
                  i === Object.keys(PLAYBACK_SPEEDS).length - 1 &&
                    "!rounded-r-full border-r",
                  i === 0 && "!rounded-l-full"
                )}
              >
                <input
                  type="radio"
                  name="speed"
                  value={value}
                  checked={value === playbackSpeed}
                  className="hidden"
                  onChange={(e) => {
                    setAutoplay(true);
                    updateSettings({
                      playbackSpeed: e.target
                        .value as keyof typeof PLAYBACK_SPEEDS,
                    });
                  }}
                />
                {value}
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAutoplay(!autoplay)}
          className="group relative "
        >
          <span className="z-10 absolute top-1/2 left-1/2 -translate-1/2 group-hover:opacity-100 opacity-50 transition-opacity">
            {!autoplay && <PiPlayFill className="text-white w-20 h-20" />}
          </span>
          <Image
            projectId={projectId}
            id={frame.id}
            ratio="aspect-[calc(3/4)]"
            className="w-full"
            alt={frame.caption || ""}
          />
        </button>
        <p className="text-center text-white text-sm md:text-xl font-bold mt-2 mb-2">
          {frame.caption || "\u00A0"}
        </p>
        <input
          type="range"
          min={startingIndex}
          max={visibleFrames.length - 1}
          step="1"
          value={index}
          className="w-full"
          onChange={(e) => {
            setIndex(Number(e.target.value));
            setAutoplay(false);
            if (timer.current) {
              clearInterval(timer.current);
            }
          }}
        />
      </div>
    </BaseModal>
  );
}
