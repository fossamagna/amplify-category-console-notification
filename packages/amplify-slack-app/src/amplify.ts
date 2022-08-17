import { AmplifyClient, JobType, StartJobCommand, StartJobCommandInput, StopJobCommand, StopJobCommandInput } from "@aws-sdk/client-amplify";

export type AmplifyJob = {
  region: string;
  appId: string;
  branchName: string;
  jobId: string
}

export const redepoyJob = async ({region, appId, branchName, jobId}: AmplifyJob) => {
  const client = new AmplifyClient({ region });
  try {
    const input: StartJobCommandInput = {
      appId,
      branchName,
      jobType: JobType.RETRY,
      jobId,
    };
    const command = new StartJobCommand(input);
    const response = await client.send(command);
    return response.jobSummary;
  } catch (error) {
    throw error;
  }
}

export const cancelJob = async ({region, appId, branchName, jobId}: AmplifyJob) => {
  const client = new AmplifyClient({ region });
  try {
    const input: StopJobCommandInput = {
      appId,
      branchName,
      jobId,
    };
    const command = new StopJobCommand(input);
    const response = await client.send(command);
    return response.jobSummary;
  } catch (error) {
    throw error;
  }
}

export const createJobUrl = ({region, appId, branchName, jobId}: AmplifyJob): string => {
  return `https://console.aws.amazon.com/amplify/home?region=${region}#${appId}/${branchName}/${jobId}`;
}

export const createAmplifyAppUrl = ({branchName, appId} :{branchName: string, appId: string}): string => {
  return `https://${branchName}.${appId}.amplifyapp.com/`;
}