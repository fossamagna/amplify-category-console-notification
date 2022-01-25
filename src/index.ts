import { $TSContext, IAmplifyResource } from 'amplify-cli-core';
import * as path from 'path';
import { ConsoleNotificationInputState } from './provider-utils/awscloudformation/console-notification-inputs-manager/console-notification-input-state';
import { generateConsoleNotificationStackTemplate } from './provider-utils/awscloudformation/utils/generate-console-notification-stack-template';
export * from "./amplify-cli-extensibility-helper/types";

export async function executeAmplifyCommand(context: $TSContext) {
  const commandsDirPath = path.normalize(path.join(__dirname, 'commands'));
  const commandPath = path.join(commandsDirPath, context.input.command);
  const commandModule = require(commandPath);
  await commandModule.run(context);
}

export async function handleAmplifyEvent(context: $TSContext, args: any) {
  const eventHandlersDirPath = path.normalize(path.join(__dirname, 'event-handlers'));
  const eventHandlerPath = path.join(eventHandlersDirPath, `handle-${args.event}`);
  const eventHandlerModule = require(eventHandlerPath);
  await eventHandlerModule.run(context, args);
}

export async function transformCategoryStack(context: $TSContext, resource: IAmplifyResource): Promise<void> {
  if (canResourceBeTransformed(context, resource.resourceName)) {
    generateConsoleNotificationStackTemplate(context, resource.resourceName);
  }
}

function canResourceBeTransformed(context: $TSContext, resourceName: string) {
  const resourceInputState = new ConsoleNotificationInputState(context, resourceName);
  return resourceInputState.cliInputFileExists();
}
