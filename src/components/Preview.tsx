import { AppState, useProjects } from "@/store";
// import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "./Image";

type Props = {
  onClose: () => void
}
export default function Preview({ onClose }: Props) {
  const [index, setIndex] = useState(0);
  const { id } = useParams();
  const projects = useProjects();
  const project = projects.find((p) => p.id === id) as AppState["projects"][0];
  const frame = project.frames[index];

  const timer = useRef<NodeJS.Timeout>(null);

  const goToNext = () => {
    setIndex(index + 1 >= project?.frames.length ? 0 : index + 1)
  }

  useEffect(() => {
    timer.current = setInterval(() => {
      goToNext()
    }, 1000)

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [index])
  return (
    <div
      className="fixed flex top-0 left-0 right-0 bottom-0 bg-black/90 z-30"
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          onClose()
        }
      }}
    >
      <div className="m-auto w-full max-w-md">
        <Image id={frame.id} ratio="aspect-[calc(3/4)]" className="w-full" alt="" />
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
