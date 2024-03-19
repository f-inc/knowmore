import { useSupabase } from '@/app/supabase-provider';
import { DocumentType } from '@/utils/constants/types';
import { LeadDataType } from '@/utils/helpers';
import * as Sentry from '@sentry/nextjs';
import Papa from 'papaparse';
import { useMemo, useState, useEffect } from 'react';
import { useTable, useSortBy, useFilters, Column } from 'react-table';

const useLeadTable = (
  documentId: string,
  currentPage: number = 1,
  itemsPerPage: number = 20
) => {
  const { supabase } = useSupabase();
  const [documentType, setType] = useState('');
  const [leads, setLeads] = useState<LeadDataType[]>([]);
  const [numProcessedLeads, setNumProcessedLeads] = useState(0);
  const [isPaid, setIsPaid] = useState(false);
  const [numLeads, setNumLeads] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [document, setDocument] = useState<any>();

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

  const domainColumns: Column<LeadDataType>[] = useMemo(
    () => [
      {
        Header: 'Domain Name',
        accessor: 'domain'
      },
      {
        Header: 'Full Name',
        accessor: 'person_full_name'
      },
      {
        Header: 'Email',
        accessor: 'person_email'
      },
      {
        Header: 'LinkedIn',
        accessor: 'person_linkedin_url'
      },

      {
        Header: 'Twitter',
        accessor: 'person_twitter_url'
      },
      {
        Header: 'Telegram',
        accessor: 'person_telegram_url'
      },
      {
        Header: 'Company Name',
        accessor: 'company_name'
      },
      // {
      //   Header: 'Company Website',
      //   accessor: 'company_website'
      // },
      {
        Header: 'Company Description',
        accessor: 'company_description'
      }
    ],
    []
  );

  const columnsToUse = documentType === 'email' ? columns : domainColumns;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter
  } = useTable({ columns: columnsToUse, data: leads }, useFilters, useSortBy);

  const getEmailData = async (id: string) => {
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

      setLeads(profileData as LeadDataType[]);
    } else {
      console.log('No processed leads found for pagination.');
    }
  };

  const getDomainData = async (id: string) => {
    const { data: leadData, error: leadError } = await supabase
      .from('domains')
      .select('*')
      .eq('document_id', id);

    if (leadError) {
      console.error('Error fetching domains:', leadError);
      return;
    }

    if (!leadData) {
      console.log('No domains found for the document.');
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const processedLeads = leadData.filter((lead) => lead.processed);
    console.log('processedLeads: ', processedLeads);
    setNumProcessedLeads(processedLeads.length);

    const paginatedLeads = processedLeads.slice(startIndex, endIndex);
    console.log('paginatedLeads:', paginatedLeads);

    if (paginatedLeads.length > 0) {
      setLeads(paginatedLeads as LeadDataType[]);
    } else {
      console.log('No processed leads found for pagination.');
    }
  };

  const fetchLeads = async (id: string) => {
    setFetching(true);

    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    setDocument(documentData);

    if (documentError) {
      Sentry.captureException(documentError);
      console.error('Error fetching document:', documentError);
      return;
    }

    setIsPaid(documentData.paid!);
    setNumLeads(documentData.total_leads!);
    setType(documentData.type!);

    switch (documentData.type) {
      case 'email':
        await getEmailData(id);
        break;
      case 'domain':
        await getDomainData(id);
        break;
      default:
        break;
    }

    setFetching(false);
  };

  async function downloadCsvEmails() {
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

  async function downloadCsvDomains() {
    let { data: domainsData, error: domainsError } = await supabase
      .from('domains')
      .select('*')
      .eq('document_id', documentId)
      .eq('processed', true);

    if (domainsError) {
      console.error('Error fetching domains:', domainsError);
      return;
    }

    if (!domainsData || domainsData.length === 0) {
      console.log('No domains found for the document.');
      return;
    }

    const batchSize = 300;
    let result = [];
    result.push(...(domainsData || []));

    // for (let i = 0; i < domainsData.length; i += batchSize) {
    //   let domains = domainsData.map((domain) => domain.domain);

    //   let { data: profileData, error: profileError } = await supabase
    //     .from('profiles')
    //     .select('*')
    //     .in('email', emails.slice(i, i + batchSize));

    //   profiles.push(...(profileData || []));

    //   if (profileError) {
    //     console.error('Error fetching profiles:', profileError);
    //     return;
    //   }
    // }

    const csvData = Papa.unparse(result, { header: true });

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'domains.csv';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  }

  useEffect(() => {
    const fetchData = async () => {
      console.log('fetching leads for document:', currentPage);
      await fetchLeads(documentId);
    };

    fetchData();

    if (numProcessedLeads !== numLeads) {
      const intervalId = setInterval(() => {
        fetchData();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [documentId, currentPage, numProcessedLeads, numLeads]);

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
    downloadCsvEmails,
    downloadCsvDomains,
    isPaid,
    fetching,
    document,
    documentType
  };
};

export default useLeadTable;
