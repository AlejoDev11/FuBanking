import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Inicia sesión</h2>
      <p className="text-muted-foreground mb-8">
        Bienvenido de vuelta a tu cuenta.
      </p>
      <LoginForm />
    </div>
  );
}
