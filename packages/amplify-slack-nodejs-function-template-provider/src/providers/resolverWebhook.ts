import { $TSContext } from 'amplify-cli-core';
import { FunctionParameters } from 'amplify-function-plugin-interface';
import * as inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { getDstMap } from '../utils/destFileMapper';

export const templateRoot = `${__dirname}/../../resources`;
const pathToTemplateFiles = path.join(templateRoot, 'lambda/webhook');

export const provideWehbook = async (context: $TSContext): Promise<Partial<FunctionParameters>> => {
  const webhookUrl = await askWebhookUrl();
  const files = fs.readdirSync(pathToTemplateFiles);
  return {
    functionTemplate: {
      sourceRoot: pathToTemplateFiles,
      sourceFiles: files,
      defaultEditorFile: path.join('src', 'index.js'),
      destMap: getDstMap(files)
    },
    environmentMap: {
      WEBHOOK_URL: {
        Ref: "webhookUrl",
      },
    },
    environmentVariables: {
      WEBHOOK_URL: webhookUrl
    }
  };
}

const askWebhookUrl = async () => {
  const questions = [
    {
      name: 'webhookUrl',
      type: 'input',
      message: 'Input Web hook URL of Slack.'
    }
  ];
  const answers = await inquirer.prompt(questions);

  const { webhookUrl } = answers;
  return webhookUrl;
}
