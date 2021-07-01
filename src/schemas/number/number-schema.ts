import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

class NumberSchemaImpl<_Output = number | undefined> extends BaseSchema<
  number,
  number,
  _Output
> {
  constructor(message?: string) {
    super((input) => {
      const typeErrorMessage = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages().number?.notANumber ||
          "Input must be a number",
      ];

      if (typeof input === "number" || typeof input === "string") {
        const number = typeof input === "number" ? input : Number(input);

        if (isNaN(number)) {
          return {
            errors: true,
            messagesTree: typeErrorMessage,
          };
        } else {
          return {
            errors: false,
            value: number,
          };
        }
      } else {
        return {
          errors: true,
          messagesTree: typeErrorMessage,
        };
      }
    });
  }

  integer(message?: string): this {
    this.test((input) =>
      Number.isInteger(input)
        ? null
        : message ||
          DefaultErrorMessagesManager.getDefaultMessages().number
            ?.isNotInteger ||
          "Input must be an integer"
    );

    return this;
  }

  required(message?: string): NumberSchemaImpl<number> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class NumberSchema extends NumberSchemaImpl {}

export function number(message?: string): NumberSchema {
  return new NumberSchema(message);
}
