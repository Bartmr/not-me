import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

class DateSchemaImpl<_Output = Date | undefined> extends BaseSchema<
  Date,
  Date,
  _Output
> {
  constructor(message?: string) {
    super((input) => {
      const notADateMessages = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages().date?.notADate ||
          "Input must be a date",
      ];

      const invalidDateMessages = [
        message ||
          DefaultErrorMessagesManager.getDefaultMessages().date?.invalidDate ||
          "Input is not a valid date",
      ];

      if (input instanceof Date) {
        if (isNaN(input.getTime())) {
          return {
            errors: true,
            messagesTree: invalidDateMessages,
          };
        } else {
          return {
            errors: false,
            value: input,
          };
        }
      } else if (typeof input === "string") {
        const date = new Date(input);

        if (isNaN(date.getTime())) {
          return {
            errors: true,
            messagesTree: invalidDateMessages,
          };
        } else {
          return {
            errors: false,
            value: date,
          };
        }
      } else {
        return {
          errors: true,
          messagesTree: notADateMessages,
        };
      }
    });
  }

  required(message?: string): DateSchemaImpl<Date> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class DateSchema extends DateSchemaImpl {}

export function date(message?: string): DateSchema {
  return new DateSchema(message);
}
