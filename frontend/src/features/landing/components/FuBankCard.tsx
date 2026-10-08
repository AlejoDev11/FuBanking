'use client';

import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { User } from 'lucide-react';
import Image from 'next/image';

interface FuBankCardProps {
  holder?: string;
  accountLabel?: string;
  accountNumber?: string;
  avatarUrl?: string;
  avatarAlt?: string;
}

function UserPlaceholder() {
  return (
    <div className="relative w-16 h-16 rounded-full border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center">
      <User size={28} className="text-neutral-300" aria-hidden="true" />
    </div>
  );
}

// Chime discreto y profesional (flip de tarjeta premium). Se crea bajo gesto
// del usuario, por lo que no hay problemas de autoplay ni fugas: se cierra al terminar.
function playFlipChime() {
  try {
    const Ctor =
      globalThis.AudioContext ??
      (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.12);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
    osc.onended = () => void ctx.close();
  } catch {
    // Audio no disponible: flip silencioso
  }
}

/** Y de inclinación sin ternario anidado (S3358). */
function getTiltY(
  isFlipped: boolean,
  reduceMotion: boolean | null,
  tilt: MotionValue<number>,
): number | MotionValue<number> {
  if (isFlipped) return 180;
  if (reduceMotion) return 0;
  return tilt;
}

export function FuBankCard({
  holder = 'Miembro FuBank',
  accountLabel = 'Cuenta digital',
  accountNumber = 'FUB-004250',
  avatarUrl,
  avatarAlt = `Foto de ${holder}`,
}: Readonly<FuBankCardProps>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || reduceMotion) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, reduceMotion]
  );

  const resetTilt = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const flip = useCallback(() => {
    playFlipChime();
    setIsFlipped((prev) => !prev);
    resetTilt();
  }, [resetTilt]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flip();
      }
    },
    [flip]
  );

  const flipDuration = reduceMotion ? 0 : 0.8;

  return (
    <div style={{ perspective: '1500px' }}>
      <motion.div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Ver anverso de la tarjeta' : 'Ver reverso de la tarjeta'}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onClick={flip}
        onKeyDown={handleKeyDown}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: getTiltY(isFlipped, reduceMotion, rotateY),
          transformStyle: 'preserve-3d',
        }}
        transition={{ duration: flipDuration, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-[420px] h-[260px] cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
      >
        {/* ANVERSO */}
        <div
          aria-hidden={isFlipped}
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Base metal líquido */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #150a24 50%, #2a0a4a 75%, #0a0a0a 100%)',
            }}
          />
          {/* Ondas de metal animadas */}
          {!reduceMotion && (
            <motion.div
              className="absolute inset-0"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%),
                  radial-gradient(ellipse 60% 40% at 80% 70%, rgba(130,10,209,0.18) 0%, transparent 50%),
                  radial-gradient(ellipse 100% 60% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 60%)
                `,
                backgroundSize: '200% 200%',
              }}
            />
          )}
          {/* Barrido de luz */}
          {!reduceMotion && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <motion.div
                className="absolute w-[300%] h-full"
                animate={{ x: ['-200%', '100%'] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%, transparent 100%)',
                  transform: 'skewX(-25deg)',
                }}
              />
            </div>
          )}
          {/* Borde metálico con tinte morado */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(130,10,209,0.35) 50%, rgba(255,255,255,0.06) 100%)',
              padding: '1px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-[1px] rounded-2xl"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 1px rgba(0,0,0,0.3)',
            }}
          />

          {/* Contenido anverso */}
          <div
            className="relative h-full p-8 flex flex-col justify-between"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="flex items-start justify-between">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-[3px] rounded-full opacity-60"
                  style={{ background: 'linear-gradient(135deg, #fff 0%, #820AD1 50%, #fff 100%)' }}
                />
                {avatarUrl && imgOk ? (
                  <img
                    src={avatarUrl}
                    alt={avatarAlt}
                    onError={() => setImgOk(false)}
                    className="relative w-16 h-16 rounded-full object-cover border-2 border-neutral-700 bg-neutral-900"
                  />
                ) : (
                  <UserPlaceholder />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="w-2 h-2 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                />
                <span className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase">
                  Activa
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-3xl font-light tracking-wide text-white">{holder}</p>
              <p
                className="text-sm tracking-[0.25em] uppercase"
                style={{
                  background: 'linear-gradient(90deg, #c9a6f7 0%, #fff 50%, #c9a6f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {accountLabel}
              </p>
            </div>

            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[9px] text-neutral-500 uppercase tracking-[0.2em]">
                  ID de cuenta
                </p>
                <p className="font-mono text-xs tracking-wider text-neutral-300">
                  {accountNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="FuBank"
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="text-sm font-black font-display tracking-[0.06em] uppercase text-white">
                  FuBank
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* REVERSO BANCARIO */}
        <div
          aria-hidden={!isFlipped}
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(225deg, #0f0f0f 0%, #1a1a1a 30%, #150a24 60%, #0a0a0a 100%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-[1px] rounded-2xl"
            style={{
              border: '1px solid rgba(130,10,209,0.25)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
            }}
          />
          <div className="relative h-full py-8 flex flex-col justify-between">
            <div aria-hidden="true" className="h-11 w-full bg-black/80" />
            <div className="px-8 space-y-4">
              <div>
                <p className="text-[9px] text-neutral-500 uppercase tracking-[0.2em] mb-1">
                  Firma autorizada
                </p>
                <div className="h-9 rounded-md bg-white/85 flex items-center justify-end px-3">
                  <span className="font-mono text-sm font-bold tracking-[0.3em] text-neutral-800">
                    •••
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs tracking-wider text-neutral-400">
                  {accountNumber}
                </p>
                <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500">
                  fubank.com • 24/7
                </p>
              </div>
            </div>
            <p className="px-8 text-[9px] tracking-wider text-neutral-600">
              Esta tarjeta es propiedad de FuBank. Si la encuentras, repórtala en la app.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
