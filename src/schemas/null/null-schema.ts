import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

class NullSchemaImpl<_Output = null | undefined> extends BaseSchema<
  null,
  null,
  _Output
> {
  constructor(message?: string) {
    super((input) => {
      const typeErrorMessage = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages().null?.notNull ||
          "Input must be null",
      ];

      if (input === null) {
        return {
          errors: false,
          value: input,
        };
      } else {
        return {
          errors: true,
          messagesTree: typeErrorMessage,
        };
      }
    });
  }

  required(message?: string): NullSchemaImpl<null> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class NullSchema extends NullSchemaImpl {}

export function nullValue(message?: string): NullSchema {
  return new NullSchema(message);
}
