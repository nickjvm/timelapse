/* eslint-disable @next/next/no-img-element */
'use client'

import { useAppStore } from "@/store";
import {
    HTMLMotionProps,
    motion,
    useAnimationControls,
    useMotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HiMiniMagnifyingGlassMinus, HiMiniMagnifyingGlassPlus } from "react-icons/hi2";
import { MdOutlineRotateLeft, MdOutlineRotateRight } from "react-icons/md";

type Props = {
    projectId: string
    id: string
    ratio?: string
    onReposition?: (x: number, y: number, scale: number, rotation: number) => void
    alt: string
    editing?: boolean
} & HTMLMotionProps<'div'>

export default function Image({ projectId, id, ratio, className, editing, onReposition }: Props) {
    const { projects } = useAppStore()
    const project = projects.find((project) => project.id === projectId)!
    const frame = project.frames.find((frame) => frame.id === id)!

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

    const positionRef = useRef(frame.position);
    useEffect(() => {
        if (!editing) {
            return
        }
        x.set(getPixelPosition(frame.position.x, frame.position.y).x)
        y.set(getPixelPosition(frame.position.x, frame.position.y).y)
        scale.set(frame.scale)
        rotation.set(frame.rotation || 0)

        positionRef.current = frame.position

        if (containerRef.current) {
            setConstraints({
                top: -containerRef.current.offsetHeight / 2,
                left: -containerRef.current.offsetWidth / 2,
                bottom: containerRef.current.offsetHeight / 2,
                right: containerRef.current.offsetWidth / 2,
            })
        }
        // }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [editing])

    const handleReposition = () => {
        const pixelX = x.get();
        const pixelY = y.get();
        const { xPercent, yPercent } = getPositionPercentages(pixelX, pixelY);
        onReposition?.(xPercent, yPercent, scale.get(), rotation.get());
    }

    useEffect(() => {
        if (!editing) {
            x.destroy()
            y.destroy()
            scale.destroy()
            rotation.destroy()
            return
        }
        x.on('change', handleReposition)
        y.on('change', handleReposition)
        scale.on('change', handleReposition)
        rotation.on('change', handleReposition)
    }, [editing])

    // useEffect(() => {
    //     if (!containerRef.current) {
    //         return
    //     }
    //     // Convert percentage back to pixels when rendering
    //     const { x: pixelX, y: pixelY } = getPixelPosition(state.x, state.y);
    //     console.log({ pixelX, pixelY })
    // }, [state])

    // if (!state) {
    //     return null
    // }

    return (
        <div>
            <div className={`${ratio} ${className} overflow-hidden bg-neutral-200`} ref={containerRef}>
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
            </div>
            {editing && (
                <>
                    <div className="flex items-center gap-4 mt-3">
                        <button onClick={() => scale.set(scale.get() - .1)} className="rounded p-1 cursor-pointer text-white hover:text-black hover:bg-white transition-colors">
                            <HiMiniMagnifyingGlassMinus className="w-8 h-8" />
                        </button>
                        <input
                            type="range"
                            min=".5"
                            max="3"
                            step=".01"
                            value={scale.get()}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            onChange={(e) => scale.set(parseFloat(e.target.value))}
                        />
                        <button onClick={() => scale.set(scale.get() + .1)} className="rounded p-1 cursor-pointer text-white hover:text-black hover:bg-white transition-colors">
                            <HiMiniMagnifyingGlassPlus className="w-8 h-8" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                        <button onClick={() => rotation.set(rotation.get() - 1)} className="rounded p-1 cursor-pointer text-white hover:text-black hover:bg-white transition-colors">
                            <MdOutlineRotateLeft className="w-8 h-8" />
                        </button>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            step="1"
                            value={rotation.get()}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            onChange={(e) => rotation.set(parseFloat(e.target.value))}
                        />
                        <button onClick={() => rotation.set(rotation.get() + 1)} className="rounded p-1 cursor-pointer text-white hover:text-black hover:bg-white transition-colors">
                            <MdOutlineRotateRight className="w-8 h-8" />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}