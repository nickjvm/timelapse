"use client";

import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import { motion, useAnimationControls, useMotionValue } from "motion/react";

export default function Frame({ image }: { image: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const controls = useAnimationControls();

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [constraints, setConstraints] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });

  const onScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    controls.set({ scale: newScale });
    calculateConstraints(newScale);
  };

  const calculateConstraints = (newScale: number) => {
    if (imageRef.current && containerRef.current) {
      const internalScale =
        imageRef.current.offsetWidth / imageRef.current.naturalWidth;

      const newWidth = imageRef.current.naturalWidth * internalScale * newScale;
      const newHeight =
        imageRef.current.naturalHeight * internalScale * newScale;

      const maxY =
        newHeight > containerRef.current.offsetHeight
          ? (newHeight - containerRef.current.offsetHeight) / 2
          : (containerRef.current.offsetHeight - newHeight) / 2;
      const maxX =
        newWidth > containerRef.current.offsetWidth
          ? (newWidth - containerRef.current.offsetWidth) / 2
          : (containerRef.current.offsetWidth - newWidth) / 2;

      if (x.get() > maxX) {
        x.set(maxX);
      } else if (x.get() < -maxX) {
        x.set(-maxX);
      }

      if (y.get() > maxY) {
        y.set(maxY);
      } else if (y.get() < -maxY) {
        y.set(-maxY);
      }

      setConstraints({
        top: -maxY,
        left: -maxX,
        bottom: maxY,
        right: maxX,
      });
    }
  };

  return (
    <div className="block w-3xs shrink-0">
      <div
        ref={containerRef}
        className="aspect-[calc(3/4)] max-w-3xs border border-neutral-200 shadow overflow-hidden bg-neutral-200"
      >
        <motion.div
          drag
          style={{ x, y }}
          dragTransition={{
            bounceStiffness: 1000,
          }}
          className="relative aspect-[calc(3/4)] w-full"
          dragMomentum={false}
          dragElastic={0.05}
          // dragControls={dragControls}
          animate={controls}
          dragConstraints={constraints}
          // initial={{ scale}}
        >
          <Image
            ref={imageRef}
            src={image}
            alt="Selected"
            fill
            draggable={false}
            className={`object-scale-down select-none h-auto`}
          />
        </motion.div>
      </div>
      <input
        type="range"
        min=".5"
        max="3"
        step="0.1"
        defaultValue={1}
        onChange={onScaleChange}
        className="relative z-10 w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-200"
      />
    </div>
  );
}
