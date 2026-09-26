import { AuthSplitLayout } from '@/features/landing/components/AuthSplitLayout';

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
