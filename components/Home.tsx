'use client';

import { useSupabase } from '@/app/supabase-provider';
import { transaction } from '@/lib/gtag';
import { AnalyticsEvents } from '@/utils/constants/AnalyticsEvents';
import { CommonEmailProviders } from '@/utils/constants/EmailProviders';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { useEffect } from 'react';

interface Props {
  user: User | null | undefined;
}

export default function Home({ user }: Props) {
  const router = useRouter();

  const handleGetStarted = () => {
    posthog.capture(AnalyticsEvents.Landing.GetStartedClicked);
    router.push('/signin');
  };

  const handleLearnMore = () => {
    posthog.capture(AnalyticsEvents.Landing.LearnMoreClicked);
    router.push('/case-studies');
  };

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    } else {
      console.log('user:', user);
      router.push('/signin');
    }
  }, [user]);

  return null;

  // return (
  //   <div className="max-w-6xl mx-auto min-h-screen px-6">
  //     <div className="text-white py-10 md:py-20 bg-opacity-10">
  //       <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center">
  //         <div className="flex flex-col w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-8 gap-8">
  //           <h1
  //             className="text-5xl lg:text-[64px] font-bold gap-4"
  //             style={{
  //               fontStyle: 'normal',
  //               fontWeight: 700,
  //               lineHeight: '110%',
  //               letterSpacing: '-1.28px',
  //               background:
  //                 'linear-gradient(146deg, #FFF 45.88%, rgba(255, 255, 255, 0.50) 88.34%)',
  //               backgroundClip: 'text',
  //               WebkitBackgroundClip: 'text',
  //               WebkitTextFillColor: 'transparent'
  //             }}
  //           >
  //             Turn website leads into paid customers fast.
  //           </h1>
  //           <p className="text-sm md:text-lg text-gray-300">
  //             Unlock key AI-powered insights based on emails you’ve collected
  //             from leads and customers. Stop leaving money on the table.
  //           </p>

  //           <div
  //             style={{
  //               display: 'flex',
  //               flexDirection: 'row',
  //               alignItems: 'center',
  //               gap: '10px',
  //               alignSelf: 'stretch',
  //               borderRadius: '16px'
  //             }}
  //           >
  //             <div
  //               className="bg-[#E85533] hover:bg-orange-700"
  //               style={{
  //                 display: 'flex',
  //                 padding: '16px 26px',
  //                 justifyContent: 'center',
  //                 alignItems: 'center',
  //                 gap: '8px',
  //                 borderRadius: '56px',
  //                 border: '1px solid rgba(255, 255, 255, 0.15)',
  //                 boxShadow: '0px 0px 28px 0px rgba(255, 255, 255, 0.15)',
  //                 fontWeight: 700,
  //                 cursor: 'pointer'
  //               }}
  //               onClick={handleGetStarted}
  //             >
  //               Get Started <FontAwesomeIcon icon="arrow-right" />
  //             </div>
  //             <div
  //               className="hover:bg-orange-700"
  //               style={{
  //                 display: 'flex',
  //                 padding: '16px 26px',
  //                 justifyContent: 'center',
  //                 alignItems: 'center',
  //                 gap: '8px',
  //                 borderRadius: '56px',
  //                 border: '1px solid rgba(255, 255, 255, 0.15)',
  //                 fontWeight: 700,
  //                 cursor: 'pointer',
  //                 background: 'rgba(0, 0, 0, 0.15)'
  //               }}
  //               onClick={handleLearnMore}
  //             >
  //               Learn more
  //             </div>
  //           </div>
  //         </div>
  //         <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
  //           <Image
  //             alt="hero"
  //             src={'/hero-image.png'}
  //             width={400}
  //             height={400}
  //           />
  //         </div>
  //       </div>

  //       <div className="my-24">
  //         <h1
  //           className="text-4xl max-w-md gap-4 text-center m-auto"
  //           style={{
  //             fontStyle: 'normal',
  //             fontWeight: 700,
  //             lineHeight: '110%',
  //             letterSpacing: '-1.28px',
  //             background:
  //               'linear-gradient(146deg, #FFF 45.88%, rgba(255, 255, 255, 0.50) 88.34%)',
  //             backgroundClip: 'text',
  //             WebkitBackgroundClip: 'text',
  //             WebkitTextFillColor: 'transparent'
  //           }}
  //         >
  //           Make every lead worth so much more.
  //         </h1>
  //         <div className="mt-14 flex flex-col md:flex-row gap-5">
  //           <div
  //             className="p-5 py-6 rounded-[15px] flex gap-5 items-center"
  //             style={{
  //               border: '1px solid rgba(255, 255, 255, 0.15)',
  //               background: 'rgba(0, 0, 0, 0.15)'
  //             }}
  //           >
  //             <img className="h-[50px]" src="icon1.png"></img>
  //             <div className="flex flex-col gap-2">
  //               <p className="text-[#E85533] text-sm">User insights</p>
  //               <p className="text-gray-200 text-xs">
  //                 See Linkedin breakdowns of leads who submit a form on your
  //                 site.
  //               </p>
  //             </div>
  //           </div>
  //           <div
  //             className="p-5 py-6 rounded-[15px] flex gap-5 items-center"
  //             style={{
  //               border: '1px solid rgba(255, 255, 255, 0.15)',
  //               background: 'rgba(0, 0, 0, 0.15)'
  //             }}
  //           >
  //             <img className="h-[50px]" src="icon2.png"></img>
  //             <div className="flex flex-col gap-2">
  //               <p className="text-[#E85533] text-sm">Company insights</p>
  //               <p className="text-gray-200 text-xs">
  //                 Find out which companies are the most interested in your
  //                 product.
  //               </p>
  //             </div>
  //           </div>
  //           <div
  //             className="p-5 py-6 rounded-[15px] flex gap-5 items-center"
  //             style={{
  //               border: '1px solid rgba(255, 255, 255, 0.15)',
  //               background: 'rgba(0, 0, 0, 0.15)'
  //             }}
  //           >
  //             <img className="h-[50px]" src="icon3.png"></img>
  //             <div className="flex flex-col gap-2">
  //               <p className="text-[#E85533] text-sm">Role insights</p>
  //               <p className="text-gray-200 text-xs">
  //                 Tailor your product positioning to exactly who your customers
  //                 are.
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <LogoCloud />
  //     </div>
  //   </div>
  // );
}

function LogoCloud() {
  return (
    <div>
      <p className="mt-24 text-xs uppercase text-zinc-400 text-center font-bold tracking-[0.3em]">
        Brought to you by
      </p>
      <div className="flex flex-col items-center my-12 space-y-4 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-2xl sm:grid sm:gap-6 sm:grid-cols-5">
        <div className="flex items-center justify-start">
          <a href="https://nextjs.org" aria-label="Next.js Link">
            <img
              src="/nextjs.svg"
              alt="Next.js Logo"
              className="h-12 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://vercel.com" aria-label="Vercel.com Link">
            <img
              src="/vercel.svg"
              alt="Vercel.com Logo"
              className="h-6 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://stripe.com" aria-label="stripe.com Link">
            <img
              src="/stripe.svg"
              alt="stripe.com Logo"
              className="h-12 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://supabase.io" aria-label="supabase.io Link">
            <img
              src="/supabase.svg"
              alt="supabase.io Logo"
              className="h-10 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start">
          <a href="https://github.com" aria-label="github.com Link">
            <img
              src="/github.svg"
              alt="github.com Logo"
              className="h-8 text-white"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
