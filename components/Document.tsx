'use client';

import { useSupabase } from '@/app/supabase-provider';
import { postData } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe-client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type LeadDataType = {
  document_id: string;
  email: string;
  name?: string;
  linkedIn?: string;
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
    <div className="flex flex-col justify-center items-center rounded-lg border-1 border-solid border-opacity-10 bg-opacity-10 bg-white backdrop-blur-25 mb-16 min-w-[400px]">
      <div
        className="w-full"
        style={{ filter: isSample ? 'blur(4px)' : 'none' }}
      >
        <div className="flex p-4 items-center gap-4 self-stretch border-b border-opacity-10">
          <div className="flex flex-col text-left">
            <p style={{ color: 'white', fontWeight: 700 }}>
              {lead?.name ?? lead?.email.split(/[,.;:@]+/)[0]}
            </p>
            <p style={{ color: 'white' }}>{lead?.email}</p>
          </div>
        </div>

        <div className="flex p-4 items-center gap-4">
          <p style={{ color: 'white', marginBottom: '8px' }}>
            {lead?.linkedIn ?? 'LinkedIn URL'}
          </p>
          <p style={{ color: 'white', marginBottom: '8px' }}>
            {lead?.linkedIn ?? 'LinkedIn URL'}
          </p>
        </div>
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
    }
  };

  useEffect(() => {
    console.log(id);
    if (id) {
      fetchRecord(id as string);
    }
  }, [id]);

  return (
    <div className="text-white py-20 bg-opacity-10">
      <div className="container mx-auto flex flex-col justify-center items-center text-center">
        <div className="w-full mb-8 lg:mb-0 lg:pr-8">
          <h1
            className="text-4xl lg:text-6xl font-bold mb-4 gap-4"
            style={{
              fontSize: '64px',
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
        </div>
        <div>
          {isPaid ? (
            leads.map((lead) => <Lead lead={lead} user={user} />)
          ) : (
            <>
              <Lead lead={leads[0]} user={user} />
              <Lead
                document_id={(document && document.id) || ''}
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
