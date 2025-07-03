"use client";

import { ChangeEvent, useState } from "react";
import { MdCloudUpload } from "react-icons/md";

import Frame from "@/components/Frame";
import Timeline from "@/components/Timeline";

export default function Home() {
  const [frames, setFrames] = useState<string[]>([]);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFrames((prev) => [...prev, URL.createObjectURL(file)]);
    }
  };

  return <Timeline />;
}
