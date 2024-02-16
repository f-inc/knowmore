'use client';

import { GA_TRACKING_ID, pageview } from 'lib/gtag';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />

      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              });
          `
        }}
        // dangerouslySetInnerHTML={{
        //   __html: `
        //     (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        //     new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        //     j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        //     'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        //     })(window,document,'script','dataLayer', '${GA_TRACKING_ID}');
        // `
        // }}
      />
    </>
  );
}
