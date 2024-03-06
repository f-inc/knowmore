import { useSupabase } from '@/app/supabase-provider';
import { LeadDataType } from '@/utils/helpers';
import Papa from 'papaparse';
import { useMemo, useState, useEffect } from 'react';
import { useTable, useSortBy, useFilters, Column } from 'react-table';

const useLeadTable = (
  documentId: string,
  currentPage: number = 1,
  itemsPerPage: number = 20
) => {
  const { supabase } = useSupabase();

  const [leads, setLeads] = useState<LeadDataType[]>([]);
  const [numProcessedLeads, setNumProcessedLeads] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [numLeads, setNumLeads] = useState(0);
  const [fetching, setFetching] = useState(false);

  const columns: Column<LeadDataType>[] = useMemo(
    () => [
      {
        Header: 'Full Name',
        accessor: 'person_full_name'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'LinkedIn',
        accessor: 'person_linkedin_url'
      },

      {
        Header: 'Location',
        accessor: 'person_location'
      },
      {
        Header: 'Role',
        accessor: 'person_employment_title'
      },
      {
        Header: 'Website',
        accessor: 'person_website'
      },
      {
        Header: 'Education',
        accessor: 'person_education_summary'
      },
      {
        Header: 'Company Name',
        accessor: 'company_name'
      },
      {
        Header: 'Company Website',
        accessor: 'company_website'
      },
      {
        Header: 'Industry',
        accessor: 'company_industry'
      }
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter
  } = useTable({ columns, data: leads }, useFilters, useSortBy);

  const fetchLeads = async (id: string) => {
    setFetching(true);
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (documentError) {
      console.error('Error fetching document:', documentError);
      return;
    }

    setIsPaid(documentData.paid);
    setNumLeads(documentData.total_leads);

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('document_id', id);

    if (leadError) {
      console.error('Error fetching leads:', leadError);
      return;
    }

    if (!leadData) {
      console.log('No leads found for the document.');
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const processedLeads = leadData.filter((lead) => lead.processed);
    setNumProcessedLeads(processedLeads.length);

    const paginatedLeads = processedLeads.slice(startIndex, endIndex);
    console.log('paginatedLeads:', paginatedLeads);

    if (paginatedLeads.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in(
          'email',
          paginatedLeads.map((lead) => lead.email)
        );
      if (profileError) {
        console.log(profileError);
        throw profileError;
      }
      console.log('profileData:', profileData);

      setLeads(profileData as LeadDataType[]);
    } else {
      console.log('No processed leads found for pagination.');
    }

    setFetching(false);
  };

  async function downloadCsv() {
    let { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('document_id', documentId)
      .eq('processed', true);

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
      return;
    }

    if (!leadsData || leadsData.length === 0) {
      console.log('No leads found for the document.');
      return;
    }

    const batchSize = 300;
    let profiles = [];

    for (let i = 0; i < leadsData.length; i += batchSize) {
      let emails = leadsData.map((lead) => lead.email);
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('email', emails.slice(i, i + batchSize));

      profiles.push(...(profileData || []));

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return;
      }
    }

    const csvData = Papa.unparse(profiles, { header: true });

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  }

  useEffect(() => {
    console.log('fetching leads for document:', currentPage);
    fetchLeads(documentId);
  }, [documentId, currentPage]);

  return {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
    leads,
    numLeads,

    numProcessedLeads,

    setLeads,
    downloadCsv,
    isPaid,
    fetching
  };
};

export default useLeadTable;
