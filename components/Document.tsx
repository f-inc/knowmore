'use client';

import CheckoutCard from './CheckoutCard';
import { useSupabase } from '@/app/supabase-provider';
import useLeadTable from '@/hooks/useLeadTable';
import { LeadDataType, postData } from '@/utils/helpers';
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isProcessed, setIsProcessed] = useState(false);

  const {
    rows,
    isPaid,
    fetching,
    numLeads,
    document,
    prepareRow,
    downloadCsv,
    headerGroups,
    getTableProps,
    getTableBodyProps,
    numProcessedLeads
  } = useLeadTable(id, currentPage, itemsPerPage);

  useEffect(() => {
    console.log(numProcessedLeads, numLeads);
    setIsProcessed(numProcessedLeads == numLeads);
  }, [numProcessedLeads, numLeads]);

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
            We detected {numLeads} {numLeads > 1 ? 'emails' : 'email'}
          </h1>
          <p className="max-w-md text-center m-auto text-gray-300 text-sm">
            Unlock key AI-powered insights based on emails you’ve collected from
            leads and customers. Stop leaving money on the table.
          </p>
        </div>
        <div className="mt-10">
          {isPaid ? (
            <div className="text-right text-xs px-5">
              {isProcessed && (
                <>
                  <p className="mt-3">
                    Processed all {numLeads} results, please download the CSV
                    file.
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
                    {numProcessedLeads} / {numLeads} leads processed
                  </p>
                </div>
              )}

              <div className="flex justify-center items-center gap-4 mt-5">
                <button
                  className="px-4 py-2 bg-[#E85533] text-white rounded-full text-sm hover:bg-orange-700 focus:outline-none"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <p className="text-white text-sm">
                  {currentPage} of {Math.ceil(numProcessedLeads / itemsPerPage)}
                </p>
                <button
                  className="px-4 py-2 bg-[#E85533] text-white rounded-full text-sm hover:bg-orange-700 focus:outline-none"
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                  }}
                  disabled={currentPage * itemsPerPage >= numProcessedLeads}
                >
                  Next
                </button>
              </div>

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
                  {fetching ? (
                    <BarLoader className="m-auto" color="white" />
                  ) : (
                    <tbody {...getTableBodyProps()}>
                      {rows.map((row) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                              const isLinkedInUrl =
                                [
                                  'person_linkedin_url',
                                  'company_linkedin_url'
                                ].includes(cell.column.id) && cell.value;
                              return (
                                <td
                                  {...cell.getCellProps()}
                                  className="py-2 px-4 border-b border-gray-300"
                                  style={{
                                    maxWidth: '300px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
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
                                  ) : cell.value ? (
                                    cell.render('Cell')
                                  ) : (
                                    <span
                                      style={{
                                        color: 'rgba(255, 255, 255, 0.7)'
                                      }}
                                    >
                                      (empty)
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          ) : (
            <>
              {user && numLeads >= lead_limit ? (
                <div className="text-center text-sm bg-gray-100/20 p-5 rounded-xl max-w-[600px]">
                  <p></p>
                </div>
              ) : (
                <>
                  <CheckoutCard user={user} document={document} />
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
