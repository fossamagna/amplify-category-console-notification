import { $TSContext, AmplifyCategories, AmplifySupportedService } from "amplify-cli-core";
import { FunctionParameters, FunctionTemplate, FunctionTriggerParameters, LambdaLayer } from 'amplify-function-plugin-interface';
import { Options } from "..";
import * as path from 'path';
import inquirer from 'inquirer';
import { v4 as uuid } from 'uuid';

const templateFileName = 'amplify-console-notification-cloudformation-template.json.ejs';

/**
 * Starting point for CLI walkthrough that generates a Amplify Console Notification
 * @param context The Amplify Context object
 * @param category The resource category (should always be 'consolenotification')
 * @param options The options for Amplify Console Notification
 */
export async function createWalkthrough(context: $TSContext, category: string, options: Options) {
  //const functionName = await addTrigger(context);
  const functionName = await addNewLambdaFunction(context);
  options.functionName = functionName;

  await copyCfnTemplate(context, category, options);

  const backendConfigs = {
    service: options.service,
    providerPlugin: 'awscloudformation',
    dependsOn: [
      {
        category: "function",
        resourceName: functionName,
        attributes: [
          "Arn"
        ]
      }
    ],
  };
  await context.amplify.updateamplifyMetaAfterResourceAdd(category, 'slack', backendConfigs);
}

function copyCfnTemplate(
  context: $TSContext,
  category: string,
  options: Options
) {
  const { amplify } = context;
  // @ts-ignore
  const targetDir = amplify.pathManager.getBackendDirPath();
  const pluginDir = path.join(__dirname, '..', '..', '..', '..');

  const copyJobs = [
    {
      dir: pluginDir,
      template: `resources/awscloudformation/cloudformation-templates/${templateFileName}`,
      target: `${targetDir}/${category}/slack/slack-cloudformation-template.json`,
      paramsFile: path.join(targetDir, category, 'slack', 'parameters.json'),
    },
  ];

  const params = {
    appId: getAppId(context)
  }

  // copy over the files
  // @ts-ignore
  return context.amplify.copyBatch(context, copyJobs, options, false, params);
}

function getAppId(context: $TSContext) {
  const meta = context.amplify.getProjectMeta();
  if (meta.providers && meta.providers.awscloudformation) {
    return meta.providers.awscloudformation.AmplifyAppId;
  }
}

async function addNewLambdaFunction(context: $TSContext): Promise<string> {
  const params: Partial<FunctionParameters> = {
    // functionTemplate: {
    //   sourceFiles: [],
    //   sourceRoot: ""
    //   //parameters: {
    //     //path,
    //     //expressPath: formatCFNPathParamsForExpressJs(path),
    //   //},
    // },
    defaultRuntime: 'nodejs',
    template: "resolver"
  };

  const resourceName = await context.amplify.invokePluginMethod(context, AmplifyCategories.FUNCTION, undefined, 'add', [
    context,
    'awscloudformation',
    AmplifySupportedService.LAMBDA,
    params,
  ]);

  context.print.success(`Successfully added resource ${resourceName} locally`);

  return resourceName as string;
}

async function addTrigger(context: $TSContext): Promise<string> {
  const questions = [
    {
      name: 'functionName',
      type: 'input',
      message: 'Input function name in order to send message to Slack.'
    },
    {
      name: 'webhookUrl',
      type: 'input',
      message: 'Input Web hook URL of Slack.'
    }
  ];
  const answers = await inquirer.prompt(questions);

  const { functionName, webhookUrl } = answers;

  // Create a new lambda trigger

  // @ts-ignore
  const targetDir = context.amplify.pathManager.getBackendDirPath();
  const pluginDir = __dirname;

  const [shortId] = uuid().split('-');
  const defaults = {
    functionName,
    roleName: `${functionName}LambdaRole${shortId}`
  };

  const copyJobs = [
    {
      dir: pluginDir,
      template: path.join('..', '..', '..', '..', 'resources', 'triggers', 'slack', 'lambda-cloudformation-template.json.ejs'),
      target: path.join(targetDir, 'function', functionName, `${functionName}-cloudformation-template.json`),
      paramsFile: path.join(targetDir, 'function', functionName, 'parameters.json'),
    },
    {
      dir: pluginDir,
      template: path.join('..', '..', '..', '..', 'resources', 'triggers', 'slack', 'event.json'),
      target: path.join(targetDir, 'function', functionName, 'src', 'event.json'),
    },
    {
      dir: pluginDir,
      template: path.join('..', '..', '..', '..', 'resources', 'triggers', 'slack', 'index.js.ejs'),
      target: path.join(targetDir, 'function', functionName, 'src', 'index.js'),
    },
    {
      dir: pluginDir,
      template: path.join('..', '..', '..', '..', 'resources', 'triggers', 'slack', 'package.json.ejs'),
      target: path.join(targetDir, 'function', functionName, 'src', 'package.json'),
    },
  ];

  const params = {
    webhookUrl
  }

  // copy over the files
  // @ts-ignore
  await context.amplify.copyBatch(context, copyJobs, defaults, false, params);

  // Update amplify-meta and backend-config

  const backendConfigs = {
    service: 'Lambda',
    providerPlugin: 'awscloudformation',
    build: true,
  };

  await context.amplify.updateamplifyMetaAfterResourceAdd('function', functionName, backendConfigs);

  context.print.success(`Successfully added resource ${functionName} locally`);

  return functionName;
}