'use server';

import { Leap } from '@leap-ai/workflows';

const leap = new Leap({
  apiKey: process.env.LEAP_API_KEY as string
});

const getWorkflow = async (id: string) => {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const { data } = await leap.workflowRuns.getWorkflowRun({
        workflowRunId: id
      });

      if (data.status === 'completed') {
        clearInterval(interval);
        resolve(data);
      }
    }, 1000);
  });
};

export const getFeedback = async (tweet: string, handle?: string) => {
  if (!handle) {
    const {
      data: { id }
    } = await leap.workflowRuns.workflow({
      workflow_id: 'wkf_FSAjAFRHXk7oxg',
      input: {
        tweet_raw: tweet
      }
    });

    const workflow = await getWorkflow(id);
    // @ts-ignore
    return workflow.output.value;
  } else {
    const {
      data: { id }
    } = await leap.workflowRuns.workflow({
      workflow_id: 'wkf_clHn5KNLx1UsEn',
      input: {
        tweet_raw: tweet,
        tweet_acc: handle
      }
    });

    const workflow = await getWorkflow(id);
    // @ts-ignore
    return workflow.output.value;
  }
};
