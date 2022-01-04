import { AmplifyConsoleNotificationTransform } from '../console-notification-stack-builder/console-notificatoin-stack-transform';
import { $TSContext, Template } from 'amplify-cli-core';

export const generateConsoleNotificationStackTemplate = async (context: $TSContext, resourceName: string): Promise<Template> => {
  const consoleNotificationTransform = new AmplifyConsoleNotificationTransform(resourceName);
  return await consoleNotificationTransform.transform(context);
};