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
      <div className="shots">
        {screenshots.map((screenshot, index) =>
          isVideo(screenshot) ? (
            // Videos loop silently in place, like a moving screenshot.
            <div key={screenshot} className="shot" data-reveal style={{ '--i': index % 2 } as React.CSSProperties}>
              <video src={mediaUrl(screenshot)} autoPlay muted loop playsInline controls />
            </div>
          ) : (
            <button
              key={screenshot}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Enlarge ${title} screenshot ${index + 1}`}
              className="shot"
              data-reveal
              style={{ '--i': index % 2 } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(screenshot)} alt={`${title} screenshot ${index + 1}`} loading="lazy" />
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
