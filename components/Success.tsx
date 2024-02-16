'use client';

import { useSupabase } from '@/app/supabase-provider';
import { transaction } from '@/lib/gtag';
import * as pixel from '@/lib/gtag';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

type SuccessProps = {};

const Success: React.FC<SuccessProps> = () => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const document_id = searchParams.get('document_id');

    if (document_id) {
      transaction(document_id, 7);
      redirect(`/view/${document_id}`);
    }
  }, []);

  return <div></div>;
};

export default Success;
