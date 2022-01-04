import { Rule } from "@aws-cdk/aws-events";
import { Topic } from "@aws-cdk/aws-sns";

export type AmplifyConsoleNotificationStackTemplate = {
  topic: Topic;
  eventRule: Rule;
};