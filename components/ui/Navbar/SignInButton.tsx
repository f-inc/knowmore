'use client';

import s from './Navbar.module.css';
import Link from 'next/link';

export default function SignInButton() {
  return (
    <Link href={`/signin?redirectURL=${encodeURIComponent(window.location.pathname)}`} className={s.link}>
      Sign in
    </Link>
  );
}
