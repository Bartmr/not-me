import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

abstract class StringSchemaImpl<
  _Output extends string | undefined | null = string | undefined | null
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

  public required(message?: string): StringSchemaImpl<string> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  public notNull(message?: string): StringSchemaImpl<Exclude<_Output, null>> {
    this.markAsNotNullInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  public defined(
    message?: string
  ): StringSchemaImpl<Exclude<_Output, undefined>> {
    this.markAsDefinedInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class StringSchema extends StringSchemaImpl {}

export function string(message?: string): StringSchema {
  return new StringSchema(message);
}
