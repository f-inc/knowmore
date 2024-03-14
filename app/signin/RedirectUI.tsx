'use client';

import { User } from '@supabase/supabase-js';
import { redirect, useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function RedirectUI({ user }: { user: User }) {
  // const searchParams = new URLSearchParams(window.location.search);

  // const redirectURL = searchParams.get('redirectURL') || '/dashboard';

  // return redirect(redirectURL as string);

  const router = useRouter();

  useEffect(() => {
    // Now that we're inside useEffect, it's safe to use window because this code runs on the client side.
    const searchParams = new URLSearchParams(window.location.search);
    const redirectURL = searchParams.get('redirectURL') || '/dashboard';

    // Using Next.js's useRouter hook to navigate.
    router.push(redirectURL);
  }, [router]);

  return null;
}
