'use client';

import { useSupabase } from '@/app/supabase-provider';
import { transaction } from '@/lib/gtag';
import { AnalyticsEvents } from '@/utils/constants/AnalyticsEvents';
import { CommonEmailProviders } from '@/utils/constants/EmailProviders';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import posthog from 'posthog-js';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useCallback } from 'react';
import { BarLoader } from 'react-spinners';
import { v4 as uuid } from 'uuid';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null | undefined;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  user,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [blurData, setBlurData] = useState(false);

  const { supabase } = useSupabase();

  function toggleLoading() {
    setLoading(!loading);
  }

  const handleBlurToggle = () => {
    setBlurData(!blurData);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    posthog.capture(AnalyticsEvents.Upload.FileUploading);
    toggleLoading();
    console.log('Uploaiding file...');

    const file = e.target.files && e.target.files[0];

    if (file && file.name.endsWith('.csv')) {
      try {
        console.log('Parsing file...');
        Papa.parse(file!, {
          complete: async function (results) {
            let emails = new Set<string>();
            for (const row of results.data) {
              for (const cell of row as any) {
                const emailRegex = /\S+@\S+\.\S+/;

                if (emailRegex.test(cell)) {
                  const emailDomain = cell.split('@')[1].toLowerCase();
                  if (!CommonEmailProviders.includes(emailDomain)) {
                    emails.add(cell);
                  }
                }
              }
            }

            if (emails.size === 0) {
              throw new Error('No emails found');
            }

            const id = uuid();

            console.log('Uploading CSV...');
            const filePath = `public/${id}.csv`;
            const bucket = 'documents';
            const { data: uploadData, error: uploadError } =
              await supabase.storage.from(bucket).upload(filePath, file);

            if (uploadError) {
              console.error('Error uploading CSV:', uploadError.message);
              return;
            }
            console.log('Uploaded CSV...');

            console.log('Adding document to database...');
            const { data: insertData, error: insertError } = await supabase
              .from('documents')
              .insert([
                {
                  id,
                  name: file.name,
                  storage_path: filePath,
                  owner: user?.id,
                  customer_to_email: user?.email,
                  total_leads: emails.size,
                  processed: true
                }
              ]);

            if (insertError) {
              console.error(
                'Error inserting row into documents table:',
                insertError.message
              );
              return;
            }

            console.log('Added document to database...');

            transaction(id, 0);

            fetch('/api/uploaded', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ document_id: id })
            });

            console.log('Adding leads to database...');
            // check if there are any emails

            const emailArray = Array.from(emails);
            const emailObjects = emailArray.map((email) => ({
              email,
              document_id: id,
              processed: false
            }));

            console.log('emailObjects:', emailObjects);

            const { data: leadInsertData, error: leadInsertError } =
              await supabase.from('leads').insert(emailObjects);

            if (leadInsertError) {
              console.error(
                'Error inserting row into leads table:',
                leadInsertError.message
              );
              return;
            }

            console.log('Added leads to database...');

            posthog.capture(AnalyticsEvents.Upload.FileUploaded, { id });
            router.push(`/view/${id}`);
          }
        });
      } catch (error) {
        posthog.capture(AnalyticsEvents.Upload.FileUploadFailed, { error });
        console.error('Error uploading CSV:', error);
      }
    }
  };

  console.log('user:', user);
  return (
    // max width of 640px
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-md z-50">
      <div className="bg-white p-4 rounded-lg max-w-96">
        <h1 className="font-bold text-xl mb-4">Upload emails (50¢ per lead)</h1>
        <p className="text-sm text-gray-500 mb-4">
          Know More enriches each email to give you a detailed understanding of
          your highest potential customers.
        </p>
        <div
          style={{
            borderRadius: '16px',
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
                  style={{
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
                    color: 'white'
                  }}
                >
                  Upload Emails (.csv)
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
