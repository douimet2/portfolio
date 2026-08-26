'use client';

import { useEffect, useCallback } from 'react';
import { mediaUrl, isVideo } from '@/lib/media';

interface LightboxProps {
  items: string[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  label?: string;
}

export default function Lightbox({ items, index, onClose, onNavigate, label }: LightboxProps) {
  const open = index !== null && index >= 0 && index < items.length;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + items.length) % items.length);
    },
    [index, items.length, onNavigate]
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);

    // Stop the page behind the overlay from scrolling while it is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, go]);

  if (!open || index === null) return null;
  const current = items[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label ? `${label} — enlarged view` : 'Enlarged view'}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
      >
        ×
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous"
            className="absolute left-2 sm:left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition-colors hover:bg-white/20"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next"
            className="absolute right-2 sm:right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl leading-none text-white transition-colors hover:bg-white/20"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-sm text-white">
            {index + 1} / {items.length}
          </div>
        </>
      )}

      {/* Stop clicks on the media itself from closing the overlay. */}
      <div onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full">
        {isVideo(current) ? (
          <video
            src={mediaUrl(current)}
            controls
            autoPlay
            className="max-h-[85vh] max-w-full rounded-lg"
          />
        ) : (
          <img
            src={mediaUrl(current)}
            alt={label ? `${label} ${index + 1}` : `Image ${index + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  );
}
