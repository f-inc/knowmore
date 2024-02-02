'use client';

import { useEffect } from 'react';
import s from './Navbar.module.css';
import Link from 'next/link';

export default function SignInButton() {

  var href = `/signin?redirectURL=${encodeURIComponent(window.location.pathname)}`;
  
  return (
    <Link href={href} className={s.link}>
      Sign in
    </Link>
  );
}
