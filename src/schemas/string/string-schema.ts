import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

export class StringSchema extends BaseSchema<string, string> {
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
  filled(message?: string): StringSchema {
    return this.test((input) => {
      if (input === undefined) {
        return null;
      } else {
        return input.trim().length > 0
          ? null
          : message ?? "Input must be filled";
      }
    });
  }
}

export function string(message?: string): StringSchema {
  return new StringSchema(message);
}
