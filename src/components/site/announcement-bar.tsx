"use client";

import { useEffect, useState } from "react";

type AnnouncementContent = { texts?: string[] };

export function AnnouncementBar({ content }: { content: AnnouncementContent }) {
  const texts = content.texts ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % texts.length), 4000);
    return () => clearInterval(id);
  }, [texts.length]);

  if (texts.length === 0) return null;

  return (
    <div className="bg-stone-800 text-stone-50">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center px-4 text-xs tracking-wide">
        <p key={index} className="animate-in fade-in truncate text-center duration-500">
          {texts[index]}
        </p>
      </div>
    </div>
  );
}
