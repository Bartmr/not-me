import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { ValidationResult } from "../schema";

export type BaseType = {};

export function objectTypeFilter(
  input: unknown,
  message?: string
): ValidationResult<BaseType> {
  if (typeof input === "object" && input !== null) {
    return {
      errors: false,
      value: input,
    };
  } else {
    return {
      errors: true,
      messagesTree: [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages().object
            ?.notAnObject ||
          "Must be an object",
      ],
    };
  }
}
