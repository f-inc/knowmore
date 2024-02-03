import { onProcessed } from '@/utils/supabase-admin';
import { Leap } from '@leap-ai/workflows';
import { parseString } from 'xml2js';

const leap = new Leap({
  apiKey: process.env.LEAP_API_KEY as string
});

export async function POST(req: Request) {
  const response = await req.json();

  console.log(response);

  const output = response;

  onProcessed(output);
}
