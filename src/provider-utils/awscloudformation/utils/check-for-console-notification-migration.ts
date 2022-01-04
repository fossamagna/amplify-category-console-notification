import { $TSContext, getMigrateResourceMessageForOverride } from 'amplify-cli-core';
import { printer, prompter } from 'amplify-prompts';
import { category } from '../../../constants';
import { ConsoleNotificationInputState } from '../console-notification-inputs-manager/console-notification-input-state';
import { generateConsoleNotificationStackTemplate } from './generate-console-notification-stack-template';
import { migrateResourceToSupportOverride } from './migrate-override-resource';

/*
 * returns true if check goes through, false if cancelled
 */
export const checkConsoleNotificationResourceMigration = async (context: $TSContext, resourceName: string, isUpdate: boolean): Promise<boolean> => {
  const cliState = new ConsoleNotificationInputState(resourceName);
  if (!cliState.cliInputFileExists()) {
    printer.debug("cli-inputs.json doesn't exist");
    // put spinner here
    const headlessMigrate = context.input.options?.yes || context.input.options?.forcePush || context.input.options?.headless;

    if (
      headlessMigrate ||
      (await prompter.yesOrNo(getMigrateResourceMessageForOverride(category, resourceName, isUpdate), true))
    ) {
      // generate cli-inputs for migration from parameters.json
      await migrateResourceToSupportOverride(resourceName);
      // fetch cli Inputs again
      // const cliInputs = cliState.getCLIInputPayload();
      await generateConsoleNotificationStackTemplate(context, resourceName);
      return true;
    }
    return false;
  }
  return true;
};
