"use client";
import { motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MdDragIndicator } from "react-icons/md";

import FrameImage from "@/components/Image";

export default function Compare({ projectId, a, b, onClose }: { projectId: string, a: string, b: string, onClose: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null)

    const x = useMotionValue(100)
    const [mode, setMode] = useState<'side-by-side' | 'overlaid'>('side-by-side')
    const [compareWidth, setCompareWidth] = useState(x.get())

    useEffect(() => {
        const unsubscribe = x.on('change', setCompareWidth)
        return () => unsubscribe()
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [])

    useEffect(() => {
        if (mode === 'overlaid' && containerRef.current) {
            x.set(containerRef.current.offsetWidth / 2)
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [mode])

    return (
        <div
            onClick={(e) => {
                if (e.currentTarget === e.target) {
                    onClose()
                }
            }}
            className="fixed w-full h-full top-0 left-0 right-0 bottom-0 bg-black/90 z-50 space-y-3 flex items-center flex-col justify-center">
            <div className="flex items-center justify-center space-x-2">
                <button className={` text-black px-2 py-1 rounded border border-white ${mode === 'side-by-side' ? 'bg-white' : 'text-white'}`} onClick={() => setMode('side-by-side')}>Side by Side</button>
                <button className={` text-black px-2 py-1 rounded border border-white ${mode === 'overlaid' ? 'bg-white' : 'text-white'}`} onClick={() => setMode('overlaid')}>Overlaid</button>
            </div>
            <div className="flex items-center justify-center">
                {mode === 'overlaid' && (
                    <div ref={containerRef} className="relative items-center justify-center aspect-[calc(3/4)]">
                        <FrameImage projectId={projectId} id={b} ratio="aspect-[calc(3/4)]" className="w-md" alt="" />
                        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: compareWidth + 'px' }}>
                            <FrameImage projectId={projectId} id={a} ratio="aspect-[calc(3/4)]" className="w-md" alt="" />
                        </div>
                        <motion.div
                            drag
                            style={{ x }}
                            dragMomentum={false}
                            dragElastic={0}
                            dragConstraints={containerRef}
                            className="p-0 bg-neutral-600 absolute top-0 bottom-0 cursor-ew-resize shadow-lg flex items-center justify-center">
                            <MdDragIndicator className="text-neutral-400 w-3 h-3" />
                        </motion.div>
                    </div>
                )}
                {mode === 'side-by-side' && (
                    <div className="relative items-center justify-center flex gap-2">
                        <FrameImage projectId={projectId} id={a} ratio="aspect-[calc(3/4)]" className="w-md" alt="" />
                        <FrameImage projectId={projectId} id={b} ratio="aspect-[calc(3/4)]" className="w-md" alt="" />
                    </div>
                )}
            </div>
        </div >
    );
}
