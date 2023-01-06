import {
  $TSContext,
  AmplifyCategories,
  AmplifySupportedService,
  open,
} from "amplify-cli-core";
import {
  FunctionParameters,
} from "amplify-function-plugin-interface";
import { Options } from "..";
import * as path from "path";
import inquirer from "inquirer";

const templateFileName =
  "amplify-console-notification-cloudformation-template.json.ejs";

const amplifySlackAppTemplateName = "amplifyslackapp";

/**
 * Starting point for CLI walkthrough that generates a Amplify Console Notification
 * @param context The Amplify Context object
 * @param category The resource category (should always be 'consolenotification')
 * @param options The options for Amplify Console Notification
 */
export async function createWalkthrough(
  context: $TSContext,
  category: string,
  options: Options
) {
  const { amplify } = context;
  const params = await askSlackAppType(context);
  options.useFunctionUrl = params.template === amplifySlackAppTemplateName;

  if (options.useFunctionUrl) {
    await showCreateSlacAppSteps(context);
  }

  const functionName = await addNewLambdaFunction(context, options, params);
  options.functionName = functionName;

  const resourceName = functionName; // use functionName as resourceName of consolenotification category

  await copyCfnTemplate(context, category, resourceName, options);
  const envSpecificParams = { appId: getAppId(context) };
  amplify.saveEnvResourceParameters(context, category, resourceName, envSpecificParams)

  const backendConfigs = {
    service: options.service,
    providerPlugin: options.providerPlugin,
    dependsOn: [
      {
        category: "function",
        resourceName: functionName,
        attributes: ["Arn"],
      },
    ],
  };
  await context.amplify.updateamplifyMetaAfterResourceAdd(
    category,
    resourceName,
    backendConfigs
  );
}

async function showCreateSlacAppSteps(context: $TSContext) {
  context.print.info("");
  context.print.info("Next Steps:");
  context.print.info("1. Create a Slack App following setup document.");
  context.print.info("   https://github.com/fossamagna/amplify-category-console-notification/blob/main/packages/amplify-slack-app/docs/SETUP.md")
  context.print.info("2. Provide an AWS Lambda function name for Slack App.");
  context.print.info("3. Input \"Signing Secret\" and \"Slack Bot User OAuth Token\" of Slack App to this prompt.");
  context.print.info("4. Input Slack Channel ID to send notification message.");
  context.print.info("5. Deploy Slack App as execute `amplify push` command.");
  context.print.info("6. Update settings.interactivity.request_url with FunctionUrl in Slack App Manifest.");
  context.print.info("");
  if (await context.amplify.confirmPrompt('Do you want to open setup document in your browser?', true)) {
    open("https://github.com/fossamagna/amplify-category-console-notification/blob/main/packages/amplify-slack-app/docs/SETUP.md", {});
  }
}

function copyCfnTemplate(
  context: $TSContext,
  category: string,
  resourceName: string,
  options: Options
) {
  const { amplify } = context;
  // @ts-ignore
  const targetDir = amplify.pathManager.getBackendDirPath();
  const pluginDir = path.join(__dirname, "..", "..", "..", "..");

  const copyJobs = [
    {
      dir: pluginDir,
      template: `resources/awscloudformation/cloudformation-templates/${templateFileName}`,
      target: `${targetDir}/${category}/${resourceName}/slack-cloudformation-template.json`,
      paramsFile: path.join(targetDir, category, resourceName, "parameters.json"),
    },
  ];

  // copy over the files
  return context.amplify.copyBatch(context, copyJobs, options, false);
}

function getAppId(context: $TSContext) {
  const meta = context.amplify.getProjectMeta();
  if (meta.providers && meta.providers.awscloudformation) {
    return meta.providers.awscloudformation.AmplifyAppId;
  }
}

async function addNewLambdaFunction(
  context: $TSContext,
  options: Options,
  params: Partial<FunctionParameters>
): Promise<string> {
  const resourceName = await context.amplify.invokePluginMethod(
    context,
    AmplifyCategories.FUNCTION,
    undefined,
    "add",
    [context, options.providerPlugin, AmplifySupportedService.LAMBDA, params]
  );
  return resourceName as string;
}

async function askSlackAppType(context: $TSContext) {
  const templateProviders = context.pluginPlatform.plugins.functionTemplate;
  const selections = templateProviders
    .filter(
      (meta) =>
        meta.packageName === "amplify-slack-nodejs-function-template-provider"
    )
    .map(
      (meta) =>
        meta.manifest.functionTemplate.templates as {
          name: string;
          value: string;
        }[]
    )
    .reduce((all, value) => all.concat(value), []);
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "selection",
      message: "Select Slack App type",
      choices: selections,
      validate: (value) => !!value,
    },
  ]);
  const params: Partial<FunctionParameters> = {
    defaultRuntime: "nodejs",
    template: answer.selection,
  };
  return params;
}
