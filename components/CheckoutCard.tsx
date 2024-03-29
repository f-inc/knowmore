'use client';

import { AnalyticsEvents } from '@/utils/constants/AnalyticsEvents';
import { DocumentType } from '@/utils/constants/types';
import { createOneTimeCheckoutSession, getStripe } from '@/utils/stripe-client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import React, { use, useCallback, useEffect, useState } from 'react';

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

type LeadCardProps = {
  document: any;
  lead?: LeadDataType;
  user: User | undefined;
  price?: number;
};

const CheckoutCard: React.FC<LeadCardProps> = ({
  document,
  lead,
  user,
  price
}) => {
  const router = useRouter();

  const [numLeads, setNumLeads] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType>('email');

  useEffect(() => {
    if (!document || document?.paid || !document?.total_leads) return;

    setNumLeads(document?.total_leads);
    setDocumentType(document?.type);
  }, [document]);

  const handleCheckout = async () => {
    if (!user) {
      posthog.capture(AnalyticsEvents.Upload.UserLoggingIn);
      return router.push(
        `/signin?redirectURL=${encodeURIComponent(window.location.pathname)}`
      );
    }

    const priceID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    const productID = process.env.NEXT_PUBLIC_STRIPE_PRODUCT_ID;
    const document_id = document?.id;

    if (!priceID) throw new Error('Stripe price ID is not defined');
    if (!productID) throw new Error('Stripe product ID is not defined');
    if (!document_id) throw new Error('Document ID is not defined');

    try {
      const { sessionId } = await createOneTimeCheckoutSession({
        priceId: priceID,
        quantity: numLeads,
        metadata: { document_id, document_type: documentType }
      });

      posthog.capture(AnalyticsEvents.Checkout.CheckoutCreated, {
        document_id
      });

      const stripe = await getStripe();

      posthog.capture(AnalyticsEvents.Checkout.CheckoutStarted, {
        document_id
      });

      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      posthog.capture(AnalyticsEvents.Checkout.CheckoutFailed, {
        document_id,
        error
      });
      console.error('Error:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center rounded-lg border-1 border-gray-100 bg-opacity-10 bg-white backdrop-blur-25 mb-8 break-words max-w-[600px] relative">
      <div className="w-full" style={{ filter: 'blur(4px)' }}>
        <div className="flex items-center gap-3 p-4">
          <div>
            <img
              className="w-[40px] rounded-full"
              src="https://pbs.twimg.com/profile_images/1511848135840047105/O1bLN9Qg_400x400.jpg"
            />
          </div>

          <div className="flex items-center gap-4 self-stretch">
            <div className="flex flex-col text-left">
              <p
                className="text-md"
                style={{ color: 'white', fontWeight: 700 }}
              >
                {lead?.name ?? lead?.email.split(/[,.;:@]+/)[0]}
              </p>
              <p className="text-[12px] text-gray-300/50">{lead?.email}</p>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200/10"></div>

        <div className="grid grid-cols-2 md:grid-cols-3 p-4 text-left gap-5 gap-x-8 text-sm">
          <div>
            <p className="text-[12px] text-gray-300/60">Company Name</p>
            <p>{lead?.company}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-300/60">Role</p>
            <p>{lead?.role}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-300/60">Location</p>
            <p>{lead?.location}</p>
          </div>
          <div>
            <p className="text-[12px] text-gray-300/60">linkedin</p>
            <a className="underline" href={lead?.linkedin}>
              {lead?.linkedin}
            </a>
          </div>
          <div>
            <p className="text-[12px] text-gray-300/60">Website</p>
            <a className="underline" href={lead?.website}>
              {lead?.website}
            </a>
          </div>
        </div>
        <div className="h-[1px] bg-gray-200/10"></div>
      </div>

      <div
        style={{
          position: 'absolute'
        }}
      >
        <button
          style={{
            borderRadius: '64px',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            background: 'rgba(255, 255, 255, 0.10)',
            padding: 10
          }}
          onClick={async () => {
            await handleCheckout();
          }}
        >
          {user
            ? `Process ${numLeads} ${documentType}s 
            ${price ? `at $${price} per lead` : ''}`
            : 'Login to view'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutCard;
