import * as path from 'path';
import * as fs from 'fs-extra';
import {
  JSONUtilities,
  pathManager,
  CLIInputSchemaValidator,
  CategoryInputState,
} from 'amplify-cli-core';
import { category } from '../../../constants';
import { ConsoleNotificationCLIInputs } from '../service-walkthrough-types/console-notification-user-input-types';

export class ConsoleNotificationInputState extends CategoryInputState {

  #cliInputsFilePath: string; //cli-inputs.json (output) filepath
  #category: string; //category of the resource
  #service: string; //AWS service for the resource
  #buildFilePath: string;

  constructor(resourceName: string) {
    super(resourceName);
    this.#category = category
    this.#service = "AmplifyConsoleNotification";
    const projectBackendDirPath = pathManager.getBackendDirPath();
    this.#cliInputsFilePath = path.resolve(path.join(projectBackendDirPath, category, resourceName, 'cli-inputs.json'));
    this.#buildFilePath = path.resolve(path.join(projectBackendDirPath, category, resourceName, 'build'));
  }

  getCLIInputPayload() {
    return JSONUtilities.readJson<ConsoleNotificationCLIInputs>(this.#cliInputsFilePath, { throwIfNotExist: true })!;
  }

  async saveCLIInputPayload(cliInputs: any): Promise<void> {
    if (await this.isCLIInputsValid(cliInputs)) {
      fs.ensureDirSync(path.join(pathManager.getBackendDirPath(), this.#category, this._resourceName));
      JSONUtilities.writeJson(this.#cliInputsFilePath, cliInputs);
    }
  }

  isCLIInputsValid(cliInputs: any): Promise<boolean> {
    const schemaValidator = new CLIInputSchemaValidator(this.#service, this.#category, 'ConsoleNotificationCLIInputs');
    return schemaValidator.validateInput(JSON.stringify(cliInputs));
  }

  cliInputFileExists(): boolean {
    return fs.existsSync(this.#cliInputsFilePath);
  }
}