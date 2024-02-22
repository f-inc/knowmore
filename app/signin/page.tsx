import AuthUI from './AuthUI';
import RedirectUI from './RedirectUI';
import { getSession } from '@/app/supabase-server';
import Link from 'next/link';
import posthog from 'posthog-js';

export default async function SignIn() {
  const session = await getSession();

  if (session) {
    posthog.identify(session.user.id);
    return <RedirectUI></RedirectUI>;
  }

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <Link
          href="/"
          className="inline-flex justify-center items-center text-3xl font-bold"
          aria-label="Logo"
        >
          <Link
            href="/"
            className="inline-flex items-center text-3xl font-bold mb-5"
            aria-label="Logo"
          >
            <img className="w-[100px]" src="/logo.png"></img>
          </Link>
        </Link>
        <AuthUI />
      </div>
    </div>
  );
}
