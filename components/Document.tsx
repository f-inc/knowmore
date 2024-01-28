'use client';

import { useSupabase } from '@/app/supabase-provider';
import { postData } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe-client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';

type LeadDataType = {
  document_id: string;
  email: string;
  name?: string;
  linkedin?: string;
  company?: string;
  role?: string;
  location?: string;
  salary?: string;
  website?: string;
};

type LeadProps = {
  document_id?: string;
  lead?: LeadDataType;
  isSample?: boolean;
  user: User | undefined;
};

const Lead: React.FC<LeadProps> = ({ document_id, lead, isSample, user }) => {
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      return router.push(
        `/signin?redirectURL=${encodeURIComponent(window.location.pathname)}`
      );
    }

    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: {
          price: {
            active: true,
            currency: 'usd',
            description: 'sa',
            id: 'price_1ObxeLJuwzUkoN6WWWKPTrkr',
            interval: null,
            interval_count: 1,
            metadata: null,
            product_id: 'prod_PQpIXn2EWFDuev',
            trial_period_days: null,
            type: 'one_time',
            unit_amount: 4
          },
          metadata: {
            document_id
          },
          redirectURL: window.location.pathname,
          quantity: 1
        }
      });
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return alert((error as Error)?.message);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center rounded-lg border-1 border-gray-100 bg-opacity-10 bg-white backdrop-blur-25 mb-8 break-words max-w-[600px]">
      <div
        className="w-full"
        style={{ filter: isSample ? 'blur(4px)' : 'none' }}
      >

        <div className='flex items-center gap-3 p-4'>
          <div>
            <img className='w-[40px] rounded-full' src="https://pbs.twimg.com/profile_images/1677635372770029570/0K3JhmKK_400x400.jpg"></img>
          </div>

          <div className="flex items-center gap-4 self-stretch">
            <div className="flex flex-col text-left">
              <p className='text-md' style={{ color: 'white', fontWeight: 700 }}>
                {lead?.name ?? lead?.email.split(/[,.;:@]+/)[0]}
              </p>
              <p className='text-[12px] text-gray-300/50'>{lead?.email}</p>
            </div>
          </div>
        </div>

        <div className='h-[1px] bg-gray-200/10'></div>

        <div className='grid grid-cols-2 md:grid-cols-3 p-4 text-left gap-5 gap-x-8 text-sm'>
          <div>
            <p className='text-[12px] text-gray-300/60'>Company Name</p>
            <p>{lead?.company}</p>
          </div>
          <div>
            <p className='text-[12px] text-gray-300/60'>Role</p>
            <p>{lead?.role}</p>
          </div>
          <div>
            <p className='text-[12px] text-gray-300/60'>Location</p>
            <p>{lead?.location}</p>
          </div>
          <div>
            <p className='text-[12px] text-gray-300/60'>Est. Salary</p>
            <p>{lead?.salary}</p>
          </div>
          <div>
            <p className='text-[12px] text-gray-300/60'>LinkedIn</p>
            <a className='underline' href={lead?.linkedin}>
              {lead?.linkedin}
            </a>
          </div>
          <div>
            <p className='text-[12px] text-gray-300/60'>Website</p>
            <a className='underline' href={lead?.website}>
              {lead?.website}
            </a>
          </div>
        </div>
        <div className='h-[1px] bg-gray-200/10'></div>

        {/* <div className="flex p-4 items-center gap-4">
          <p style={{ color: 'white', marginBottom: '8px' }}>
            {lead?.linkedIn ?? 'LinkedIn URL'}
          </p>
          <p style={{ color: 'white', marginBottom: '8px' }}>
            {lead?.linkedIn ?? 'LinkedIn URL'}
          </p>
        </div> */}
      </div>
      {isSample && (
        <button
          style={{
            borderRadius: '64px',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            background: 'rgba(255, 255, 255, 0.10)',
            padding: 10,
            position: 'absolute'
          }}
          onClick={async () => {
            // if (!user) {
            //   router.push(
            //     `/signin?redirect=${encodeURIComponent(
            //       window.location.pathname
            //     )}`
            //   );
            // } else {
            //     createStripeCheckoutSession(user.id, 'price_1JZ9ZtJZ9ZtJZ9ZtJZ9ZtJZ9')
            // }
            await handleCheckout();
          }}
        >
          {user ? 'Subscribe to view' : 'Login to view'}
        </button>
      )}
    </div>
  );
};

export default function Document({
  id,
  user
}: {
  id: string;
  user: User | undefined;
}) {
  const { supabase } = useSupabase();

  const [document, setDocument] = useState<any>();
  const [leads, setLeads] = useState<LeadDataType[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  const fetchRecord = async (id: string) => {
    console.log(id);
    const { data: recordData, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('document_id', id);

    if (leadData) {
      console.log(leadData);
      setLeads(leadData as LeadDataType[]);
    }

    if (error) {
      console.log(error);
      return;
    }

    if (recordData) {
      setDocument(recordData);
      setIsPaid(recordData.paid);
      setIsProcessed(recordData.processed_rows);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (id && !isProcessed) {
        fetchRecord(id as string);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [id, isProcessed]);

  return (
    <div className="text-white py-20 px-5 bg-opacity-10">
      <div className="container mx-auto flex flex-col justify-center items-center text-center">
        <div className="w-full mb-8 lg:mb-0 lg:pr-8 ">
          <h1
            className="text-4xl lg:text-5xl font-bold mb-4 gap-4"
            style={{
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '110%',
              background:
                'linear-gradient(146deg, #FFF 45.88%, rgba(255, 255, 255, 0.50) 88.34%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            We detected {leads.length} {leads.length > 1 ? 'emails' : 'email'}
          </h1>
          <p className='max-w-md text-center m-auto text-gray-300 text-sm'>Our AI bot scrapes every B2B lead you pull from your website so that you know exactly who your potential customers are. Stop leaving money on the table.</p>
        </div>
        <div className='mt-10'>
          {isPaid ? (isProcessed ? (
            leads.map((lead) => <Lead lead={lead} user={user} />)
          ) : (
            <>
              <div className="loading-spinner py-10">
                <BarLoader className='m-auto' color="white" />
                <p className='text-xs text-center mt-5'>processing your file</p>
              </div>
            </>
          )) : (
            <>
              <Lead
                document_id={(id)}
                isSample
                user={user}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
