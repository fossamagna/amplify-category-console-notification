import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import {
  pathManager,
  $TSContext,
  writeCFNTemplate,
  CFNTemplateFormat,
  buildOverrideDir,
  Template,
  AmplifyStackTemplate,
  AmplifyCategoryTransform,
  JSONUtilities,
  $TSAny,
} from 'amplify-cli-core';
import { printer, formatter } from 'amplify-prompts';
import { ConsoleNotificationInputState } from '../console-notification-inputs-manager/console-notification-input-state';
import { ConsoleNotificationStackOptions } from '../service-walkthrough-types/console-notification-user-input-types';
import { getAppId } from '../utils/get-app-id';
import { AmplifyConsoleNotificationStack } from './console-notificatoin-stack-builder';
import { category } from '../../../constants';
import * as vm from 'vm2';
import * as fs from 'fs-extra';
import os from 'os';
import { CfnRule } from '@aws-cdk/aws-events';

export class AmplifyConsoleNotificationTransform extends AmplifyCategoryTransform {

  private app: cdk.App;
  private _resourceTemplateObj?: AmplifyConsoleNotificationStack;
  private _stackOptions?: ConsoleNotificationStackOptions;

  constructor(resourceName: string) {
    super(resourceName);
    this.app = new cdk.App();
  }

  async transform(context: $TSContext): Promise<Template> {
    this._stackOptions = this.generateStackOptions(context);

    this._resourceTemplateObj = new AmplifyConsoleNotificationStack(this.app, 'AmplifyConsoleNotificationStack', this._stackOptions);
    // add CFN parameter
    this.addCfnParameters(this._resourceTemplateObj, this._stackOptions);
    //  generate
    await this._resourceTemplateObj.generateStackResources();
    // add CFN output
    this.addCfnOutputs(this._resourceTemplateObj);

    // apply override on Amplify Object having CDK Constructs for Console Notification Stack
    await this.applyOverride();

    // generate CFN template
    const template = this._resourceTemplateObj.renderCloudFormationTemplate();

    // save stack and parameters.json
    await this.saveBuildFiles(context, template);
    return template;
  }

  async applyOverride(): Promise<void> {
    const backendDir = pathManager.getBackendDirPath();
    const overrideDir = path.join(backendDir, category, this.resourceName);
    const isBuild = await buildOverrideDir(backendDir, overrideDir).catch(error => {
      printer.error(`Build error : ${error.message}`);
      throw new Error(error);
    });
    if (isBuild) {
      const overrideCode: string = await fs.readFile(path.join(overrideDir, 'build', 'override.js'), 'utf-8').catch(() => {
        formatter.list(['No override File Found', `To override ${this.resourceName} run amplify override auth`]);
        return '';
      });

      const sandboxNode = new vm.NodeVM({
        console: 'inherit',
        timeout: 5000,
        sandbox: {},
        require: {
          context: 'sandbox',
          builtin: ['path'],
          external: true,
        },
      });
      try {
        await sandboxNode
          .run(overrideCode, path.join(overrideDir, 'build', 'override.js'))
          .override(this._resourceTemplateObj as AmplifyConsoleNotificationStack & AmplifyStackTemplate);
      } catch (err: $TSAny) {
        const error = new Error(`Skipping override due to ${err}${os.EOL}`);
        printer.error(`${error}`);
        error.stack = undefined;
        throw error;
      }
    }
  }

  async saveBuildFiles(context: $TSContext, template: Template): Promise<void> {
    const stackFileName = `${this.resourceName}-cloudformation-template.json`;
    const stackFilePath = path.join(
      pathManager.getBackendDirPath(),
      category,
      this.resourceName,
      'build',
      stackFileName,
    );
    // write CFN template
    await writeCFNTemplate(template, stackFilePath, {
      templateFormat: CFNTemplateFormat.JSON,
    });
    // write parameters.json
    await this.writeBuildFiles(context);
  }

  private writeBuildFiles = async (context: $TSContext) => {
    const parametersJSONFilePath = path.join(
      pathManager.getBackendDirPath(),
      category,
      this.resourceName,
      'build',
      'parameters.json',
    );
    const parameters = {
      appId: this._stackOptions?.appId
    }
    //save parameters
    JSONUtilities.writeJson(parametersJSONFilePath, parameters);
  }

  private generateStackOptions(context: $TSContext): ConsoleNotificationStackOptions {
    const cliState = new ConsoleNotificationInputState(this.resourceName);
    const input = cliState.getCLIInputPayload();
    return {
      appId: getAppId(context)!,
      sendToSlackFunctionName: input.sendToSlackFuncton
    }
  }

  private addCfnParameters(stack: AmplifyConsoleNotificationStack, stackOptions: ConsoleNotificationStackOptions) {
    stack.addCfnParameter({
      type: 'String',
      description: 'Amplify Application ID'
    }, 'appId');
    stack.addCfnParameter({
      type: 'String'
    }, 'env');
    stack.addCfnParameter({
      type: 'String'
    }, `function${stackOptions.sendToSlackFunctionName}Arn`);
  }

  private addCfnOutputs(stack: AmplifyConsoleNotificationStack) {
    stack.addCfnOutput({
      value: stack.topic.topicArn
    }, 'SNSTopicArn');
    stack.addCfnOutput({
      value: stack.topic.topicName
    }, 'SNSTopicName');
    stack.addCfnOutput({
      value: (stack.eventRule.node.findChild('Resource') as CfnRule).ref
    }, 'EventRuleId');
    stack.addCfnOutput({
      value: stack.eventRule.ruleArn
    }, 'EventRuleArn');
    stack.addCfnOutput({
      value: cdk.Fn.ref('AWS::Region'),
    }, 'Region');
  }
}