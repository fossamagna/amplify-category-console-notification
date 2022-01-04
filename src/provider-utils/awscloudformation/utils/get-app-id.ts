import { $TSContext } from "amplify-cli-core";

export function getAppId(context: $TSContext): string | undefined {
  const meta = context.amplify.getProjectMeta();
  if (meta.providers && meta.providers.awscloudformation) {
    return meta.providers.awscloudformation.AmplifyAppId;
  }
}
