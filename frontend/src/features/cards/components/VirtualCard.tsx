import { cn } from '@/shared/utils/cn';
import { CreditCard, Eye, EyeOff, Lock, Trash2, Unlock, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { cardService } from '../services/card.service';
import { VirtualCard as CardType } from '../types/card.types';

export type Card = CardType;

interface VirtualCardProps {
  card: CardType;
  accountType?: 'AHORROS' | 'CORRIENTE' | 'NOMINA' | 'CREDITO';
  onToggleLock: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
  isLoading: boolean;
  avatarUrl?: string | null;
}

interface CardFaceProps {
  card: CardType;
  isBlocked: boolean;
  palette: { face: string; back: string; badge: string };
  avatarUrl?: string | null;
  faceStyle: React.CSSProperties;
}

function CardFront({ card, isBlocked, palette, avatarUrl, faceStyle }: Readonly<CardFaceProps>) {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full rounded-2xl p-6 text-white shadow-xl transition-colors duration-500 overflow-hidden",
        isBlocked
          ? "border border-zinc-700/50 bg-gradient-to-br from-zinc-800 to-zinc-950 grayscale"
          : palette.face
      )}
      style={faceStyle}
    >
      {/* Brillo dinámico superpuesto */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover border border-white/30"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-white/60 font-semibold flex items-center gap-1">
              <Zap size={14} className={isBlocked ? "text-zinc-500" : "text-yellow-400"} />
              FuBanking Virtual
            </p>
            <p className="mt-8 text-xl font-bold tracking-wide">{card.cardHolderName}</p>
          </div>
        </div>
        <CreditCard className="text-white/70" size={28} />
      </div>

      <div className="mt-8">
        <p className="font-mono text-2xl tracking-[0.25em] drop-shadow-sm">
          **** **** **** {card.lastFour}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs font-medium text-white/80">
        <span>Vence {card.expirationDate}</span>
        <span className={cn(
          "px-2 py-1 rounded-full text-[10px] font-bold tracking-wider",
          isBlocked ? "bg-red-500/20 text-red-200" : palette.badge
        )}>
          {card.status}
        </span>
      </div>

      {/* Overlay de Bloqueo */}
      {isBlocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
          <div className="bg-zinc-900/90 rounded-full p-4 border border-zinc-700 shadow-2xl">
            <Lock size={32} className="text-zinc-400" />
          </div>
        </div>
      )}
    </div>
  );
}

