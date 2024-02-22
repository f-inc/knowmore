'use client';

import s from './Navbar.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SignInButton() {
  const [href, setHref] = useState('/signin');

  useEffect(() => {
    const path = `/signin?redirectURL=${encodeURIComponent(
      window.location.pathname
    )}`;
    setHref(path);
  }, []);

  return (
    <Link href={href} className={s.link}>
      Sign in
    </Link>
  );
}
