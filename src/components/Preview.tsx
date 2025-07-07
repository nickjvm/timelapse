import { AppState, useProjects, useSettings, useAppStore, PLAYBACK_SPEEDS } from "@/store";
// import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "./Image";
import { PiPauseFill, PiPlayFill } from "react-icons/pi";

type Props = {
  onClose: () => void
}

export default function Preview({ onClose }: Props) {
  const [autoplay, setAutoplay] = useState(true)
  const { playbackSpeed } = useSettings()
  const { updateSettings } = useAppStore()
  const { id } = useParams();
  const projects = useProjects();
  const project = projects.find((p) => p.id === id) as AppState["projects"][0];
  const startingIndex = project.frames.findIndex((frame) => !frame.hidden)
  const [index, setIndex] = useState(startingIndex);
  const frame = project.frames[index];

  const visibleFrames = project.frames.filter((frame) => !frame.hidden)
  const timer = useRef<NodeJS.Timeout>(null);

  const goToNext = useCallback(() => {
    const findNextIndex = () => {
      const nextIndex = index + 1 >= project?.frames.length ? 0 : index + 1
      if (project?.frames[nextIndex].hidden) {
        return findNextIndex()
      }
      return nextIndex
    }
    setIndex(findNextIndex())
  }, [index, project])

  useEffect(() => {
    if (autoplay) {
      timer.current = setInterval(goToNext, PLAYBACK_SPEEDS[playbackSpeed])
    } else {
      if (timer.current) {
        clearInterval(timer.current)
      }
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [autoplay, goToNext, playbackSpeed])

  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeypress)
    return () => {
      document.removeEventListener('keydown', handleKeypress)
    }
  }, [onClose])
  return (
    <div
      className="fixed flex top-0 left-0 right-0 bottom-0 bg-black/90 z-50"
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          onClose()
        }
      }}
    >
      <div className="m-auto w-full max-w-md">
        <div className="flex items-center justify-center mb-2">
          <div>
            {autoplay
              ? <button className="text-white flex gap-2 items-center" onClick={() => setAutoplay(false)}><PiPauseFill className="text-white w-5 h-5" /> {'Pause'}</button>
              : <button className="text-white flex gap-2 items-center" onClick={() => setAutoplay(true)}><PiPlayFill className="text-white w-5 h-5" /> {'Play'}</button>
            }
          </div>
          <div className="ml-auto flex gap-2">
            {Object.keys(PLAYBACK_SPEEDS).map((value) => (
              <label key={value} className={`flex gap-2 items-center cursor-pointer border rounded px-2 ${value === playbackSpeed ? 'bg-white text-black' : 'text-white'}`}>
                <input
                  type="radio"
                  name="speed"
                  value={value}
                  checked={value === playbackSpeed}
                  className="hidden"
                  onChange={(e) => {
                    setAutoplay(true);
                    updateSettings({ playbackSpeed: e.target.value as keyof typeof PLAYBACK_SPEEDS })
                  }}
                />
                {value}
              </label>
            ))}
          </div>
        </div>
        <Image projectId={project.id} id={frame.id} ratio="aspect-[calc(3/4)]" className="w-full" alt="" />
        <p className="text-center text-white text-xl font-bold mt-2">{frame.caption || "\u00A0"}</p>
        <input type="range" min={startingIndex} max={visibleFrames.length - 1} step="1" value={index} onChange={(e) => {
          setIndex(Number(e.target.value))
          setAutoplay(false)
          if (timer.current) {
            clearInterval(timer.current)
          }
        }} className="w-full" />

      </div>
      {/* <div className="aspect-[calc(3/4)] max-w-3xs m-auto relative overflow-hidden shrink-0">
        <div
                    className="absolute w-full h-full z-20 pointer-events-none "
                    style={{
                      transform: `scale(${frame.scale})`,
                      left: frame.position.x,
                      top: frame.position.y,
                    }}
                  >
                    <Image
                      src={frame.image}
                      alt="Selected"
                      fill
                      className={`object-scale-down select-none h-auto`}
                    />
                  </div>
      </div> */}
      {/* <button className="bg-white text-black" onClick={goToNext}>Next Slide</button> */}
    </div>
  );
}
