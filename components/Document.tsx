'use client';

import CheckoutCard from './CheckoutCard';
import { useSupabase } from '@/app/supabase-provider';
import { postData } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe-client';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { BarLoader } from 'react-spinners';
import { useTable, useSortBy, useFilters, Column } from 'react-table';

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

type LeadProps = {
  document_id?: string;
  lead?: LeadDataType;
  isSample?: boolean;
  user: User | undefined;
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
  const data = useMemo(() => filteredLeads, [filteredLeads]);

  const columns: Column<LeadDataType>[] = useMemo(
    () => [
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Linkedin',
        accessor: 'linkedin'
      },
      {
        Header: 'Company Name',
        accessor: 'company'
      },
      {
        Header: 'Role',
        accessor: 'role'
      },
      {
        Header: 'Location',
        accessor: 'location'
      },
      {
        Header: 'Education',
        accessor: 'education'
      }
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data }, useFilters, useSortBy);

  const downloadCsv = () => {
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
      const filteredLeadData = leadData
        .filter((lead) => lead.processed)
        .sort((a, b) =>
          a.linkedin && !b.linkedin ? -1 : !a.linkedin && b.linkedin ? 1 : 0
        );

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
            Unlock key AI-powered insights based on emails you’ve collected from
            leads and customers. Stop leaving money on the table.
          </p>
        </div>
        <div className="mt-10">
          {isPaid ? (
            <div className="text-right text-xs px-5">
              {(isProcessed || filteredLeads?.length == leads?.length) && (
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

              {!(isProcessed || filteredLeads?.length == leads?.length) && (
                <div className="loading-spinner py-10">
                  <BarLoader className="m-auto" color="white" />
                  <p className="text-xs text-center mt-5">
                    {filteredLeads.length} / {leads.length} leads processed
                  </p>
                </div>
              )}
              <div className="overflow-x-auto max-w-[90vw] text-left">
                <table
                  {...getTableProps()}
                  className="border table-auto text-sm text-gray-200 mt-5"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px'
                  }}
                >
                  <thead className="bg-orange-100/10">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                            className="py-2 px-4"
                          >
                            {column.render('Header')}
                            <span>
                              {column.isSorted
                                ? column.isSortedDesc
                                  ? ' 🔽'
                                  : ' 🔼'
                                : ''}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => {
                            const isLinkedInUrl =
                              cell.column.id === 'linkedin' && cell.value;
                            return (
                              <td
                                {...cell.getCellProps()}
                                className="py-2 px-4 border-b border-gray-300"
                                style={{
                                  borderColor: 'rgba(255, 255, 255, 0.2)'
                                }}
                              >
                                {isLinkedInUrl ? (
                                  <a
                                    href={cell.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <FontAwesomeIcon icon={faLinkedin} />
                                  </a>
                                ) : (
                                  cell.render('Cell')
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
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
                <>
                  <CheckoutCard document_id={id} user={user} />
                  <p
                    className="max-w-md text-gray-300 text-sm"
                    style={{ fontStyle: 'italic' }}
                  >
                    We charge a small fee because processing emails with AI is
                    expensive for us.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
