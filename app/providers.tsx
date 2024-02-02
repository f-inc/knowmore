'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { PropsWithChildren } from 'react';

if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_API_KEY ||
      'phc_Md5xHzrfQb7wfhpAn0dleigHPCQa4boDdsUkhow0zBi',
    {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
      capture_pageview: false
    }
  );

  posthog.capture('opened app');
}

export function PHProvider({ children }: PropsWithChildren) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
