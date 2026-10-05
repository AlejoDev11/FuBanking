import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Crea tu cuenta</h2>
      <p className="text-muted-foreground mb-8">
        Empieza a manejar tu dinero de forma digital.
      </p>
      <RegisterForm />
    </div>
  );
}
