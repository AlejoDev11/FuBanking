import { AuthSplitLayout } from '@/features/landing/components/AuthSplitLayout';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
