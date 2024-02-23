'use client';

import { useSupabase } from '@/app/supabase-provider';
import { getURL } from '@/utils/helpers';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthUI() {
  const { supabase } = useSupabase();

  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);

          return redirect(
            (searchParams.has('redirectURL')
              ? searchParams.get('redirectURL')
              : '/') || ''
          );
        }
      }
    });
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <Auth
        supabaseClient={supabase}
        providers={['google']}
        redirectTo={getURL()}
        magicLink={false}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#404040',
                brandAccent: '#52525b'
              }
            }
          }
        }}
        theme="dark"
      />
    </div>
  );
}
