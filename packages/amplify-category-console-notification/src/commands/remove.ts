import { $TSContext } from 'amplify-cli-core';
import { category } from '../constants';

export const run = async (context: $TSContext) => {
    const { amplify, parameters } = context;
    const resourceName = parameters.first;
  try {
    // @ts-ignore
    await amplify.removeResource(context, category, resourceName);
  } catch (err) {
    context.print.info(err.stack);
    context.print.error('An error occurred when removing the console notification resource');
    context.usageData.emitError(err);
    process.exitCode = 1;
  }
}