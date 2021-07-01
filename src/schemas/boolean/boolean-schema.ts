import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

class BooleanSchemaImpl<_Output = boolean | undefined> extends BaseSchema<
  boolean,
  boolean,
  _Output
> {
  constructor(message?: string) {
    super((input) => {
      if (typeof input === "boolean") {
        return {
          errors: false,
          value: input,
        };
      } else if (input === "true" || input === "false") {
        return {
          errors: false,
          value: input === "true",
        };
      } else {
        const typeErrorMessage = [
          message ||
            DefaultErrorMessagesManager.getDefaultMessages().boolean
              ?.notABoolean ||
            "Input must be a true or false",
        ];

        return {
          errors: true,
          messagesTree: typeErrorMessage,
        };
      }
    });
  }

  required(message?: string): BooleanSchemaImpl<boolean> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class BooleanSchema extends BooleanSchemaImpl {}

export function boolean(message?: string): BooleanSchema {
  return new BooleanSchema(message);
}
