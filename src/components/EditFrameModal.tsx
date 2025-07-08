import { RiCloseLargeLine } from "react-icons/ri"
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md"
import useFrames from "@/hooks/useFrames"
import Image from "@/components/Image"
import { useAppStore } from "@/store"
import useFrame from "@/hooks/useFrame"
import { useEffect } from "react"

type Props = {
    onClose: () => void
    onChange: (frameId: string) => void
    projectId: string
    frameId: string
}
export default function EditFrameModal({ onClose, onChange, projectId, frameId }: Props) {
    const { updateProject } = useAppStore()
    const { frames } = useFrames(projectId)

    const frame = useFrame(projectId, frameId)
    const frameIndex = frames.findIndex((frame) => frame.id === frameId)
    const prevFrameIndex = frameIndex - 1
    const nextFrameIndex = frameIndex + 1

    const handleChange = (direction: 'prev' | 'next') => {
        return () => onChange(direction === 'prev' ? frames[prevFrameIndex].id : frames[nextFrameIndex].id)
    }

    const handleReposition = (x: number, y: number, scale: number, rotation: number) => {
        updateProject(projectId, {
            frames: frames.map((frame) => {
                if (frame.id === frameId) {
                    return {
                        ...frame,
                        position: {
                            x,
                            y,
                        },
                        scale,
                        rotation,
                    };
                }
                return frame;
            }),
        });
    }

    const handleFrameDelete = (id: string) => {
        if (!projectId) {
            return
        }
        if (confirm('Are you sure you want to delete this frame?')) {
            updateProject(projectId, {
                frames: frames.filter((frame) => frame.id !== id),
            });
            onClose()
        }
    }

    const handleCaptionChange = (caption: string) => {
        updateProject(projectId, {
            frames: frames.map((frame) => {
                if (frame.id === frameId) {
                    return {
                        ...frame,
                        caption,
                    };
                }
                return frame;
            }),
        });
    }

    const handleReset = () => {
        updateProject(projectId, {
            frames: frames.map((frame) => {
                if (frame.id === frameId) {
                    return {
                        ...frame,
                        position: {
                            x: 0,
                            y: 0,
                        },
                        scale: 1,
                        rotation: 0,
                    };
                }
                return frame;
            }),
        });
    }

    useEffect(() => {
        const handleKeypress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                if (prevFrameIndex >= 0) {
                    onChange(frames[prevFrameIndex].id)
                }
            }
            if (e.key === 'ArrowRight') {
                if (nextFrameIndex < frames.length) {
                    onChange(frames[nextFrameIndex].id)
                }
            }
            if (e.key === 'Escape') {
                onClose()
            }
        }
        document.addEventListener('keydown', handleKeypress)
        return () => {
            document.removeEventListener('keydown', handleKeypress)
        }
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [frames, nextFrameIndex, prevFrameIndex])

    return (
        <div className="fixed flex items-center justify-center w-full h-full top-0 left-0 right-0 bottom-0 bg-black/90 z-50">
            <button
                className="absolute top-2 right-2 text-white hover:bg-white hover:text-black transform-colors !p-2"
                onClick={onClose}
            >
                <RiCloseLargeLine className="w-5 h-5" />
            </button>
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center px-2 pointer-events-none">
                {prevFrameIndex >= 0 && (
                    <button
                        className="bg-white/50 h-12 !px-1 hover:bg-white pointer-events-auto mr-auto"
                        onClick={handleChange('prev')}
                    >
                        <MdKeyboardArrowLeft className="h-8 w-8" />
                    </button>
                )}
                {nextFrameIndex < frames.length && (
                    <button
                        className="bg-white/50 h-12 !px-1 hover:bg-white pointer-events-auto ml-auto"
                        onClick={handleChange('next')}
                    >
                        <MdKeyboardArrowRight className="h-8 w-8" />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-9 gap-8 max-w-3xl mx-auto">
                <div className="relative col-span-9">
                    <Image
                        key={frameId}
                        id={frameId}
                        ratio="aspect-[calc(3/4)]"
                        className="m-auto w-xl my-auto"
                        onReposition={handleReposition}
                        onDelete={handleFrameDelete}
                        onCaptionChange={handleCaptionChange}
                        onReset={handleReset}
                        projectId={projectId}
                        alt={frame?.caption || `${projectId} frame ${frameIndex + 1}`}
                        editing
                    />
                </div>
            </div>
        </div>
    )
}