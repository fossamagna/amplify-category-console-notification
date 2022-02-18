import { $TSContext } from 'amplify-cli-core';

const category = 'console-notification';

export const run = async (context: $TSContext) => {
  const header = `amplify ${category} <subcommands>`;

  const commands = [
    {
      name: 'add',
      description: `Takes you through steps in the CLI to add a ${category} resource to your local backend`,
    },
    {
      name: 'remove',
      description: `Removes ${category} resource from your local backend. The resource is removed from the cloud on the next push command.`,
    },
  ];

  // @ts-ignore
  context.amplify.showHelp(header, commands);

  context.print.info('');
};
