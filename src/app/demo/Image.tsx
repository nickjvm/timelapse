/* eslint-disable @next/next/no-img-element */
'use client'

import {
    HTMLMotionProps,
    motion,
    useAnimationControls,
    useMotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
    src: string
    ratio?: string
    onReposition: (x: number, y: number, scale: number, image: HTMLImageElement | null) => void
    alt: string
    state: {
        x: number
        y: number
        scale: number
    } | null
    editing?: boolean
} & HTMLMotionProps<'div'>

export default function Image({ src, ratio, className, editing, state, onReposition }: Props) {
    const controls = useAnimationControls()
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const scale = useMotionValue(1)

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

    // Convert pixel position to percentage based on container size
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

        // Convert from 0-1 range to pixel offset from center
        const x = (xPercent) * containerWidth;
        const y = (yPercent) * containerHeight;

        return { x, y };
    };

    const stateRef = useRef(state);
    useEffect(() => {
        if (!stateRef.current && state) {
            x.set(getPixelPosition(state.x, state.y).x)
            y.set(getPixelPosition(state.x, state.y).y)
            scale.set(state.scale)

            stateRef.current = state

            if (containerRef.current) {
                setConstraints({
                    top: -containerRef.current.offsetHeight / 2,
                    left: -containerRef.current.offsetWidth / 2,
                    bottom: containerRef.current.offsetHeight / 2,
                    right: containerRef.current.offsetWidth / 2,
                })
            }
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [state])

    const handleReposition = () => {
        const pixelX = x.get();
        const pixelY = y.get();
        const { xPercent, yPercent } = getPositionPercentages(pixelX, pixelY);

        // Pass both pixel and percentage values to parent
        onReposition(xPercent, yPercent, scale.get(), imageRef.current);
    }

    x.on('change', handleReposition)
    y.on('change', handleReposition)
    scale.on('change', handleReposition)

    // useEffect(() => {
    //     if (!containerRef.current) {
    //         return
    //     }
    //     // Convert percentage back to pixels when rendering
    //     const { x: pixelX, y: pixelY } = getPixelPosition(state.x, state.y);
    //     console.log({ pixelX, pixelY })
    // }, [state])

    if (!state) {
        return null
    }
    return (
        <div>
            <div className={`${ratio} ${className} overflow-hidden bg-neutral-200`} ref={containerRef}>
                {editing && (
                    <motion.div
                        drag
                        style={{ x, y, scale }}
                        dragTransition={{
                            bounceStiffness: 1000,
                        }}
                        dragMomentum={false}
                        dragElastic={0.05}
                        animate={controls}
                        dragConstraints={constraints}>
                        { }
                        <img ref={imageRef} src={src} alt="" className={`w-full h-auto pointer-events-none`} />
                    </motion.div>
                )}
                {!editing && (
                    <img
                        src={src}
                        alt=""
                        style={{
                            transform: `scale(${state.scale})`,
                            left: `${state.x * 100}%`,
                            top: `${state.y * 100}%`,
                        }}
                        className={`w-full h-auto pointer-events-none relative origin-center`}
                    />
                )}
            </div>
            {editing && (
                <input
                    type="range"
                    min=".5"
                    max="3"
                    step=".1"
                    value={scale.get()}
                    onChange={(e) => scale.set(parseFloat(e.target.value))}
                />
            )}
        </div>
    )
}