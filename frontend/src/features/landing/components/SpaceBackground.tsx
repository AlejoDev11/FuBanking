'use client';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

/**
 * Generador pseudoaleatorio determinista para el fondo decorativo.
 * Evita Math.random: las estrellas son idénticas en cada carga y no se usan
 * para ningún propósito sensible a seguridad.
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    const x = Math.sin(state * 9999 + 7) * 10000;
    state += 1;
    return x - Math.floor(x);
  };
}

function generateStars(count: number): Star[] {
  const random = createSeededRandom(20260214);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: random() * 100,
    y: random() * 100,
    size: random() * 2 + 1,
    delay: random() * 5,
    duration: random() * 3 + 2,
  }));
}

const STARS: Star[] = generateStars(60);

export function SpaceBackground() {
  const stars = STARS;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a1a]">
      {/* Nebula gradients */}
      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px] animate-nebula-drift" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/8 blur-[100px] animate-nebula-drift-reverse" />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Planet */}
      <div className="absolute bottom-[10%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-br from-primary/40 to-purple-900/60 shadow-[0_0_60px_rgba(130,10,209,0.3)] animate-planet-float" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
    </div>
  );
}
