import { APIGatewayProxyEvent, APIGatewayProxyHandler, Handler, SNSEvent, SNSEventRecord } from "aws-lambda";
import { App, LogLevel, AwsLambdaReceiver } from '@slack/bolt';
import { ChatPostMessageArguments } from "@slack/web-api";
import { AmplifyJob, cancelJob, createAmplifyAppUrl, createJobUrl, redepoyJob } from "./amplify";

const ACTION_ID_REDEPLOY = "redeploy";
const ACTION_ID_CANCEL = "cancel";

class SlackMessageSender {
  constructor(private app: App) {}

  sendMessage(record: SNSEventRecord, channel: string) {
    const event = JSON.parse(record.Sns.Message);

    const message = this.format(event);
    return this.app.client.chat.postMessage({
      channel,
      ...message
    });
  }

  format(event: any): Partial<ChatPostMessageArguments> {
    const statusToEmoji = {
      SUCCEED: ':tada:',
      FAILED: ':x:'
    };
    const { detail, region } = event;
    const { appId, branchName, jobId, jobStatus } = detail;
    const appUrl = createAmplifyAppUrl({branchName, appId});
    const job = {region, appId, branchName, jobId};
    const jobUrl = createJobUrl(job);
    // @ts-ignore
    const emoji = statusToEmoji[jobStatus] || '';

    const actionElements = [];
    if (jobStatus === 'STARTED') {
      actionElements.push({
        type: "button",
        action_id: ACTION_ID_CANCEL,
        text: {
          type: "plain_text",
          text: "Cancel",
          emoji: true
        },
        value: JSON.stringify(job),
      });
    }
    if (jobStatus === 'SUCCEED' || jobStatus === 'FAILED') {
      actionElements.push({
        type: "button",
        action_id: ACTION_ID_REDEPLOY,
        text: {
          type: "plain_text",
          text: "Redeply this version",
          emoji: true
        },
        value: JSON.stringify(job),
      });
    }
    return {
      text: `AWS Amplify Console Build ${jobStatus} (${branchName})`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `AWS Amplify Console Build <${jobUrl}|#${jobId}>\nStatus: *${jobStatus}* ${emoji} \n<${appUrl}|Open your App (${branchName})>`
          }
        },
        {
          type: "actions",
          elements: actionElements
        }
      ]
    }
  }
}

export type AmplifyConsoleSlackAppOptions = {
  signingSecret: string;
  token: string;
  defaultChannel: string;
  logLevel?: LogLevel;
}

export class AmplifyConsoleSlackApp {
  private awsLambdaReceiver: AwsLambdaReceiver;
  private app: App;
  private defaultChannel: string;

  constructor(options: AmplifyConsoleSlackAppOptions) {
    this.awsLambdaReceiver = new AwsLambdaReceiver({
      signingSecret: options.signingSecret,
    });
    this.app = new App({
      token: options.token,
      receiver: this.awsLambdaReceiver,
      logLevel: options.logLevel,
    });
    this.defaultChannel = options.defaultChannel;
    this.setupApp(this.app);
  }

  private setupApp = (app: App) => {
    app.action(ACTION_ID_REDEPLOY, async ({ body, ack, say, payload }) => {
      await ack();
      if (payload.type === 'button') {
        const job = JSON.parse(payload.value) as AmplifyJob;
        try {
          const jobSummary = await redepoyJob(job);
          await say(`<@${body.user.id}> Build <${createJobUrl(job)}|#${job.jobId}> is redeploied`);
        } catch (error: any) {
          await say(`<@${body.user.id}> ${error.message}`);
        }
      }
    });
  
    app.action(ACTION_ID_CANCEL, async ({ body, ack, say, payload }) => {
      await ack();
      if (payload.type === 'button') {
        const job = JSON.parse(payload.value) as AmplifyJob;
        try {
          await cancelJob(job);
          await say(`<@${body.user.id}> Build <${createJobUrl(job)}|#${job.jobId}> is cancelled`);
        } catch (error: any) {
          await say(`<@${body.user.id}> ${error.message}`);
        } 
      }
    });
  }

  private async postMessage(record: SNSEventRecord) {
    const sender = new SlackMessageSender(this.app);
    return sender.sendMessage(record, this.defaultChannel);
  }
  
  createAPIGatewayProxyHandler: APIGatewayProxyHandler = async (event, context, callback) => {
    const handler = await this.awsLambdaReceiver.start();
    return handler(event, context, callback);
  };

  crateSNSEventHandler: Handler<SNSEvent> = async (event) => {
    try {
      await Promise.all(event.Records.map(record => this.postMessage(record)));
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  createHandler(): Handler {
    const handler: Handler = async (event, context, callback) => {
      if (this.isSNSEvent(event)) {
        return this.crateSNSEventHandler(event, context, callback);
      } else if (this.isAPIGatewayProxyEvent(event)) {
        return this.createAPIGatewayProxyHandler(event, context, callback);
      } else {
        throw new Error(`event type is not implement. ${JSON.stringify(event)}`)
      }
    };
    return handler;
  };

  private isSNSEvent = (event: any): event is SNSEvent => {
    return !!event.Records;
  }
  
  private isAPIGatewayProxyEvent = (event: any): event is APIGatewayProxyEvent => {
    return !!event.httpMethod
  }
}
