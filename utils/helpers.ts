import { CommonEmailProviders } from './constants/EmailProviders';
import { Database } from '@/types_db';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as https from 'https';

type Price = Database['public']['Tables']['prices']['Row'];

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export const postData = async ({ url, data }: { url: string; data?: any }) => {
  console.log('posting,', url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      console.log('Error in postData', { url, data, res });

      throw Error(res.statusText);
    }

    return res.json();
  } catch (error) {
    console.error('Error in postData', { url, data, error });
    throw error;
  }
};

export const toDateTime = (secs: number) => {
  var t = new Date('1970-01-01T00:30:00Z');
  t.setSeconds(secs);
  return t;
};

export async function getOgTitle(url: string): Promise<string> {
  if (!url) return '';

  if (url in CommonEmailProviders) {
    return url;
  }

  if (!url.includes('http')) {
    url = `https://${url}`;
  }

  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  try {
    const { data } = await axios.get(url, { httpsAgent });
    const $ = cheerio.load(data);

    const ogSiteName = $('meta[property="og:site_name"]').attr('content');
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const title = $('title').text();

    return ogSiteName || ogTitle || title || url;
  } catch (error: any) {
    console.error('Error fetching data from URL:', url, error?.message);
    return url;
  }
}

export type LeadDataType = {
  document_id?: string;
  email?: string;
  person_full_name?: string;
  person_linkedin_url?: string;
  person_twitter_url?: string;
  person_location?: string;
  person_employment_title?: string;
  person_estimated_salary?: string;
  person_age?: string;
  person_gender?: string;
  person_bio?: string;
  person_website?: string;
  person_education_summary?: string;
  company_name?: string;
  company_website?: string;
  company_industry?: string;
  company_description?: string;
  company_address?: string;
  company_linkedin_url?: string;
  company_twitter_url?: string;
  company_num_employees?: number;
  company_money_raised?: string;
  company_metrics_annual_revenue?: string;
  company_tech_stack?: string;

  person_email: string;
};
