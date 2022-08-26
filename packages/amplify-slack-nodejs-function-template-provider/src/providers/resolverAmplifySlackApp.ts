import { $TSContext } from 'amplify-cli-core';
import { FunctionParameters } from 'amplify-function-plugin-interface';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { getDstMap } from '../utils/destFileMapper';

export const templateRoot = `${__dirname}/../../resources`;
const pathToTemplateFiles = path.join(templateRoot, 'lambda/amplifyslackapp');

export const resolverAmplifySlackApp = async (context: $TSContext): Promise<Partial<FunctionParameters>> => {
  const slackSigningSecret = await askSlackSigningSecret();
  const slackBotToken = await askSlackBotToken();
  const slackDefaultChannel = await askSlackDefaultChannel();
  const files = fs.readdirSync(pathToTemplateFiles);
  return {
    functionTemplate: {
      sourceRoot: pathToTemplateFiles,
      sourceFiles: files,
      defaultEditorFile: path.join('src', 'index.js'),
      destMap: getDstMap(files)
    },
    environmentMap: {
      SLACK_DEFAULT_CHANNEL: {
        Ref: "slackDefaultChannel",
      }
    },
    environmentVariables: {
      SLACK_DEFAULT_CHANNEL: slackDefaultChannel
    },
    secretDeltas: {
      SLACK_SIGNING_SECRET: {
        operation: "set",
        value: slackSigningSecret
      },
      SLACK_BOT_TOKEN: {
        operation: 'set',
        value: slackBotToken
      }
    },
    categoryPolicies: [
      {
          Effect: "Allow",
          Action: [
            "amplify:StartJob",
            "amplify:StopJob"
          ],
          Resource: ["arn:aws:amplify:*:*:apps/*/branches/*/jobs/*"]
      }
    ],
    skipAdvancedSection: true,
    skipNextSteps: true,
    skipEdit: true,
  };
}

const askSlackDefaultChannel = async () => {
  const questions = [
    {
      name: 'slackDefaultChannel',
      type: 'input',
      message: 'Slack Channel ID for send message'
    }
  ];
  const answers = await inquirer.prompt(questions);

  const { slackDefaultChannel } = answers;
  return slackDefaultChannel;
}

const askSlackSigningSecret = async () => {
  const questions = [
    {
      name: 'slackSigningSecret',
      type: 'password',
      message: 'Signing Secret to verify request from Slack'
    }
  ];
  const answers = await inquirer.prompt(questions);

  const { slackSigningSecret } = answers;
  return slackSigningSecret;
}

const askSlackBotToken = async () => {
  const questions = [
    {
      name: 'slackBotToken',
      type: 'password',
      message: 'Slack Bot User OAuth Token (ex: xoxb-0000000-000000-xxxxx)'
    }
  ];
  const answers = await inquirer.prompt(questions);

  const { slackBotToken } = answers;
  return slackBotToken;
}
