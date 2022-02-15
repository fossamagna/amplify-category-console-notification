import { $TSContext } from 'amplify-cli-core';
import { category } from '../constants';
import { supportedServices, SupportedServiceName } from '../provider-utils/supported-services';

export const run = async (context: $TSContext) => {
  const { amplify } = context;
  const servicesMetadata = supportedServices;

  return amplify
    .serviceSelectionPrompt(context, category, servicesMetadata)
    .then(result => {
      const service = result.service as SupportedServiceName;
      const options = {
        service: service,
        providerPlugin: result.providerName
      };
      const providerController = servicesMetadata[service].providerController;
      if (!providerController) {
        context.print.error('Provider not configured for this category');
        return;
      }
      return providerController.addResource(context, category, service, options);
    })
    .then(() => {
      context.print.info('');
    })
    .catch(err => {
      context.print.info(err.stack);
      context.print.error('There was an error adding the Amplify Console Notification resource');
      context.usageData.emitError(err);
      process.exitCode = 1;
    });
};
