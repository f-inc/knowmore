'use client';

import FileUploadModal from './FileUploadModal';
import { useSupabase } from '@/app/supabase-provider';
import { faPlus, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Sentry from '@sentry/nextjs';
import { User } from '@supabase/supabase-js';
import { redirect, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type UserDocument = {
  name: string;
  id: string;
  paid: boolean;
  total_leads: number;
};

type DashboardProps = {
  user: User | undefined;
  web3?: boolean;
};

const Dashboard: React.FC<DashboardProps> = ({ user, web3 = false }) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { supabase } = useSupabase();

  const router = useRouter();

  useEffect(() => {
    fetchUserDocuments();
  }, [user]);

  const transformDocuments = useCallback((data: any[]): UserDocument[] => {
    return data.map(({ name, id, paid, total_leads }) => ({
      name: name ?? 'Unnamed Document',
      id,
      paid: paid ?? false,
      total_leads: total_leads ?? 0
    }));
  }, []);

  const openModal = () => {
    console.log('open modal');
    setIsModalOpen(true);
  };

  const fetchUserDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner', user.id)
        .eq('type', web3 ? 'domain' : 'email');

      if (error) {
        throw error;
      }

      if (data) {
        const sampleFile = [
          {
            id: '7969d2df-bf18-499f-8ba7-4847d48421cc',
            name: 'Sample CSV',
            paid: true,
            total_leads: 9
          }
        ];

        const transformedData = transformDocuments(data);
        setDocuments([...sampleFile, ...transformedData]);
      }
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error fetching user documents:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 flex justify-center align-center ">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4 align-center">
            <h1 className="text-3xl font-bold text-white">Lead Enrichment</h1>
            {web3 && (
              <p className="bg-[#E85533] text-white rounded-full p-2 text-xs font-bold mt-2 w-max bg-opacity-40">
                Web3
              </p>
            )}
          </div>

          <div>
            <button
              className="bg-[#E85533] hover:bg-orange-700 text-white"
              style={{
                display: 'flex',
                padding: '10px 16px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '56px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              onClick={openModal}
            >
              New Batch
            </button>
          </div>
        </div>
        <p className="m-auto text-white text-sm mt-4 mb-4">
          Upload a CSV containing emails or company domains, and we will enhance
          your list with over 100 data points about individuals and companies,
          including job titles and company sizes. These enriched details are
          available for purchase and download, allowing you to create detailed
          profiles for the entities in your list. For additional details, check
          out the sample report provided below.
        </p>

        <div className="flex flex-wrap -mx-2">
          {documents.map((document) => (
            <div key={document.id} className="p-2 w-1/2 md:w-1/3 lg:w-1/4">
              <div
                className="bg-orange-100/10 p-4 rounded-lg mb-4 h-full cursor-pointer"
                onClick={() => router.push(`/view/${document.id}`)}
              >
                <h3 className="text-white font-semibold truncate">
                  {document.name || document.id}
                </h3>
                <p className="text-gray-300 text-sm">
                  {document.total_leads || '0'} leads
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-center items-center p-2 w-1/2 md:w-1/3 lg:w-1/4">
            <div
              className="border-white p-4 rounded-lg h-full cursor-pointer flex flex-col justify-center items-center gap-2"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                width: '100%'
              }}
              onClick={openModal}
            >
              <FontAwesomeIcon icon={faPlusCircle} className="text-white" />
              <h3 className="text-white font-semibold truncate">
                Create New Batch
              </h3>
            </div>
          </div>
        </div>
      </div>

      <FileUploadModal
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={web3 ? 'domain' : 'email'}
      />
    </div>
  );
};

export default Dashboard;
