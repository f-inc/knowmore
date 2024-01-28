
import { Leap } from "@leap-ai/workflows";
import {
    onProcessed
} from '@/utils/supabase-admin';

const leap = new Leap({
    apiKey: process.env.LEAP_API_KEY as string,
});

export async function POST(req: Request) {

    const response = (await (req.json()));

    console.log(response);

    const output = response["output"]["step1"]["choices"][0]["message"]["content"];

    const regex = /\[([^[\]]*)\]/;
    const matches: any = output.match(regex);

    onProcessed(response.id, response.input.document_id, matches[0]);
}