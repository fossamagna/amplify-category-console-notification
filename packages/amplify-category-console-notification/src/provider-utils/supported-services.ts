import { createWalkthrough } from './awscloudformation/service-walkthroughs/amplify-console-notification-walkthrough';
import * as lambdaController from './awscloudformation';

export const supportedServices = {
  AmplifyConsoleNotification: {
    alias: 'Amplify Console Notification',
    walkthroughs: {
      createWalkthrough: createWalkthrough
    },
    cfnFilename: `${__dirname}/../resources/awscloudformation/cloudformation-templates/amplify-console-notification-cloudformation-template.json.ejs`,
    provider: 'awscloudformation',
    providerController: lambdaController
  }
};

export type SupportedServices = typeof supportedServices;
export type SupportedServiceName = keyof SupportedServices;
