import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

abstract class StringSchemaImpl<
  _Output extends string | undefined = string | undefined
> extends BaseSchema<string, string, _Output> {
  constructor(message?: string) {
    super((input) => {
      if (typeof input === "string") {
        return {
          errors: false,
          value: input,
        };
      } else {
        const typeErrorMessage = [
          message ||
            DefaultErrorMessagesManager.getDefaultMessages().string
              ?.notAString ||
            "Input must be a string",
        ];

        return {
          errors: true,
          messagesTree: typeErrorMessage,
        };
      }
    });
  }

  /**
   * Input must have any character other than spaces
   */
  filled(message?: string): StringSchemaImpl<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.test((input) => {
      return input && input.trim().length > 0
        ? null
        : message ?? "Input must be filled";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  }

  public required(message?: string): StringSchemaImpl<string> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class StringSchema extends StringSchemaImpl {}

export function string(message?: string): StringSchema {
  return new StringSchema(message);
}
