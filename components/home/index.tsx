'use client';

// import { useSupabase } from '@/app/supabase-provider';
import Form from './Form';
import { AnalyticsEvents } from '@/utils/constants/AnalyticsEvents';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import posthog from 'posthog-js';
import { ChangeEvent, useState } from 'react';
import { useCallback } from 'react';
import { BarLoader, ClipLoader, DotLoader } from 'react-spinners';
import { v4 as uuid } from 'uuid';

interface Props {
  user: User | null | undefined;
}

export default function Home({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [blurData, setBlurData] = useState(false);

  // const { supabase } = useSupabase();

  // const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  //   posthog.capture(AnalyticsEvents.Upload.FileUploading);
  //   await toggleLoading();
  //   console.log('loading...');
  //   const file = e.target.files && e.target.files[0];

  //   // validate the file to see if it has a column named email.
  //   // if it does, then we can upload it.

  //   if (file && file.name.endsWith('.csv')) {
  //     try {
  //       Papa.parse(file!, {
  //         complete: async function (results) {
  //           // Go through each row and find any email using regex and add it to set.
  //           const emails = new Set<string>();
  //           for (const row of results.data) {
  //             for (const cell of row as any) {
  //               const emailRegex = /\S+@\S+\.\S+/;
  //               if (emailRegex.test(cell)) {
  //                 emails.add(cell);
  //               }
  //             }
  //           }

  //           if (emails.size === 0) {
  //             throw new Error('No emails found');
  //           }

  //           const id = uuid();

  //           // Upload the file to storage.
  //           const filePath = `public/${id}.csv`;
  //           const bucket = 'documents';
  //           const { data: uploadData, error: uploadError } =
  //             await supabase.storage.from(bucket).upload(filePath, file);

  //           if (uploadError) {
  //             console.error('Error uploading CSV:', uploadError.message);
  //             return;
  //           }

  //           // Insert the document into the documents table.
  //           const { data: insertData, error: insertError } = await supabase
  //             .from('documents')
  //             .insert([
  //               {
  //                 id,
  //                 storage_path: filePath,
  //                 owner: user?.id,
  //                 customer_to_email: user?.email,
  //                 total_leads: emails.size
  //               }
  //             ]);

  //             fetch('/api/uploaded', {
  //               method: 'POST',
  //               headers: {
  //                 'Content-Type': 'application/json'
  //               },
  //               body: JSON.stringify({ document_id: id })
  //             });

  //           if (insertError) {
  //             console.error(
  //               'Error inserting row into documents table:',
  //               insertError.message
  //             );
  //             return;
  //           }

  //           // Create lead entries for each email.

  //           const emailArray = Array.from(emails);
  //           const emailObjects = emailArray.map((email) => ({
  //             email,
  //             document_id: id
  //           }));
  //           const { data: leadInsertData, error: leadInsertError } =
  //             await supabase.from('leads').insert(emailObjects);

  //           if (leadInsertError) {
  //             console.error(
  //               'Error inserting row into leads table:',
  //               leadInsertError.message
  //             );
  //             return;
  //           }

  //           router.push(`/view/${id}`);
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error uploading CSV:', error);
  //     }
  //   }
  // };

  async function toggleLoading() {
    setLoading(!loading);
  }

  const handleBlurToggle = () => {
    setBlurData(!blurData);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto min-h-screen px-6">
        <div className="text-white py-10 md:py-20 bg-opacity-10">
          <div className="container flex flex-col lg:flex-row justify-between items-center">
            <div className="flex flex-col w-full items-center gap-y-8">
              <h1
                className="text-5xl lg:text-[64px] font-bold gap-4 max-w-[45rem] text-center"
                style={{
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '110%',
                  letterSpacing: '-1.28px',
                  background:
                    'linear-gradient(146deg, #FFF 45.88%, rgba(255, 255, 255, 0.50) 88.34%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                A personal brand coach for your Twitter.
              </h1>
              <p className="text-sm md:text-lg text-gray-300 max-w-lg text-center">
                Our AI bot scrapes your Twitter and helps you come up with
                tweets that don’t suck.
              </p>
            </div>
          </div>
          <Form />

          {/* <LogoCloud /> */}
        </div>
      </div>
      <div className="flex justify-center">
        <h1
          className="text-3xl lg:text-5xl font-bold gap-4 text-center px-4"
          style={{
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '110%',
            letterSpacing: '-1.28px',
            background:
              'linear-gradient(146deg, #FFF 45.88%, rgba(255, 255, 255, 0.50) 88.34%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Latest generated tweets from the community.{' '}
        </h1>
      </div>

      <div className="flex justify-center mt-12 mb-28">
        <div className=" grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            className="px-6 py-5 rounded-2xl flex gap-5 items-center"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(0, 0, 0, 0.15)'
            }}
          >
            <img className="w-16" src="icon1.png"></img>
            <div className="flex flex-col gap-2">
              <a className="text-[#0C8CE9] text-base">@elonmusk</a>
              <p className="text-[#FFFFFFCC] text-base font-medium max-w-[15rem]">
                Cybertruck handles like a sports car because it is one.
              </p>
            </div>
          </div>
          <div
            className="px-6 py-5 rounded-2xl flex gap-5 items-center"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(0, 0, 0, 0.15)'
            }}
          >
            <img className="w-16" src="icon2.png"></img>
            <div className="flex flex-col gap-2">
              <a className="text-[#0C8CE9] text-base">@aggressivepet</a>
              <p className="text-[#FFFFFFCC] text-base font-medium max-w-[15rem]">
                i dont like to overshare unless its with people i love{' '}
              </p>
            </div>
          </div>
          <div
            className="px-6 py-5 rounded-2xl flex gap-5 items-center"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(0, 0, 0, 0.15)'
            }}
          >
            <img className="w-16" src="icon3.png"></img>
            <div className="flex flex-col gap-2">
              <a className="text-[#0C8CE9] text-base">@dril</a>
              <p className="text-[#FFFFFFCC] text-base font-medium max-w-[15rem]">
                im getting so tired of jordan peterson that im gonna start
                calling him jordan jenkins{' '}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
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
