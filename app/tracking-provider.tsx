'use client';

import * as fbq from '@/lib/fb-pixel';
import * as gtag from '@/lib/gtag';
import React, { useEffect } from 'react';

export const TrackingProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    gtag.pageview(window.location.pathname + window.location.search);
    fbq.pageview();

    return () => {
      // You can add any cleanup logic here if needed
    };
  }, []);

  return <>{children}</>;
};