interface CardBackProps {
  card: CardType;
  isBlocked: boolean;
  backClass: string;
  backStyle: React.CSSProperties;
  showSensitiveData: boolean;
  sensitiveData: { cardNumber: string; cvv: string } | null;
  isRevealing: boolean;
  revealError: string | null;
  revealLabel: string;
  formatCardNumber: (value: string) => string;
  onReveal: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function CardBack({
  card, isBlocked, backClass, backStyle, showSensitiveData, sensitiveData,
  isRevealing, revealError, revealLabel, formatCardNumber, onReveal,
}: Readonly<CardBackProps>) {
  const showFull = showSensitiveData && sensitiveData;
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full rounded-2xl text-white shadow-xl overflow-hidden",
        backClass
      )}
      style={backStyle}
    >
      <div className="w-full h-12 bg-black/80 mt-6" />
      <div className="px-6 py-4">
        <div className="w-full bg-white/10 rounded h-10 flex items-center justify-end px-4">
          <p className="font-mono text-lg tracking-widest italic flex items-center gap-2">
            {showSensitiveData ? <Eye size={16} className="text-white/50" /> : <EyeOff size={16} className="text-white/50" />}
            CVV {showFull ? sensitiveData.cvv : card.cvvMasked}
          </p>
        </div>
        <div className="mt-3 min-h-[28px]">
          <p className="font-mono text-sm tracking-[0.2em] text-white/80">
            {showFull ? formatCardNumber(sensitiveData.cardNumber) : `**** **** **** ${card.lastFour}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onReveal}
          disabled={isRevealing || card.status === 'CANCELADA'}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-50 disabled:pointer-events-none"
        >
          {showSensitiveData ? <EyeOff size={14} /> : <Eye size={14} />}
          {revealLabel}
        </button>
        {revealError && (
          <p className="mt-2 text-center text-[10px] font-medium text-red-200">
            {revealError}
          </p>
        )}
        <p className="text-[10px] text-white/40 mt-4 leading-tight text-center">
          Esta tarjeta virtual es personal e intransferible. Úsala para tus compras en línea de manera segura. El CVV cambia periódicamente.
        </p>
      </div>
    </div>
  );
}

interface CardControlsProps {
  card: CardType;
  isBlocked: boolean;
  isLoading: boolean;
  onToggleLock: (cardId: string) => void;
  onDelete: (cardId: string) => void;
}

function CardControls({ card, isBlocked, isLoading, onToggleLock, onDelete }: Readonly<CardControlsProps>) {
  const disabled = isLoading || card.status === 'CANCELADA';
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onToggleLock(card.id)}
        disabled={disabled}
        className={cn(
          "group relative flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-bold transition-all overflow-hidden",
          isBlocked
            ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            : "border-border bg-card text-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
      >
        <span className={cn(
          "absolute inset-0 w-full h-full transition-all duration-300 ease-out",
          isBlocked
            ? "bg-primary scale-x-0 group-hover:scale-x-100 origin-left"
            : "bg-destructive/10 scale-x-0 group-hover:scale-x-100 origin-right"
        )} />
        <span className="relative flex items-center gap-2 z-10">
          {isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
          {isBlocked ? 'Desbloquear Tarjeta' : 'Bloquear Temporalmente'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onDelete(card.id)}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 disabled:pointer-events-none"
      >
        <Trash2 size={18} />
        Eliminar
      </button>
    </div>
  );
}

export function VirtualCard({ card, accountType = 'AHORROS', onToggleLock, onDelete = () => {}, isLoading, avatarUrl }: Readonly<VirtualCardProps>) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [sensitiveData, setSensitiveData] = useState<{ cardNumber: string; cvv: string } | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const isBlocked = card.status === 'BLOQUEADA';

  const colorPalette = {
    AHORROS: {
      face: 'border border-primary/30 bg-gradient-to-br from-[#820AD1] via-[#53178f] to-[#18111f]',
      back: 'border border-primary/30 bg-gradient-to-br from-[#18111f] via-[#2a0e4a] to-[#40126e]',
      badge: 'bg-green-500/20 text-green-200',
    },
    CORRIENTE: {
      face: 'border border-emerald-500/30 bg-gradient-to-br from-[#166534] via-[#14532d] to-[#052e16]',
      back: 'border border-emerald-500/30 bg-gradient-to-br from-[#052e16] via-[#022c22] to-[#14532d]',
      badge: 'bg-emerald-500/20 text-emerald-200',
    },
    NOMINA: {
      face: 'border border-red-500/30 bg-gradient-to-br from-[#7f1d1d] via-[#991b1b] to-[#2b0a0a]',
      back: 'border border-red-500/30 bg-gradient-to-br from-[#2b0a0a] via-[#4c0519] to-[#7f1d1d]',
      badge: 'bg-red-500/20 text-red-200',
    },
    CREDITO: {
      face: 'border border-amber-500/30 bg-gradient-to-br from-[#78350f] via-[#92400e] to-[#451a03]',
      back: 'border border-amber-500/30 bg-gradient-to-br from-[#451a03] via-[#78350f] to-[#92400e]',
      badge: 'bg-amber-500/20 text-amber-200',
    },
  }[accountType] ?? {
    face: 'border border-primary/30 bg-gradient-to-br from-[#820AD1] via-[#53178f] to-[#18111f]',
    back: 'border border-primary/30 bg-gradient-to-br from-[#18111f] via-[#2a0e4a] to-[#40126e]',
    badge: 'bg-green-500/20 text-green-200',
  };

  const cardFaceStyle: React.CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };
  const cardBackStyle: React.CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
  };

  const formatCardNumber = (value: string) => value.replace(/(.{4})/g, '$1 ').trim();

  const handleRevealSensitiveData = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setRevealError(null);

    if (showSensitiveData) {
      setShowSensitiveData(false);
      return;
    }

    if (sensitiveData) {
      setShowSensitiveData(true);
      return;
    }

    setIsRevealing(true);
    try {
      const details = await cardService.revealDetails(card.id);
      setSensitiveData(details);
      setShowSensitiveData(true);
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: string }).message || 'No fue posible revelar los datos.')
        : 'No fue posible revelar los datos.';
      setRevealError(message);
    } finally {
      setIsRevealing(false);
    }
  };

  const flipBack = () => setIsFlipped(!isFlipped);

  const revealLabel = isRevealing
    ? 'Cargando datos...'
    : getRevealLabel(showSensitiveData);

  return (
    <div className="space-y-4" style={{ perspective: '1000px' }}>
      {/* Contenedor principal de la tarjeta con flip 3D.
          NOSONAR(typescript:S6819,typescript:S1082): div con role="button",
          tabIndex y manejo de Enter/Espacio (WCAG-operable); no puede ser un
          <button> real porque contiene el botón anidado "Ver numero y CVV". */}
      <div // NOSONAR -- ver justificación arriba: flip operable por teclado con botón anidado
        role="button"
        tabIndex={0}
        aria-label="Girar tarjeta"
        className={cn(
          "relative w-full h-[220px] cursor-pointer transition-all duration-700 hover:scale-[1.02] group"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={flipBack} // NOSONAR
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flipBack();
          }
        }}
      >
        {/* Lado Frontal */}
        <CardFront
          card={card}
          isBlocked={isBlocked}
          palette={colorPalette}
          avatarUrl={avatarUrl}
          faceStyle={cardFaceStyle}
        />

        {/* Lado Reverso */}
        <CardBack
          card={card}
          isBlocked={isBlocked}
          backClass={isBlocked
            ? "border border-zinc-700/50 bg-gradient-to-br from-zinc-800 to-zinc-950 grayscale"
            : colorPalette.back}
          backStyle={cardBackStyle}
          showSensitiveData={showSensitiveData}
          sensitiveData={sensitiveData}
          isRevealing={isRevealing}
          revealError={revealError}
          revealLabel={revealLabel}
          formatCardNumber={formatCardNumber}
          onReveal={handleRevealSensitiveData}
        />
      </div>

      {/* Controles */}
      <CardControls
        card={card}
        isBlocked={isBlocked}
        isLoading={isLoading}
        onToggleLock={onToggleLock}
        onDelete={onDelete}
      />
    </div>
  );
}

function getRevealLabel(showSensitiveData: boolean): string {
  if (showSensitiveData) return 'Ocultar numero y CVV';
  return 'Ver numero y CVV';
}
