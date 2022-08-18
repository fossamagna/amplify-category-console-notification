# amplify-slack-app

Amplify Slack App gives you what's happening on AWS Amplify Console from Slack channel.

With Amplify Slack App, you can:
* Receive notifications build result of Amplify Console
* Run Redeploy and Cancel of Amplify Console Job from Slack
* Open a job page on AWS Management Console
* Open deployed web app with Amplify Console Job

## Install

```sh
npm install amplify-slack-app --save
```
or
```sh
yarn add amplify-slack-app
```

## Usage

### Create an `index.js` with the following contents as Lambda handler

```ts
import { AmplifyConsoleSlackApp } from "amplify-slack-app";
import { LogLevel } from "@slack/bolt";

const app = new AmplifyConsoleSlackApp({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  token: process.env.SLACK_BOT_TOKEN!,
  defaultChannel: process.env.SLACK_DEFAULT_CHANNEL!,
  logLevel: LogLevel.DEBUG,
});

export const handler = app.createHandler();
```

### Setup application as Slack App

Amplify Slack App makes use of OAuth to post messages to your Slack workspace. Follow our [setup guide](./docs/SETUP.md) for authenticating with Slack.
