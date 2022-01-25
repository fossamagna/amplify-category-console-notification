import * as cdk from '@aws-cdk/core';
import { Rule } from '@aws-cdk/aws-events';
import { SnsTopic } from '@aws-cdk/aws-events-targets';
import { Function, CfnPermission } from '@aws-cdk/aws-lambda';
import { Topic } from '@aws-cdk/aws-sns';
import { LambdaSubscription } from "@aws-cdk/aws-sns-subscriptions";
import { AmplifyStackTemplate, Template } from 'amplify-cli-core';
import { ConsoleNotificationStackOptions } from '../service-walkthrough-types/amplifyConsoleNotification-user-input-types';
import { AmplifyConsoleNotificationStackTemplate } from '../../../amplify-cli-extensibility-helper/types';

const CFN_TEMPLATE_FORMAT_VERSION = '2010-09-09';
const ROOT_CFN_DESCRIPTION = 'Amplify Console notification resource stack creation using Amplify CLI';

export class AmplifyConsoleNotificationStack extends cdk.Stack implements AmplifyConsoleNotificationStackTemplate, AmplifyStackTemplate {
  
  private _scope: cdk.Construct;
  private _options: ConsoleNotificationStackOptions;
  private _cfnParameterMap: Map<string, cdk.CfnParameter> = new Map();
  private _cfnConditionMap: Map<string, cdk.CfnCondition> = new Map();
  private _cfnOutputMap: Map<string, cdk.CfnOutput> = new Map();
  private _cfnMappingMap: Map<string, cdk.CfnMapping> = new Map();
  
  topic!: Topic;
  eventRule!: Rule;

  constructor(scope: cdk.Construct, id: string, options: ConsoleNotificationStackOptions) {
    super(scope, id, undefined);
    this._scope = scope;
    this._options = options;
    this.templateOptions.templateFormatVersion = CFN_TEMPLATE_FORMAT_VERSION;
    this.templateOptions.description = ROOT_CFN_DESCRIPTION;
  }

  generateStackResources = async () => {
    this.topic = new Topic(this, 'SNSTopic', {
      displayName: cdk.Fn.join("", [
        "amplify-console-notification",
        "-",
        cdk.Fn.ref("env")
      ]),
      topicName: cdk.Fn.join("", [
        "amplify-console-notification",
        "-",
        cdk.Fn.ref("env")
      ]),
    });

    const fn = Function.fromFunctionArn(this, 'LambdaFunction', cdk.Fn.ref(`function${this._options.sendToSlackFunctionName}Arn`));
    this.topic.addSubscription(new LambdaSubscription(fn));

    const cfnPermission = new CfnPermission(this, 'LambdaPermission', {
      action: "lambda:InvokeFunction",
      functionName: fn.functionName,
      principal: "sns.amazonaws.com",
      sourceArn: this.topic.topicArn
    });

    this.eventRule = new Rule(this, 'EventRule', {
      description: 'EventRule for Amplify Console',
      eventPattern: {
        detail: {
          appId: [
            cdk.Fn.ref('appId'),
          ],
          branchName: [
            cdk.Fn.ref('env'),
          ],
          jobStatus: [
            "SUCCEED",
            "FAILED",
            "STARTED"
          ]
        },
        detailType: [
          "Amplify Deployment Status Change"
        ],
        source: [
          "aws.amplify"
        ]
      },
      enabled: true,
      targets: [
        new SnsTopic(this.topic)
      ]
    });
  }

  renderCloudFormationTemplate = (): Template => {
    return this._toCloudFormation() as Template;
  };
  
  addCfnParameter(props: cdk.CfnParameterProps, logicalId: string): void {
    try {
      if (this._cfnParameterMap.has(logicalId)) {
        throw new Error('logical Id already Exists');
      }
      this._cfnParameterMap.set(logicalId, new cdk.CfnParameter(this, logicalId, props));
    } catch (error) {
      throw new Error(`Cfn Parameter with LogicalId ${logicalId} doesnt exist`);
    }
  }

  addCfnOutput(props: cdk.CfnOutputProps, logicalId: string): void {
    if (!this._cfnOutputMap.has(logicalId)) {
      this._cfnOutputMap.set(logicalId, new cdk.CfnOutput(this, logicalId, props));
    } else {
      throw new Error(`Cfn Output with LogicalId ${logicalId} doesnt exist`);
    }
  }

  addCfnMapping(props: cdk.CfnMappingProps, logicalId: string): void {
    if (!this._cfnMappingMap.has(logicalId)) {
      this._cfnMappingMap.set(logicalId, new cdk.CfnMapping(this, logicalId, props));
    } else {
      throw new Error(`Cfn Mapping with LogicalId ${logicalId} doesnt exist`);
    }
  }

  addCfnCondition(props: cdk.CfnConditionProps, logicalId: string): void {
    if (!this._cfnConditionMap.has(logicalId)) {
      this._cfnConditionMap.set(logicalId, new cdk.CfnCondition(this, logicalId, props));
    } else {
      throw new Error(`Cfn Condition with LogicalId ${logicalId} doesnt exist`);
    }
  }

  getCfnParameter(logicalId: string): cdk.CfnParameter {
    if (this._cfnParameterMap.has(logicalId)) {
      return this._cfnParameterMap.get(logicalId)!;
    } else {
      throw new Error(`Cfn Parameter with LogicalId ${logicalId} doesnt exist`);
    }
  }

  getCfnOutput(logicalId: string): cdk.CfnOutput {
    if (this._cfnOutputMap.has(logicalId)) {
      return this._cfnOutputMap.get(logicalId)!;
    } else {
      throw new Error(`Cfn Output with LogicalId ${logicalId} doesnt exist`);
    }
  }

  getCfnMapping(logicalId: string): cdk.CfnMapping {
    if (this._cfnMappingMap.has(logicalId)) {
      return this._cfnMappingMap.get(logicalId)!;
    } else {
      throw new Error(`Cfn Mapping with LogicalId ${logicalId} doesnt exist`);
    }
  }

  getCfnCondition(logicalId: string): cdk.CfnCondition {
    if (this._cfnConditionMap.has(logicalId)) {
      return this._cfnConditionMap.get(logicalId)!;
    } else {
      throw new Error(`Cfn Condition with LogicalId ${logicalId} doesnt exist`);
    }
  }
}
