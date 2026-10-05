import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1">Recupera tu acceso</h2>
      <p className="text-muted-foreground mb-8">
        Te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
