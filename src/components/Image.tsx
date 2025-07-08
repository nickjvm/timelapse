/* eslint-disable @next/next/no-img-element */
'use client'

import { useAppStore, useSettings } from "@/store";
import {
    HTMLMotionProps,
    motion,
    useAnimationControls,
    useMotionValue,
    useMotionValueEvent,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HiMiniMagnifyingGlassMinus, HiMiniMagnifyingGlassPlus } from "react-icons/hi2";
import { MdOutlineRotateLeft, MdOutlineRotateRight } from "react-icons/md";
import EditFrameMenu from "./EditFrameMenu";
import { flipImage } from "@/utils/flipImage";
import cn from "@/utils/cn";
import { RxText } from "react-icons/rx";
import useFrame from "@/hooks/useFrame";

type Props = {
    projectId: string
    id: string
    ratio?: string
    onReposition?: (x: number, y: number, scale: number, rotation: number) => void
    onDelete?: (id: string) => void
    onCaptionChange?: (caption: string) => void
    onReset?: (id: string) => void
    alt: string
    editing?: boolean
} & HTMLMotionProps<'div'>

export default function Image({
    projectId,
    id,
    ratio,
    className,
    editing,
    onReposition,
    onCaptionChange,
    onReset,
}: Props) {
    const [alterationType, setAlterationType] = useState<'rotate' | 'zoom' | 'caption' | null>(null);
    const { projects, updateFrame } = useAppStore()
    const settings = useSettings()

    const project = projects.find((project) => project.id === projectId)!
    const frame = useFrame(projectId, id)

    const prevFrameIndex = project.frames.findIndex((frame) => frame.id === id) - 1

    const controls = useAnimationControls()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const scale = useMotionValue(1)
    const rotation = useMotionValue(0)

    const imageRef = useRef<HTMLImageElement>(null)
    const [constraints, setConstraints] = useState({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    })

    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (containerRef.current) {
            setConstraints({
                top: -containerRef.current.offsetHeight / 2,
                left: -containerRef.current.offsetWidth / 2,
                bottom: containerRef.current.offsetHeight / 2,
                right: containerRef.current.offsetWidth / 2,
            })
        }
    }, [])

    const getPositionPercentages = (pixelX: number, pixelY: number) => {
        if (!containerRef.current) return { xPercent: 0, yPercent: 0 };

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Calculate percentage (0-1) where 0.5 is centered
        const xPercent = (pixelX / containerWidth);
        const yPercent = (pixelY / containerHeight);

        return { xPercent, yPercent };
    };

    // Convert percentage back to pixels for rendering
    const getPixelPosition = (xPercent: number, yPercent: number) => {
        if (!containerRef.current) return { x: 0, y: 0 };

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        const x = (xPercent) * containerWidth;
        const y = (yPercent) * containerHeight;

        return { x, y };
    };

    useEffect(() => {
        if (!editing || !frame) {
            return
        }
        x.set(getPixelPosition(frame.position.x, frame.position.y).x)
        y.set(getPixelPosition(frame.position.x, frame.position.y).y)
        scale.set(frame.scale)
        rotation.set(frame.rotation || 0)

        if (containerRef.current) {
            setConstraints({
                top: -containerRef.current.offsetHeight / 2,
                left: -containerRef.current.offsetWidth / 2,
                bottom: containerRef.current.offsetHeight / 2,
                right: containerRef.current.offsetWidth / 2,
            })
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [editing, frame])

    const handleReposition = () => {
        const pixelX = x.get();
        const pixelY = y.get();
        const { xPercent, yPercent } = getPositionPercentages(pixelX, pixelY);
        onReposition?.(xPercent, yPercent, scale.get(), rotation.get());
    }

    useMotionValueEvent(x, "change", handleReposition)
    useMotionValueEvent(y, "change", handleReposition)
    useMotionValueEvent(scale, "change", handleReposition)
    useMotionValueEvent(rotation, "change", handleReposition)

    async function handleImageFlip(direction: 'horizontal' | 'vertical') {
        if (!project || !editing || !frame) {
            return;
        }

        const flippedImage = await flipImage(frame.image, direction);

        updateFrame(project.id, id, {
            image: flippedImage,
        });
    }

    if (!frame) {
        return null
    }

    return (
        <>
            <div className={cn(ratio, 'overflow-hidden bg-neutral-200 relative', className)} ref={containerRef}>
                {editing && (
                    <motion.div
                        drag
                        style={{ x, y, scale, rotate: rotation }}
                        dragTransition={{
                            bounceStiffness: 1000,
                        }}
                        dragMomentum={false}
                        dragElastic={0.05}
                        animate={controls}
                        dragConstraints={constraints}>
                        <img ref={imageRef} src={frame.image} alt="" className={`w-full h-auto pointer-events-none`} />
                    </motion.div>
                )}
                {!editing && (
                    <img
                        src={frame.image}
                        alt=""
                        style={{
                            transform: `scale(${frame.scale}) rotate(${frame.rotation}deg)`,
                            left: `${frame.position.x * 100}%`,
                            top: `${frame.position.y * 100}%`,
                        }}
                        className={`w-full h-auto pointer-events-none relative origin-center`}
                    />
                )}
                {editing && settings.ghost && prevFrameIndex >= 0 && <Image projectId={project.id} id={project.frames[prevFrameIndex].id} ratio="aspect-[calc(3/4)]" alt="" className="w-full absolute top-0 opacity-30 pointer-events-none left-1/2 -translate-x-1/2" />}
            </div>
            {editing && <div className="absolute right-2 top-2">
                <EditFrameMenu
                    setAlterationType={v => {
                        if (alterationType === v) {
                            setAlterationType(null)
                        } else {
                            setAlterationType(v)
                        }
                    }}
                    handleImageFlip={handleImageFlip}
                    projectId={project.id}
                    frameId={id}
                    handleReset={() => {
                        onReset?.(id)
                        x.set(0)
                        y.set(0)
                        scale.set(1)
                        rotation.set(0)
                    }}
                />
            </div>}
            <div>
                {editing && (alterationType === 'caption' || (!alterationType && frame.caption)) && (
                    <label>
                        <span className="sr-only">Add a caption</span>
                        <input
                            placeholder="Add a caption..."
                            type="text"
                            autoFocus={!frame.caption}
                            defaultValue={frame.caption || ''}
                            onBlur={(e) => {
                                onCaptionChange?.(e.target.value)
                                setAlterationType(null)
                            }}
                            className="absolute bottom-2 left-2 right-2 bg-black/50 text-white p-2 px-4 text-lg rounded-full text-center"
                        />
                    </label>
                )}
                {editing && !alterationType && !frame.caption && (
                    <button
                        onClick={() => setAlterationType('caption')}
                        className="absolute bottom-2 left-2  bg-black/50 text-white !p-2 text-lg !rounded-full text-center"
                    >
                        <RxText className="w-7 h-7" />
                    </button>
                )}
            </div>
            {editing && (
                <>
                    {alterationType === 'zoom' && (
                        <div className="flex items-center gap-4 mt-3 absolute bottom-2 left-2 right-2 bg-black/75 rounded-full">
                            <button onClick={() => scale.set(scale.get() - .1)} className="!rounded-l-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors">
                                <HiMiniMagnifyingGlassMinus className="w-8 h-8" />
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
                            <button onClick={() => scale.set(scale.get() + .1)} className="!rounded-r-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors">
                                <HiMiniMagnifyingGlassPlus className="w-8 h-8" />
                            </button>
                        </div>
                    )}
                    {alterationType === 'rotate' && (
                        <div className="flex items-center gap-4 mt-3 absolute bottom-2 left-2 right-2 bg-black/75 rounded-full">
                            <button onClick={() => rotation.set(rotation.get() - 1)} className="!rounded-l-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors">
                                <MdOutlineRotateLeft className="w-8 h-8" />
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
                            <button onClick={() => rotation.set(rotation.get() + 1)} className="!rounded-r-full p-1 cursor-pointer text-white hover:text-black hover:bg-white/75 transition-colors">
                                <MdOutlineRotateRight className="w-8 h-8" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    )
}