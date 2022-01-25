import { CLIInputSchemaGenerator, TypeDef } from 'amplify-cli-core';

const ConsoleNotificationTypeDef: TypeDef = {
  typeName: 'ConsoleNotificationCLIInputs',
  service: 'AmplifyConsoleNotification',
};

// Defines the type names and the paths to the TS files that define them
const consoleNotificationCategoryTypeDefs: TypeDef[] = [ConsoleNotificationTypeDef];

const schemaGenerator = new CLIInputSchemaGenerator(consoleNotificationCategoryTypeDefs);
schemaGenerator.generateJSONSchemas(); // convert CLI input data into json schemas.
