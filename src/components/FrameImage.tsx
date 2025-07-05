import NextImage from "next/image";
import { Frame } from "@/store";
import { useEffect, useRef, useState } from "react";

type Props = {
    frame: Frame
} & React.HTMLAttributes<HTMLDivElement>

export default function FrameImage({
    frame,
    ...props
}: Props) {
    const [renderedScale, setRenderedScale] = useState(1)
    const imageRef = useRef<HTMLImageElement>(null)
    useEffect(() => {
        const img = imageRef.current
        if (!img) {
            return
        }
        const scale = img.offsetWidth / img.naturalWidth
        setRenderedScale(scale * frame.scale)
    }, [frame.image, frame.scale])

    return (
        <div className="aspect-[calc(3/4)] overflow-hidden bg-neutral-200 relative" {...props}>
            <NextImage
                data-scale={renderedScale}
                data-store-x={frame.position.x}
                data-store-y={frame.position.y}
                data-x={frame.position.x * renderedScale}
                data-y={frame.position.y * renderedScale}
                ref={imageRef}
                src={frame.image}
                alt="Selected"
                width={400}
                height={400}
                style={{
                    left: frame.position.x * renderedScale,
                    top: frame.position.y * renderedScale,
                    transform: `scale(${frame.scale})`,
                }}
                draggable={false}
                className={`relative touch-none select-none object-scale-down`}
            />
        </div>
    )
}