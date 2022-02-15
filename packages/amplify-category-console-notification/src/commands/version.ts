import { $TSContext } from "amplify-cli-core";

export const run = async (context: $TSContext) => {
  context.print.info(require('../../package.json').version);
};
