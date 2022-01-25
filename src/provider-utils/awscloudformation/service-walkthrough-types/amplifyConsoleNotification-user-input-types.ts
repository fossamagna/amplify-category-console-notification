export interface ConsoleNotificationCLIInputs {
  /**
   * The schema version.
   */
  version: 1;
  
  sendToSlackFuncton: string;
}

export type ConsoleNotificationStackOptions = {
  appId: string;
  sendToSlackFunctionName: string;
}
