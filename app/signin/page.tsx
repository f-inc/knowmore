import AuthUI from './AuthUI';
import { getSession } from '@/app/supabase-server';
import Logo from '@/components/icons/Logo';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/router';

export default async function SignIn() {
  const session = await getSession();

  if (session) {
    // const redirectURL = query.redirectURL || '/account'; // Use the query parameter or specify a default redirect URL

    // const redirectURL = (query.redirectURL as string) || '/account';
    return redirect('/account');
  }

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <Link
          href="/"
          className="inline-flex justify-center items-center text-3xl font-bold"
          aria-label="Logo"
        >
          <span className="inline-flex items-center leading-6 font-medium transition ease-in-out duration-75 cursor-pointer text-[#000000] rounded-md p-1">
            knowmore
          </span>
        </Link>
        <AuthUI />
      </div>
    </div>
  );
}
