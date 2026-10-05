'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PiggyBank, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { StarRating } from './StarRating';

const TESTIMONIALS = [
  {
    name: 'María García',
    initials: 'MG',
    rating: 5,
    comment: 'Increíble lo fácil que es transferir dinero. Ya no uso otros bancos para mis envíos.',
  },
  {
    name: 'Carlos Rodríguez',
    initials: 'CR',
    rating: 5,
    comment: 'Las tarjetas virtuales me dieron tranquilidad para comprar online. Súper seguro.',
  },
  {
    name: 'Laura Martínez',
    initials: 'LM',
    rating: 4,
    comment: 'Los bolsillos son perfectos para ahorrar. Veo mi progreso en tiempo real.',
  },
];

const DIFFERENTIATORS = [
  {
    icon: Zap,
    title: 'Sin comisiones ocultas',
    description: 'Lo que ves es lo que pagas.',
  },
  {
    icon: ShieldCheck,
    title: 'Cifrado extremo a extremo',
    description: 'Tu dinero y tus datos, blindados.',
  },
  {
    icon: PiggyBank,
    title: 'Bolsillos inteligentes',
    description: 'Ahorra por objetivos, sin esfuerzo.',
  },
];

export function AuthProofPanel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const current = TESTIMONIALS[index];

  return (
    <div className="w-full max-w-xs mx-auto space-y-6">
      <figure
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm text-left"
      >
        <StarRating rating={current.rating} />
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
            className="mt-3 text-sm leading-relaxed text-white/85"
          >
            &ldquo;{current.comment}&rdquo;
          </motion.blockquote>
        </AnimatePresence>
        <figcaption className="mt-4 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-primary/25 text-xs font-bold text-white"
          >
            {current.initials}
          </span>
          <span className="text-sm font-medium text-white">{current.name}</span>
        </figcaption>
        <div className="mt-4 flex justify-center gap-1.5" role="tablist" aria-label="Testimonios">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Ver testimonio de ${t.name}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      </figure>

      <ul className="space-y-3 text-left">
        {DIFFERENTIATORS.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/20">
              <item.icon size={18} className="text-violet-200" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">{item.title}</span>
              <span className="block text-xs text-white/60">{item.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
