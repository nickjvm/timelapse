"use client";

import { useEffect, useState } from "react";
import Image from "./Image";

export default function Page() {
    const [position, setPosition] = useState<{ x: number, y: number, scale: number } | null>(null);

    useEffect(() => {
        const position = localStorage.getItem("position");
        if (position) {
            setPosition(JSON.parse(position));
        } else {
            setPosition({
                x: 0,
                y: 0,
                scale: 1
            })
        }
    }, []);

    const onReposition = (x: number, y: number, scale: number) => {
        localStorage.setItem("position", JSON.stringify({ x, y, scale }));
        setPosition({
            x,
            y,
            scale
        });
    };

    return (
        <div className="flex gap-4 items-start">
            <Image
                className="w-3xs"
                src="./IMG_6061.png"
                ratio="aspect-[calc(3/4)]"
                state={position}
                onReposition={onReposition}
                alt=""
            />
            <Image
                editing
                className="w-xl"
                src="./IMG_6061.png"
                ratio="aspect-[calc(3/4)]"
                state={position}
                onReposition={onReposition}
                alt=""
            />
            <Image
                className="w-3xl"
                src="./IMG_6061.png"
                ratio="aspect-[calc(3/4)]"
                state={position}
                onReposition={onReposition}
                alt=""
            />
        </div>
    );
}
