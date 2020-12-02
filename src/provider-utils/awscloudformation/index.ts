import { $TSContext } from "amplify-cli-core";
import { SupportedServiceName, supportedServices } from '../../provider-utils/supported-services';

export interface Options {
  service: SupportedServiceName;
  providerPlugin: string;
  functionName?: string;
  webhookUrl?: string;
  depensOn?: any;
}

/**
 * Entry point for creating a Amplify Console Notification
 * @param context Amplify Core Context object
 * @param category The resource category (should always be 'consolenotification')
 * @param service The cloud service that is providing the category
 * @param options The options for Amplify Console Notification
 */
export async function addResource(
    context: $TSContext,
    category: string,
    service: SupportedServiceName,
    options: Options
  ): Promise<void> {
    const serviceConfig = supportedServices[service];
    await serviceConfig.walkthroughs.createWalkthrough(context, category, options);
}
