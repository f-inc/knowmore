'use client';

import * as fbq from '@/lib/fb-pixel';
import * as gtag from '@/lib/gtag';
import React, { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

export const TrackingProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    gtag.pageview(window.location.pathname + window.location.search);
    fbq.pageview();

    return () => {};
  }, []);

  return <>{children}</>;
};
