'use client';

import s from './Navbar.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SignInButton() {
  const [href, setHref] = useState('/signin');

  useEffect(() => {
    const pathname = window.location.pathname;
    const redirectURL =
      pathname === '/signin' || pathname === '/'
        ? ''
        : `?redirectURL=${encodeURIComponent(pathname)}`;

    const signinPath = `/signin${redirectURL}`;

    setHref(signinPath);
  }, []);

  return (
    <Link href={href} className={s.link}>
      Sign in
    </Link>
  );
}
