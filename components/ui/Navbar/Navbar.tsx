'use client';

import s from './Navbar.module.css';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';
import { useSupabase } from '@/app/supabase-provider';
import Logo from '@/components/icons/Logo';
import useAuthStore from '@/stores/auth';
import { Database } from '@/types_db';
import {
  User,
  createClientComponentClient
} from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { supabase } = useSupabase();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then((u) => setUser(u.data.user));

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  return (
    <div className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-6xl px-6 mx-auto text-sm">
        <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
          <div className="flex items-center flex-1">
            <Link
              href="/"
              className="inline-flex items-center text-3xl font-bold"
              aria-label="Logo"
            >
              <img className="w-[100px]" src="/logo.png"></img>
            </Link>
            <nav className="hidden ml-6 space-x-2 lg:block">
              {/* <Link href="/" className={s.link} >
                Pricing
              </Link> */}
              {user !== null && (
                <Link href="/dashboard" className={s.link}>
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="flex justify-end flex-1 space-x-8">
            {user !== null ? <SignOutButton /> : <SignInButton />}

            {/* <button className='border border-[#E85533] px-4 py-2 text-[#E85533] font-bold rounded-full hidden md:block'>
                Upload Emails (.csv)
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
