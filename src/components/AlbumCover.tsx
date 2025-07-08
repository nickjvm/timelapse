import useProject from "@/hooks/useProject"
import Image from "@/components/Image"
import { PiNoteBlank } from "react-icons/pi"

type Props = {
    projectId: string
}
export default function AlbumCover({ projectId }: Props) {
    const project = useProject(projectId)
    const frames = project?.frames || []
    const visibleFrames = frames.filter((f) => !f.hidden)

    if (!project) {
        return null
    }

    const coverFrame = visibleFrames[visibleFrames.length - 1]

    return (

        <>
            {visibleFrames.length > 0
                ? (
                    <Image
                        projectId={projectId}
                        className="rounded z-0 border border-neutral-400"
                        ratio="aspect-[calc(3/4)]"
                        id={coverFrame.id}
                        alt={coverFrame.caption || `${project.name} cover image`}
                    />
                )
                : (
                    <div className="w-full aspect-[calc(3/4)] bg-neutral-100 rounded z-0 border border-neutral-400 flex items-center justify-center text-neutral-300">
                        <PiNoteBlank className="w-12 h-12" />
                    </div>
                )}
            <div className="absolute top-[8px] left-[8px] w-full aspect-[calc(3/4)] border border-neutral-400 rounded -z-20 shadow"></div>
            <div className="absolute top-[4px] left-[4px] w-full aspect-[calc(3/4)] border border-neutral-400 rounded -z-10 bg-white"></div>
        </>
    )
}