import { $TSContext, AmplifyCategories, AmplifySupportedService } from "amplify-cli-core";
import { FunctionParameters } from 'amplify-function-plugin-interface';
import { Options } from "..";
import * as path from 'path';

const templateFileName = 'amplify-console-notification-cloudformation-template.json.ejs';

/**
 * Starting point for CLI walkthrough that generates a Amplify Console Notification
 * @param context The Amplify Context object
 * @param category The resource category (should always be 'consolenotification')
 * @param options The options for Amplify Console Notification
 */
export async function createWalkthrough(context: $TSContext, category: string, options: Options) {
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
    defaultRuntime: 'nodejs',
    template: "webhook",
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
