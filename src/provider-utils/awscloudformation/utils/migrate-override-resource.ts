
import * as path from 'path';
import * as fs from 'fs-extra';
import { $TSObject, JSONUtilities, NotInitializedError, pathManager } from 'amplify-cli-core';
import { printer } from 'amplify-prompts';
import { category } from '../../../constants';
import { ConsoleNotificationCLIInputs } from '../service-walkthrough-types/amplifyConsoleNotification-user-input-types';

export const migrateResourceToSupportOverride = async (resourceName: string) => {
  printer.debug('Starting Migration Process');
  const projectPath = pathManager.findProjectRoot();
  if (!projectPath) {
    // New project, hence not able to find the amplify dir
    throw new NotInitializedError();
  }
  const resourceDirPath = pathManager.getResourceDirectoryPath(undefined, category, resourceName);

  const oldParametersFilepath = path.join(resourceDirPath, 'parameters.json');
  const oldCFNFilepath = path.join(resourceDirPath, `${resourceName}-cloudformation-template.json`);
  const cfn = JSONUtilities.readJson<$TSObject>(oldCFNFilepath, { throwIfNotExist: true })!;
  
  const functionParam = Object.keys(cfn.Parameters).filter(key => key.startsWith('function') && key.endsWith('Arn'))[0];
  const functionName = functionParam.replace(/^function/, '').replace(/Arn$/, '');

  const cliInputs: ConsoleNotificationCLIInputs = {
    version: 1,
    sendToSlackFuncton: functionName
  };
  const cliInputsPath = path.join(resourceDirPath, 'cli-inputs.json');
  JSONUtilities.writeJson(cliInputsPath, cliInputs);

  // Remove old files
  if (fs.existsSync(oldCFNFilepath)) {
    fs.removeSync(oldCFNFilepath);
  }
  if (fs.existsSync(oldParametersFilepath)) {
    fs.removeSync(oldParametersFilepath);
  }
}