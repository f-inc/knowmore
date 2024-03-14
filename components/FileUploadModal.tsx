'use client';

import { useSupabase } from '@/app/supabase-provider';
import { transaction } from '@/lib/gtag';
import { AnalyticsEvents } from '@/utils/constants/AnalyticsEvents';
import { CommonEmailProviders } from '@/utils/constants/EmailProviders';
import { DocumentType } from '@/utils/constants/types';
import {
  addDocumentToDB,
  addDomainsToDB,
  addEmailsToDB,
  extractValidData,
  uploadFile
} from '@/utils/file-upload';
import * as Sentry from '@sentry/nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import posthog from 'posthog-js';
import React, { ChangeEvent, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { v4 as uuid } from 'uuid';

const uploadButtonStyle = {
  display: 'flex',
  padding: '16px 48px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  borderRadius: '56px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: '0px 0px 28px 0px rgba(255, 255, 255, 0.15)',
  fontWeight: 700,
  cursor: 'pointer',
  color: 'white',
  backgroundColor: '#E85533',
  hoverBackgroundColor: 'orange-700'
};

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null | undefined;
  type: DocumentType;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  user,
  isOpen,
  onClose,
  type = 'email'
}) => {
  if (!isOpen) return null;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !file.name.endsWith('.csv')) {
      return;
    }

    posthog.capture(AnalyticsEvents.Upload.FileUploading);
    setLoading(true);
    console.log('Uploading file...');

    try {
      Papa.parse(file, {
        complete: async function (results) {
          const items = extractValidData(results.data as any[][], type);

          const id = uuid();
          await uploadFile(supabase, file, id);
          await addDocumentToDB(supabase, file, id, user, items.size, type);

          if (type === 'email') {
            await addEmailsToDB(supabase, items, id);
          } else if (type === 'domain') {
            await addDomainsToDB(supabase, items, id);
          }

          posthog.capture(AnalyticsEvents.Upload.FileUploaded, { id });
          router.push(`/view/${id}`);
        }
      });
    } catch (error) {
      Sentry.captureException(error);
      handleError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: Error) => {
    posthog.capture(AnalyticsEvents.Upload.FileUploadFailed, {
      error: error.message
    });
    console.error('Error processing the file:', error);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
      <div className="bg-white p-4 rounded-lg max-w-96 ">
        <h1 className="font-bold text-xl mb-4">Upload CSV</h1>

        <p className="text-sm text-gray-500 mb-4">
          Know More enriches each email to give you a detailed understanding of
          your highest potential customers.
        </p>
        <div
          style={{
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'rgba(0, 0, 0, 0.15)'
          }}
        >
          {loading ? (
            <div className="loading-spinner py-10">
              <BarLoader className="m-auto" color="white" />
              <p className="text-xs text-center mt-5">uploading your file</p>
            </div>
          ) : (
            <>
              <label htmlFor="file-upload" className="file-upload-label">
                <span style={{ display: 'none' }}>Upload CSV</span>
                <div
                  className="bg-[#E85533] hover:bg-orange-700"
                  style={uploadButtonStyle}
                >
                  Upload {type}s (.csv)
                </div>
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>

        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FileUploadModal;
