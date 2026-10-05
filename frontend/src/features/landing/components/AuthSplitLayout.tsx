'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { AuthProofPanel } from './AuthProofPanel';
import { cn } from '@/shared/utils/cn';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
}

const STEPS = ['Crea tu cuenta', 'Verifica tu identidad', 'Activa tu cuenta'];

function activeStepFor(pathname: string): number {
  if (
    pathname.includes('verify-two-factor') ||
    pathname.includes('forgot-password') ||
    pathname.includes('reset-password')
  ) {
    return 1;
  }
  if (pathname.includes('login')) return 2;
  return 0;
}

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  const pathname = usePathname();
  const activeStep = activeStepFor(pathname);
  const isExtended = pathname.includes('/register');

  if (!isExtended) {
    return (
      <div className="relative flex min-h-screen bg-background text-foreground transition-colors">
        <div className="absolute right-6 top-6 z-20">
          <ThemeToggle />
        </div>

        {/* Left: Brand panel compacto — tarjeta a altura completa, contenido centrado */}
        <div className="hidden lg:flex lg:w-[45%] p-4">
          <div className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl bg-[linear-gradient(180deg,#c9a6f7_0%,#820AD1_38%,#2a0a4a_72%,#0a0a1a_100%)] px-10 py-14 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-white/20 blur-[100px]"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/logo.png"
                  alt="FuBank"
                  width={44}
                  height={44}
                  className="rounded-2xl"
                />
                <span className="text-xl font-black tracking-[0.06em] font-display uppercase text-white">
                  <span className="text-white">Fu</span>Bank
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Empieza con Nosotros
              </h1>
              <p className="text-white/75 max-w-sm leading-relaxed mb-6">
                Completa estos sencillos pasos para crear tu cuenta.
              </p>
              <ol className="w-full max-w-xs space-y-2.5">
                {STEPS.map((step, i) => {
                  const isActive = i === activeStep;
                  return (
                    <li
                      key={step}
                      aria-current={isActive ? 'step' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                        isActive ? 'bg-white text-black' : 'bg-white/10 text-white/75 backdrop-blur-sm'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold',
                          isActive ? 'bg-black text-white' : 'bg-white/15 text-white'
                        )}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        {/* Right: Form area */}
        <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="FuBank"
                width={44}
                height={44}
                className="rounded-xl"
              />
              <h1 className="text-4xl font-black font-display tracking-[0.06em] uppercase">
                <span className="text-primary">Fu</span>bank
              </h1>
            </div>
            {children}
            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={14} aria-hidden="true" className="text-primary" />
              Tus datos están protegidos con cifrado de extremo a extremo
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-background text-foreground transition-colors">
      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      {/* Left: Brand panel extendido (sticky + prueba social, solo registro) */}
      <div className="hidden lg:block lg:w-1/2 p-4">
        <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-[linear-gradient(180deg,#c9a6f7_0%,#820AD1_38%,#2a0a4a_72%,#0a0a1a_100%)] scrollbar-hide relative w-full">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-white/20 blur-[100px]"
          />
          <div className="relative z-10 flex min-h-full w-full flex-col items-center px-10 pt-10 pb-8 text-center">
            <div className="flex items-center gap-3 mb-6">
              <Image
                src="/logo.png"
                alt="FuBank"
                width={44}
                height={44}
                className="rounded-2xl"
              />
              <span className="text-xl font-black tracking-[0.06em] font-display uppercase text-white">
                <span className="text-white">Fu</span>Bank
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Empieza con Nosotros
            </h1>
            <p className="text-white/75 max-w-sm leading-relaxed mb-6">
              Completa estos sencillos pasos para crear tu cuenta.
            </p>
            <ol className="w-full max-w-xs space-y-2.5 mb-8">
              {STEPS.map((step, i) => {
                const isActive = i === activeStep;
                return (
                  <li
                    key={step}
                    aria-current={isActive ? 'step' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                      isActive ? 'bg-white text-black' : 'bg-white/10 text-white/75 backdrop-blur-sm'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold',
                        isActive ? 'bg-black text-white' : 'bg-white/15 text-white'
                      )}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                );
              })}
            </ol>
            <AuthProofPanel />
          </div>
        </div>
      </div>

      {/* Right: Form area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="FuBank"
              width={44}
              height={44}
              className="rounded-xl"
            />
            <span className="text-4xl font-black font-display tracking-[0.06em] uppercase">
              <span className="text-primary">Fu</span>bank
            </span>
          </div>
          {children}
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} aria-hidden="true" className="text-primary" />
            Tus datos están protegidos con cifrado de extremo a extremo
          </p>
        </div>
      </div>
    </div>
  );
}
