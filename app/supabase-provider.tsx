'use client';

import useAuthStore from '@/stores/auth';
import type { Database } from '@/types_db';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { createContext, useContext, useEffect, useState } from 'react';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createPagesBrowserClient());
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          posthog.identify(session.user.id, {
            email: session.user.email,
            name: session.user.user_metadata.full_name
          });
        } else if (event === 'SIGNED_OUT') {
          posthog.reset();
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
};
