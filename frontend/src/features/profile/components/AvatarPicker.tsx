'use client';

import { Check, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';

const DICEBEAR_BASE = 'https://api.dicebear.com/10.x/glyphs/svg';

export const AVATAR_PRESETS: string[] = [
  `${DICEBEAR_BASE}?seed=FuBank1&backgroundColor=820AD1`,
  `${DICEBEAR_BASE}?seed=FuBank2&backgroundColor=c9a6f7`,
  `${DICEBEAR_BASE}?seed=FuBank3&backgroundColor=4c1d95`,
  `${DICEBEAR_BASE}?seed=FuBank4&backgroundColor=a855f7`,
  `${DICEBEAR_BASE}?seed=FuBank5&backgroundColor=6d28d9`,
  `${DICEBEAR_BASE}?seed=FuBank6&backgroundColor=e9d5ff`,
  `${DICEBEAR_BASE}?seed=FuBank7&backgroundColor=2a0a4a`,
  `${DICEBEAR_BASE}?seed=FuBank8&backgroundColor=8A05BE`,
];

interface AvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  userName: string;
}

export function AvatarPicker({ value, onChange, error, userName }: AvatarPickerProps) {
  const isCustom = value !== '' && !AVATAR_PRESETS.includes(value);

  return (
    <div className="space-y-3">
      <Label>Foto de perfil</Label>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary/40 bg-muted">
          {value ? (
            <img src={value} alt={`Foto de ${userName}`} className="h-full w-full object-cover" />
          ) : (
            <User size={28} className="text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Elige un avatar de la galería o pega la URL de tu propia imagen.
        </p>
      </div>

      <div role="radiogroup" aria-label="Elige un avatar" className="grid grid-cols-4 gap-3">
        {AVATAR_PRESETS.map((preset) => {
          const selected = value === preset;
          return (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Avatar ${AVATAR_PRESETS.indexOf(preset) + 1}`}
              onClick={() => onChange(preset)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-2xl border-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selected
                  ? 'border-primary shadow-[0_0_0_2px_var(--primary)]'
                  : 'border-transparent hover:border-primary/50'
              )}
            >
              <img src={preset} alt="" className="h-full w-full object-cover" loading="lazy" />
              {selected && (
                <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check size={12} aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Input
        id="avatarUrl"
        placeholder="...o pega la URL de tu imagen"
        value={isCustom ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
    </div>
  );
}
