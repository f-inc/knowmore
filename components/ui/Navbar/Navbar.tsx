import s from './Navbar.module.css';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';
// import { createServerSupabaseClient } from '@/app/supabase-server';
import Logo from '@/components/icons/Logo';
import Link from 'next/link';

export default function Navbar() {
  // const supabase = createServerSupabaseClient();
  // const {
  //   data: { user }
  // } = await supabase.auth.getUser();

  return (
    <div className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-7xl px-6 mx-auto text-sm">
        <div className="w-full relative flex flex-row justify-between py-4 align-center md:py-6">
          <div className="flex items-center flex-1">
            <Link
              href="/"
              className="inline-flex items-center text-3xl font-bold"
              aria-label="Logo"
            >
              <img className="w-[100px]" src="/tweetmore-logo.png"></img>
            </Link>
            {/* <nav className="hidden ml-6 space-x-2 lg:block">
              <Link href="/" className={s.link} >
                Pricing
              </Link>
              {user && (
                <Link href="/account" className={s.link}>
                  Account
                </Link>
              )}
            </nav> */}
          </div>
          <div className="flex items-center gap-x-6">
            {/* <div className="text-white font-semibold text-base">Login</div>
            <button className="bg-none border-2 border-[#0C8CE9] text-[#0C8CE9] text-sm px-4 py-2 font-semibold rounded-full">
              Upload CSV
            </button> */}
          </div>
          {/* <div className="flex justify-end flex-1 space-x-8"> */}
          {/* {user ? (
              <SignOutButton />
            ) : (
              <SignInButton />
            )} */}

          {/* <button className='border border-[#E85533] px-4 py-2 text-[#E85533] font-bold rounded-full hidden md:block'>
                Upload CSV
            </button> */}
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}
