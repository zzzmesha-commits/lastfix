import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CHI_DISCORD_ID,
  DEFAULT_KEEPSAKE_DATA,
  VANISH_DISCORD_ID,
} from './data/defaultKeepsake';
import type { PhotoSlot } from './types/keepsake';
import { SatinBow } from './components/RibbonMotif';
import { LightboxModal } from './components/LightboxModal';
import { LoveLetterEnvelope } from './components/LoveLetterEnvelope';
import { HeartConfetti, type ConfettiBurst } from './components/HeartConfetti';
import { ProfileLanyardCard } from './components/ProfileLanyardCard';
import { VisitorLoveCounter } from './components/VisitorLoveCounter';
import { EntryPromptScreen } from './components/EntryPromptScreen';
import { CatCursorChase } from './components/CatCursorChase';
import { BackgroundMusic } from './components/BackgroundMusic';
import { BackgroundDecorations } from './components/BackgroundDecorations';
import { mergePhotoWithLanyard, useLanyardUsers } from './hooks/useLanyard';
import pinimgBgFallback from './assets/images/pinimg_bg_fallback.jpg';

const BACKGROUND_IMAGE_URL =
  'https://i.pinimg.com/736x/11/d7/b1/11d7b112bc8425ecc43a874eb85893fb.jpg';

const LANYARD_IDS = [VANISH_DISCORD_ID, CHI_DISCORD_ID] as const;

function TinyHeart({ className = 'w-2.5 h-2.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 14.2s-5.6-3.5-6.9-7.1C.3 4.8 1.9 2.5 4.3 2.5c1.5 0 2.8.8 3.7 2 .9-1.2 2.2-2 3.7-2 2.4 0 4 2.3 3.2 4.6-1.3 3.6-6.9 7.1-6.9 7.1z" />
    </svg>
  );
}

export default function App() {
  const data = DEFAULT_KEEPSAKE_DATA;
  const lanyardUsers = useLanyardUsers(LANYARD_IDS);
  const [hasEntered, setHasEntered] = useState(false);
  const [lightboxPhotoId, setLightboxPhotoId] = useState<PhotoSlot['id'] | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [bgSrc, setBgSrc] = useState<string>(BACKGROUND_IMAGE_URL);

  const [confettiBursts, setConfettiBursts] = useState<ConfettiBurst[]>([]);
  const nextBurstIdRef = useRef(1);

  const hydratedPhotos = useMemo<[PhotoSlot, PhotoSlot]>(() => {
    const first = mergePhotoWithLanyard(
      data.photos[0],
      data.photos[0].discordId ? lanyardUsers[data.photos[0].discordId] : undefined
    );
    const second = mergePhotoWithLanyard(
      data.photos[1],
      data.photos[1].discordId ? lanyardUsers[data.photos[1].discordId] : undefined
    );
    return [first, second];
  }, [data.photos, lanyardUsers]);

  const handleCelebrate = useCallback((origin: { x: number; y: number }) => {
    const id = nextBurstIdRef.current++;
    setConfettiBursts((prev) => [...prev.slice(-6), { id, x: origin.x, y: origin.y }]);
  }, []);

  const handleEnterSite = useCallback(
    (origin: { x: number; y: number }) => {
      handleCelebrate(origin);
      setHasEntered(true);
    },
    [handleCelebrate]
  );

  const handleCloseLightbox = useCallback(() => {
    setLightboxPhotoId(null);
  }, []);

  const handleSelectLightboxPhoto = useCallback((id: PhotoSlot['id']) => {
    setLightboxPhotoId(id);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-14 relative overflow-x-hidden bg-[#FDF2F6] text-[#3B1E28]">
      {/* Fixed full-bleed background image */}
      <img
        src={bgSrc}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        onError={() => {
          if (bgSrc !== pinimgBgFallback) {
            setBgSrc(pinimgBgFallback);
          }
        }}
        className="pointer-events-none select-none fixed inset-0 w-full h-full object-cover object-center z-0"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[#FFF7FA]/25 z-0"
      />
      <BackgroundDecorations />
      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <EntryPromptScreen key="entry-screen" onEnter={handleEnterSite} />
        ) : (
          <motion.main
            key="keepsake-main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl flex flex-col items-center"
          >
            {/* Centered Stacked Title with Coquette Satin Bow & Delicate Floating Hearts */}
            <div className="relative flex flex-col items-center text-center select-none">
              <SatinBow className="w-16 h-10 mb-1" color="#C45473" />

              <h1
                className="font-display font-black tracking-[-0.02em] leading-[0.86] text-transparent bg-clip-text bg-gradient-to-b from-[#CE5B7C] via-[#A63A59] to-[#752039]"
                style={{ fontSize: 'clamp(3.5rem, 8.5vw, 6.25rem)' }}
              >
                <span className="block">{data.titleLine1}</span>
                <span className="block">{data.titleLine2}</span>
              </h1>

              {/* Subtle coquette floating heart accents */}
              <span
                aria-hidden="true"
                className="coquette-float absolute -left-8 bottom-6 text-[#C85475]"
              >
                <TinyHeart className="w-2.5 h-2.5" />
              </span>
              <span
                aria-hidden="true"
                className="coquette-float-delayed absolute -right-7 top-16 text-[#C85475]"
              >
                <TinyHeart className="w-2 h-2" />
              </span>
              <span
                aria-hidden="true"
                className="coquette-float absolute left-10 -bottom-4 text-[#A63A59]"
              >
                <TinyHeart className="w-2 h-2" />
              </span>
              <span
                aria-hidden="true"
                className="coquette-float-delayed absolute right-12 -bottom-5 text-[#A63A59]"
              >
                <TinyHeart className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Centered Row of 2 Coquette Lanyard Profile Boxes */}
            <section
              aria-label="Framed couple profile cards"
              className="relative mt-20 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 gap-24 sm:gap-12 items-start"
            >
              {/* Delicate stitched heart thread connecting the two photographs */}
              <div
                aria-hidden="true"
                className="pointer-events-none hidden sm:flex items-center justify-center absolute top-44 left-1/2 -translate-x-1/2 z-20"
              >
                <span className="w-6 border-t border-dashed border-[#D68CA3]" />
                <span className="mx-1 w-6 h-6 rounded-full bg-[#FFF9FB] border border-[#E5C0CC] shadow-xs flex items-center justify-center text-[#C85475]">
                  <TinyHeart className="w-3 h-3" />
                </span>
                <span className="w-6 border-t border-dashed border-[#D68CA3]" />
              </div>

              {hydratedPhotos.map((photo, index) => (
                <ProfileLanyardCard
                  key={photo.id}
                  photo={photo}
                  hasImageError={Boolean(imageErrors[photo.id])}
                  onImageError={() =>
                    setImageErrors((prev) => ({ ...prev, [photo.id]: true }))
                  }
                  onOpenLightbox={() => handleSelectLightboxPhoto(photo.id)}
                  tilt={index === 0 ? 'left' : 'right'}
                />
              ))}
            </section>

            <LoveLetterEnvelope
              letter={data.loveLetter}
              onOpenCelebrate={handleCelebrate}
            />

            <VisitorLoveCounter />
          </motion.main>
        )}
      </AnimatePresence>

      <LightboxModal
        photos={hydratedPhotos}
        activePhotoId={lightboxPhotoId}
        onClose={handleCloseLightbox}
        onSelectPhoto={handleSelectLightboxPhoto}
      />

      <HeartConfetti bursts={confettiBursts} />

      {hasEntered && <CatCursorChase />}

      <BackgroundMusic />
    </div>
  );
}
