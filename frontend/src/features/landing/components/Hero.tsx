'use client';

import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Check, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Tarjeta interactiva (tilt, flip, keyframes): solo-cliente para evitar
// mismatch de hidratación entre SSR y framer-motion.
const FuBankCard = dynamic(() => import('./FuBankCard').then((m) => m.FuBankCard), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="w-[420px] h-[260px] rounded-2xl border border-white/10"
      style={{
        background:
          'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #150a24 50%, #2a0a4a 75%, #0a0a0a 100%)',
      }}
    />
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#0a0a1a] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(130,10,209,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(130,10,209,0.12)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-[-12rem] h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-16rem] right-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[#a855f7]/20 blur-[140px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-10 lg:px-14">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="FuBank"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="text-sm font-black tracking-[0.06em] font-display uppercase">
              <span className="text-primary">Fu</span>bank
            </span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-white/45 sm:flex">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Todo seguro y en orden
          </div>
        </motion.header>

        <div className="grid flex-1 items-center gap-14 pb-16 pt-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.85fr)] lg:gap-12 lg:pb-20 lg:pt-10">
          <div className="relative z-10 max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-medium tracking-wide text-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            >
              <span aria-hidden="true" className="text-primary">●</span>
              Nuevo — Tarjetas virtuales disponibles
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-[clamp(3.5rem,12vw,8.5rem)] font-black leading-[0.9] tracking-[0.06em] font-display uppercase text-white"
            >
              <span className="text-primary">Fu</span>bank
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-7 max-w-xl text-3xl font-medium tracking-tight text-white/90 sm:text-4xl"
            >
              Tu dinero, tu control.
            </motion.p>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-4 max-w-sm text-base leading-7 text-white/45"
            >
              Banca digital segura y sin complicaciones.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
              >
                Crear mi cuenta
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Iniciar sesión
              </Link>
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/45"
            >
              <div className="flex -space-x-2" aria-hidden="true">
                {['MC', 'JR', 'AS'].map((initials) => (
                  <span
                    key={initials}
                    className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#0a0a1a] bg-primary/30 text-[9px] font-bold text-white backdrop-blur-sm"
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <span className="text-[#f0eaff]">
                ★★★★★ <span className="text-white/45">+12.000 usuarios</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                Sin comisiones ocultas
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-h-[390px] items-center justify-center overflow-hidden lg:min-h-[520px]"
          >
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/10 [box-shadow:0_0_100px_rgba(130,10,209,0.25)]" />
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute right-[4%] top-[12%] z-20 hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-[10px] text-white/60 shadow-2xl backdrop-blur-xl sm:flex"
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
              +18,4% este mes
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute bottom-[13%] left-[2%] z-20 hidden items-center gap-2 rounded-2xl border border-white/10 bg-[#11142b]/80 px-3 py-2 text-[10px] text-white/60 shadow-2xl backdrop-blur-xl sm:flex"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
              Seguridad activa
            </motion.div>
            <div className="relative z-10 scale-[0.72] sm:scale-90 lg:scale-100">
              <FuBankCard
                avatarUrl="https://api.dicebear.com/10.x/glyphs/svg?seed=FuBankMember&backgroundColor=820AD1"
                avatarAlt="Avatar decorativo de miembro FuBank"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-center gap-2 pb-2 text-[10px] uppercase tracking-[0.24em] text-white/35"
        >
          <span>Descubre más</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
