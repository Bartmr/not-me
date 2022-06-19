import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

class NumberSchemaImpl<_Output = number | undefined | null> extends BaseSchema<
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

    this.wrapValueBeforeValidation = (input) => {
      if (typeof input === "string") {
        const trimmed = input.trim();

        if (!trimmed) {
          return undefined;
        } else {
          return trimmed;
        }
      } else {
        return input;
      }
    };
  }

  integer(message?: string): this {
    return this.test((input) => {
      if (input == null) {
        return null;
      } else {
        return Number.isInteger(input)
          ? null
          : message ||
              DefaultErrorMessagesManager.getDefaultMessages().number
                ?.isNotInteger ||
              "Input must be an integer";
      }
    });
  }

  required(message?: string): NumberSchemaImpl<number> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  notNull(message?: string): NumberSchemaImpl<Exclude<_Output, null>> {
    this.markAsNotNullInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  defined(message?: string): NumberSchemaImpl<Exclude<_Output, undefined>> {
    this.markAsDefinedInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class NumberSchema extends NumberSchemaImpl {}

export function number(message?: string): NumberSchema {
  return new NumberSchema(message);
}
