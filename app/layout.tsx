import SupabaseProvider from './supabase-provider';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import posthog from 'posthog-js';
import { PropsWithChildren, useEffect } from 'react';
import 'styles/main.css';
import { PHProvider } from './providers';
import dynamic from 'next/dynamic';
import { Plus_Jakarta_Sans } from 'next/font/google';

const meta = {
  title: 'Know More Bot',
  description:
    'Our AI bot scrapes every B2B lead you pull from your website so that you know exactly who your potential customers are. Stop leaving money on the table.',
  cardImage: '/og.png',
  robots: 'follow, index',
  favicon: '/favicon.ico',
  url: 'https://knowmore.bot',
  type: 'website'
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800']
});

export const metadata = {
  title: meta.title,
  description: meta.description,
  cardImage: meta.cardImage,
  robots: meta.robots,
  favicon: meta.favicon,
  url: meta.url,
  type: meta.type,
  openGraph: {
    url: meta.url,
    title: meta.title,
    description: meta.description,
    cardImage: meta.cardImage,
    type: meta.type,
    site_name: meta.title
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vercel',
    title: meta.title,
    description: meta.description,
    cardImage: meta.cardImage
  }
};

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false
});

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children
}: PropsWithChildren) {
  return (
    <html lang="en">
      <PHProvider>
        <body className="bg-[#010b13] loading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1244 303"
            fill="none"
            className="absolute -z-50"
          >
            <g opacity="0.3" filter="url(#filter0_f_0_70)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M188 -112C286.902 25.8278 444.489 115 622 115C799.511 115 957.098 25.8278 1056 -112H188Z"
                fill="#0C8CE9"
              />
              <path
                d="M622 114.5C445.002 114.5 287.825 25.757 188.975 -111.5H1055.02C956.175 25.757 798.998 114.5 622 114.5Z"
                stroke="black"
              />
            </g>
            <defs>
              <filter
                id="filter0_f_0_70"
                x="0"
                y="-300"
                height="603"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feGaussianBlur
                  stdDeviation="94"
                  result="effect1_foregroundBlur_0_70"
                />
              </filter>
            </defs>
          </svg>
          {/* <SupabaseProvider> */}
          <Navbar />
          <main
            id="skip"
            className={`min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)] ${jakarta.className}`}
          >
            <PostHogPageView />
            {children}
          </main>
          {/* <Footer /> */}
          {/* </SupabaseProvider> */}
        </body>
      </PHProvider>
    </html>
  );
}

export const revalidate = 0;
