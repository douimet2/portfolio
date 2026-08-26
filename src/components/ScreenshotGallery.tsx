'use client';

import { useState } from 'react';
import { mediaUrl, isVideo } from '@/lib/media';
import Lightbox from './Lightbox';

interface ScreenshotGalleryProps {
  screenshots: string[];
  title: string;
}

export default function ScreenshotGallery({ screenshots, title }: ScreenshotGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {screenshots.map((screenshot, index) =>
          isVideo(screenshot) ? (
            // Videos keep their own controls — a click here would fight the
            // play button, so they play in place.
            <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
              <video src={mediaUrl(screenshot)} controls className="w-full h-auto bg-gray-100" />
            </div>
          ) : (
            <button
              key={index}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Enlarge ${title} screenshot ${index + 1}`}
              className="group relative block overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-lg cursor-zoom-in"
            >
              <img
                src={mediaUrl(screenshot)}
                alt={`${title} screenshot ${index + 1}`}
                className="w-full h-auto"
              />
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            </button>
          )
        )}
      </div>

      <Lightbox
        items={screenshots}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
        label={title}
      />
    </>
  );
}
