import { useState, useEffect } from 'react';
import { profileService } from '../services/profile.service';
import { PublicUser, AuthError } from '@/features/auth/types/auth.types';

export function useProfile() {
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: unknown) {
      setError(err as AuthError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = globalThis.setTimeout(() => {
      void fetchProfile();
    }, 0);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
