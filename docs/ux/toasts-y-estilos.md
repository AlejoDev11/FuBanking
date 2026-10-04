# Toasts y estilos

Fuente: `FUBANKING_HANDOFF.md` §8 (convenciones permanentes).

```ts
import { useToast } from '@/shared/components/feedback/ToastProvider';
const toast = useToast();
toast.success('Operación realizada', 'Detalle breve.');
toast.error('No pudimos completar la operación', 'Detalle breve.');
```

`success|error|info|warning`. Inline para correcciones de formulario, toast para resultado. Nunca `alert()`.

Estética banking: tokens `bg-card border foreground muted primary`, iconos `lucide-react`, sin landing en rutas app, sin tarjeta-dentro-de-tarjeta, layouts densos y profesionales, mobile responsive.

Estructura por módulo:

```txt
frontend/src/features/<module>/{components,hooks,services,types}
```
