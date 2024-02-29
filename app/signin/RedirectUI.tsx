'use client';

import { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function RedirectUI({ user }: { user: User }) {
  useEffect(() => {
    posthog.identify(user.id, {
      email: user.email
    });
  }, []);

  const searchParams = new URLSearchParams(window.location.search);

  const redirectURL = searchParams.get('redirectURL') || '/dashboard';

  return redirect(redirectURL as string);
}
