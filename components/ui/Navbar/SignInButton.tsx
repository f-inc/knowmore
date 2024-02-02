'use client';

import { useEffect } from 'react';
import s from './Navbar.module.css';
import Link from 'next/link';

export default function SignInButton() {

  var href = "/signin";

  useEffect(() => {
    // This code will only run on the client side
    href = `/signin?redirectURL=${encodeURIComponent(window.location.pathname)}`;
    // Use window.location.href if you want to navigate immediately
    console.log(href);
  }, []); // Empty dependency array ensures that the useEffect runs only once


  
  return (
    <Link href={href} className={s.link}>
      Sign in
    </Link>
  );
}
