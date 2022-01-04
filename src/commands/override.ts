import path from 'path';
import { $TSContext, pathManager, stateManager, generateOverrideSkeleton, JSONUtilities } from 'amplify-cli-core';
import { printer } from 'amplify-prompts';
import * as fs from 'fs-extra';
import { category } from '../constants';
import { checkConsoleNotificationResourceMigration } from '../provider-utils/awscloudformation/utils/check-for-console-notification-migration';

export const run = async (context: $TSContext) => {
  const amplifyMeta = stateManager.getMeta();
  const consoleNotificationResources: string[] = [];
  Object.keys(amplifyMeta[category]).forEach(resourceName => {
    consoleNotificationResources.push(resourceName);
  });
  if (consoleNotificationResources.length === 0) {
    const errMessage = 'No console notification resources to override. Add console notification using `amplify add console-notification`';
    printer.error(errMessage);
    return;
  }
  const consoleNotificationResource = consoleNotificationResources[0];
  if (!await checkConsoleNotificationResourceMigration(context, consoleNotificationResource, false)) {
    return;
  }
  await generateOverrideforConsoleNotificationResource(context, consoleNotificationResource)
}

const generateOverrideforConsoleNotificationResource = async (context: $TSContext, resourceName: string) => {
  const backendDir = pathManager.getBackendDirPath();
  const destPath = path.normalize(path.join(backendDir, category, resourceName));
  const srcPath = path.normalize(path.join(__dirname, '..', '..', 'resources', 'overrides-resource'));

  // add this module to dependencies in package.json
  const srcPackageJSONFilePath = path.join(srcPath, 'package.json');
  addHelperToDependencies(srcPackageJSONFilePath);

  // add this module to dependencies in package.json
  const packageJSONFilePath = path.join(backendDir, 'package.json');
  addHelperToDependencies(packageJSONFilePath);
  
  await generateOverrideSkeleton(context, srcPath, destPath);
};

const addHelperToDependencies = (packageJSONFilePath: string) => {
  if (!fs.existsSync(packageJSONFilePath)) {
    return;
  }
  const packageJson = JSONUtilities.readJson(packageJSONFilePath) as any;
  const pluginPackageJSONFilePath = path.join(__dirname, '..', '..', 'package.json');
  const pluginPackageJson = JSONUtilities.readJson(pluginPackageJSONFilePath) as any;
  packageJson.dependencies[pluginPackageJson.name] = isAmplifyDev() ? path.join(__dirname, '..', '..') : pluginPackageJson.version;
  JSONUtilities.writeJson(packageJSONFilePath, packageJson);
}

function isAmplifyDev(): boolean {
  const amplifyExecutableName = path.basename(process.argv[1]);
  return amplifyExecutableName === 'amplify-dev';
}