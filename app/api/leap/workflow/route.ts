import { Leap } from "@leap-ai/workflows";

const leap = new Leap({
    apiKey: process.env.LEAP_API_KEY as string,
});

export async function POST(req: Request) {

    console.log(await (req.json()));

    const response = await leap.workflowRuns.workflow(
        {
            workflow_id: "wkf_LhHiATZN4uI11H",
            webhook_url:
                "https://1c49-80-112-133-231.ngrok-free.app/api/leap/webhook",
            input: { csv: "furqan@thirdweb.com", document_id: "string" },
        },
    );
    console.log(response.data);

}
