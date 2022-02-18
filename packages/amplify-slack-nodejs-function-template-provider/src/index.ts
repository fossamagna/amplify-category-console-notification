import { FunctionTemplateContributorFactory } from 'amplify-function-plugin-interface';
import { provideWehbook } from './providers/resolverWebhook';

export const functionTemplateContributorFactory: FunctionTemplateContributorFactory = (context) => {
  return {
    contribute: (request) => {
      switch (request.selection) {
        case 'webhook': {
          return provideWehbook(context);
        }
        default: {
          throw new Error(`Unknown template selection [${request.selection}]`);
        }
      }
    }
  }
};
