import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PhotoSlot } from '../types/keepsake';
import { HelloKittySticker, SatinBow } from './RibbonMotif';
import lightboxCharmFallback from '../assets/images/lightbox_charm.webp';

const LIGHTBOX_CHARM_URL =
  'https://media.discordapp.net/attachments/1571891761121329327/1574688871948623923/9RcMuUAAAAGSURBVAMAfHLP4VuR0RsAAAAASUVORK5CYII.png?ex=6b068ecb&is=6b053d4b&hm=d95b1e9ae6fa167b3d037e79e42ce278920b96966ef165d65813344bddcfb9fa&format=webp&quality=lossless';

interface LightboxModalProps {
  photos: [PhotoSlot, PhotoSlot];
  activePhotoId: PhotoSlot['id'] | null;
  onClose: () => void;
  onSelectPhoto: (id: PhotoSlot['id']) => void;
}

export function LightboxModal({
  photos,
  activePhotoId,
  onClose,
  onSelectPhoto,
}: LightboxModalProps) {
  const [fallbackSrcs, setFallbackSrcs] = useState<Record<string, boolean>>({});
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});
  const [charmSrc, setCharmSrc] = useState<string>(LIGHTBOX_CHARM_URL);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const onSelectPhotoRef = useRef(onSelectPhoto);

  onCloseRef.current = onClose;
  onSelectPhotoRef.current = onSelectPhoto;

  const isOpen = Boolean(activePhotoId);
  const currentIndex = activePhotoId
    ? Math.max(0, photos.findIndex((p) => p.id === activePhotoId))
    : 0;
  const prevPhoto = photos[(currentIndex - 1 + photos.length) % photos.length];
  const nextPhoto = photos[(currentIndex + 1) % photos.length];

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      } else if (event.key === 'ArrowLeft') {
        onSelectPhotoRef.current(prevPhoto.id);
      } else if (event.key === 'ArrowRight') {
        onSelectPhotoRef.current(nextPhoto.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, prevPhoto.id, nextPhoto.id]);

  if (!activePhotoId) return null;

  const currentPhoto = photos[currentIndex] ?? photos[0];
  const activeSrc =
    fallbackSrcs[currentPhoto.src] && currentPhoto.fallbackSrc
      ? currentPhoto.fallbackSrc
      : currentPhoto.src;
  const hasErr = Boolean(failedSrcs[activeSrc]);

  const handleImgError = () => {
    if (!fallbackSrcs[currentPhoto.src] && currentPhoto.fallbackSrc) {
      setFallbackSrcs((prev) => ({ ...prev, [currentPhoto.src]: true }));
      return;
    }
    setFailedSrcs((prev) => ({ ...prev, [activeSrc]: true }));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#241118]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={currentPhoto.title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-[#E5C0CC] bg-[#FFF9FB] text-[#3B1E28] p-5 sm:p-7 shadow-[0_20px_50px_rgba(74,25,42,0.28)] grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-6 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close picture viewer"
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-lg border border-[#E5C0CC] bg-white text-[#3B1E28] hover:bg-[#FAF0F3] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C45473]"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="flex items-center justify-center">
          <div className="relative w-full rounded-xl p-1.5 border border-dashed border-[#E6BDC9] bg-[#FDF1F5]/75">
            <div className="rounded-lg overflow-hidden border border-[#F0D7E0] bg-white">
              {!hasErr ? (
                <img
                  src={activeSrc}
                  alt={currentPhoto.alt}
                  referrerPolicy="no-referrer"
                  onError={handleImgError}
                  className="w-full max-h-[68vh] h-auto object-contain block"
                />
              ) : (
                <div className="w-full aspect-square flex flex-col items-center justify-center p-6">
                  <SatinBow className="w-12 h-8 mb-2" color="#C45473" />
                  <span className="font-display italic text-lg text-[#9E3B58]">
                    {currentPhoto.label}
                  </span>
                </div>
              )}
            </div>
            <HelloKittySticker className="absolute -bottom-3 -right-3 z-20 w-14 h-12 rotate-6" />
          </div>
        </div>

        <div className="relative flex flex-col justify-between gap-6 py-4 pr-2 min-h-[260px]">
          <img
            src={charmSrc}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => {
              if (charmSrc !== lightboxCharmFallback) {
                setCharmSrc(lightboxCharmFallback);
              }
            }}
            className="pointer-events-none select-none absolute inset-0 m-auto w-60 h-60 sm:w-72 sm:h-72 object-contain opacity-25 z-0"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2">
              <SatinBow className="w-9 h-6 shrink-0" color="#C85D7C" />
              <p className="font-display italic text-lg font-bold text-[#9E3B58]">
                {currentPhoto.label}
              </p>
              {currentPhoto.discordUsername && (
                <span className="font-mono text-xs text-[#745660]">
                  · @{currentPhoto.discordUsername}
                </span>
              )}
            </div>
            <h3 className="font-display text-3xl font-bold leading-tight mb-3">
              {currentPhoto.title}
            </h3>
            {currentPhoto.caption && (
              <p className="text-sm leading-relaxed text-[#664651]">
                {currentPhoto.caption}
              </p>
            )}
          </div>

          <div className="relative z-10 pt-4 border-t border-[#EBD6DD] flex items-center justify-between">
            <span className="font-mono text-[11px] tabular-nums text-[#745660]">
              {String(currentIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectPhoto(prevPhoto.id)}
                aria-label="Previous photo"
                className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg border border-[#E5C0CC] text-[#3B1E28] hover:bg-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => onSelectPhoto(nextPhoto.id)}
                aria-label="Next photo"
                className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-[#B84C6C] hover:bg-[#9E3B58] text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
