'use client';

import CheckoutCard from './CheckoutCard';
import { useSupabase } from '@/app/supabase-provider';
import { User } from '@supabase/supabase-js';
import Papa from 'papaparse';
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
  education?: string;
};

export default function Document({
  id,
  user,
  lead_limit
}: {
  id: string;
  user: User | undefined;
  lead_limit: number;
}) {
  const { supabase } = useSupabase();
  const [document, setDocument] = useState<any>();
  const [leads, setLeads] = useState<LeadDataType[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadDataType[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  const downloadCsv = () => {
    console.log(leads);
    const leadsWithoutDocumentId = leads.map((item) => ({
      email: item.email,
      company: item.company,
      role: item.role,
      location: item.location,
      linkedin: item.linkedin,
      website: item.website
    }));
    const csvData = Papa.unparse(leadsWithoutDocumentId, { header: true });

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const fetchRecord = async (id: string) => {
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
      const filteredLeadData = leadData.filter((lead) => lead.processed);

      setFilteredLeads(filteredLeadData as LeadDataType[]);
      setLeads(leadData as LeadDataType[]);
    }

    if (error) {
      console.log(error);
      return;
    }

    if (recordData) {
      setDocument(recordData);
      setIsPaid(recordData.paid);
      setIsProcessed(
        filteredLeads?.length == leadData?.length || recordData.processed
      );
    }
  };

  const fetchData = async (id: string) => {
    if (id && !isProcessed) {
      fetchRecord(id as string);
    }
  };

  useEffect(() => {
    fetchData(id as string);
    const interval = setInterval(() => {
      if (!isProcessed) {
        fetchData(id as string);
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
          <p className="max-w-md text-center m-auto text-gray-300 text-sm">
            Our AI bot scrapes every B2B lead you pull from your website so that
            you know exactly who your potential customers are. Stop leaving
            money on the table.
          </p>
        </div>
        <div className="mt-10">
          {isPaid ? (
            <div className="text-right text-xs px-5">
              {isProcessed && (
                <>
                  <p className="mt-3">
                    Processed all {leads.length} results, please download the
                    CSV file.
                  </p>
                  <button
                    onClick={downloadCsv}
                    className="mt-3 px-4 py-2 bg-[#E85533] text-white rounded-full text-sm hover:bg-orange-700 focus:outline-none"
                  >
                    Download CSV
                  </button>
                </>
              )}

              {!isProcessed && (
                <div className="loading-spinner py-10">
                  <BarLoader className="m-auto" color="white" />
                  <p className="text-xs text-center mt-5">
                    {filteredLeads.length} / {leads.length} leads processed
                  </p>
                </div>
              )}

              <div className="overflow-x-auto max-w-[90vw] text-left">
                <table className="border table-auto text-sm text-gray-200 mt-5">
                  <thead className="bg-orange-100/10">
                    <tr>
                      <th className="py-2 px-4 border">Email</th>
                      <th className="py-2 px-4 border">Company Name</th>
                      <th className="py-2 px-4 border">Role</th>
                      <th className="py-2 px-4 border">Location</th>
                      <th className="py-2 px-4 border">linkedin</th>
                      <th className="py-2 px-4 border">Website</th>
                      <th className="py-2 px-4 border">Education</th>
                    </tr>
                  </thead>
                  <tbody className="bg-orange-100/5">
                    {filteredLeads.map((lead, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border">{lead?.email}</td>
                        <td className="py-2 px-4 border">{lead?.company}</td>
                        <td className="py-2 px-4 border">{lead?.role}</td>
                        <td className="py-2 px-4 border">{lead?.location}</td>
                        <td className="py-2 px-4 border">
                          <a
                            className="underline "
                            href={lead?.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {lead?.linkedin}
                          </a>
                        </td>
                        <td className="py-2 px-4 border">
                          <a
                            className="underline"
                            href={lead?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {lead?.website}
                          </a>
                        </td>
                        <td className="py-2 px-4 border">{lead?.education}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {isProcessed && filteredLeads.length > 20 && (
                  <p className="mt-3 text-center">
                    To view all of your results please{' '}
                    <a
                      className="underline cursor-pointer"
                      onClick={downloadCsv}
                    >
                      download the CSV file
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {user && leads.length >= lead_limit ? (
                <div className="text-center text-sm bg-gray-100/20 p-5 rounded-xl max-w-[600px]">
                  <p>
                    The number of emails that you're trying to process exceeds
                    our current limit. Our team has been notified with your
                    email — we'll be in touch!
                  </p>
                </div>
              ) : (
                <CheckoutCard document_id={id} user={user} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
