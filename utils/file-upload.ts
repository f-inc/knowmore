import { CommonEmailProviders } from './constants/EmailProviders';
import { DocumentType } from './constants/types';
import { SupabaseClient, User } from '@supabase/supabase-js';

interface EmailObject {
  email: string;
  document_id: string;
  processed: boolean;
}

export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  id: string
): Promise<void> {
  const filePath = `public/${id}.csv`;
  const { error } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (error) throw new Error(`Error uploading CSV: ${error.message}`);
  console.log('Uploaded CSV...');
}

export async function addDocumentToDB(
  supabase: SupabaseClient,
  file: File,
  id: string,
  user: User | null | undefined,
  totalLeads: number,
  type: DocumentType
): Promise<void> {
  const { error } = await supabase.from('documents').insert([
    {
      id,
      name: file.name,
      storage_path: `public/${id}.csv`,
      owner: user?.id,
      customer_to_email: user?.email,
      total_leads: totalLeads,
      processed: true,
      type: type
    }
  ]);

  if (error)
    throw new Error(`Error inserting document into DB: ${error.message}`);
  console.log('Added document to database...');
}

export async function addEmailsToDB(
  supabase: SupabaseClient,
  emails: Set<string>,
  documentId: string
): Promise<void> {
  const emailObjects: EmailObject[] = Array.from(emails).map((email) => ({
    email,
    document_id: documentId,
    processed: false
  }));

  const { error } = await supabase.from('leads').insert(emailObjects);

  if (error)
    throw new Error(`Error inserting emails into DB: ${error.message}`);
  console.log('Added emails to database...');
}

export async function addDomainsToDB(
  supabase: SupabaseClient,
  domains: Set<string>,
  documentId: string
): Promise<void> {
  const domainObjects = Array.from(domains).map((domain) => ({
    domain,
    document_id: documentId,
    processed: false
  }));

  const { error } = await supabase.from('domains').insert(domainObjects);

  if (error)
    throw new Error(`Error inserting domains into DB: ${error.message}`);
  console.log('Added domains to database...');
}

export function extractValidData(
  data: any[][],
  type: DocumentType
): Set<string> {
  let items = new Set<string>();
  const emailRegex = /\S+@\S+\.\S+/;
  const domainRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

  data.forEach((row) => {
    row.forEach((cell) => {
      if (type === 'email' && emailRegex.test(cell)) {
        const emailDomain = cell.split('@')[1].toLowerCase();
        if (!CommonEmailProviders.includes(emailDomain)) {
          items.add(cell);
        }
      } else if (type === 'domain' && domainRegex.test(cell)) {
        items.add(cell.toLowerCase());
      }
    });
  });

  return items;
}
