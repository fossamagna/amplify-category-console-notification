import { $TSContext, $TSMeta } from 'amplify-cli-core';
import { category } from '../constants';

export const run = async (context: $TSContext) => {
  const previousFunctionUrlByServiceName = getFunctionUrlBySerivceName(context.exeInfo.amplifyMeta);
  const { outputsByCategory } = context.amplify.getResourceOutputs();
  Object.entries<Record<string, string>>(outputsByCategory[category])
  .filter(([_, output]) => !!output.LambdaFunctionUrl)
  .filter(([serviceName, output]) => previousFunctionUrlByServiceName[serviceName] !== output.LambdaFunctionUrl)
  .forEach(([serviceName, output]) => {
    showFunctionUrlInformation(context, serviceName, output.LambdaFunctionUrl);
  });
};

function showFunctionUrlInformation(context: $TSContext, serviceName: string, functionUrl: string) {
  context.print.success(`Successfully added resource ${functionUrl}.`);
  context.print.info("");
  context.print.info('Next steps:');
  context.print.info("1. Open https://api.slack.com/apps in your browser.");
  context.print.info(`2. Update settings.interactivity.request_url with ${functionUrl} in Slack App Manifest for ${serviceName}.`);
  context.print.info("");
}

function getFunctionUrlBySerivceName(amplifyMeta: $TSMeta): Record<string, string> {
  return Object.entries<Record<string, any>>(amplifyMeta.consolenotification)
    .reduce((all, [serviceName, service]) => {
      all[serviceName] = service.output.LambdaFunctionUrl;
      return all;
    }, {} as Record<string, string>);
}
