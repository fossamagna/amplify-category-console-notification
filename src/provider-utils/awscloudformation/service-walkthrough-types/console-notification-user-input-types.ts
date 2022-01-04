export interface ConsoleNotificationCLIInputs {
  sendToSlackFuncton: string;
}

export type ConsoleNotificationStackOptions = {
  appId: string;
  sendToSlackFunctionName: string;
}
