import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { BaseSchema } from "../base/base-schema";

class EqualsSchemaImpl<
  PossibleValues extends readonly unknown[],
  _Output = PossibleValues[number] | undefined | null
> extends BaseSchema<PossibleValues[number], PossibleValues[number], _Output> {
  constructor(possibleValues: PossibleValues, message?: string) {
    super((input) => {
      if (possibleValues.includes(input)) {
        return {
          errors: false,
          value: input,
        };
      } else {
        return {
          errors: true,
          messagesTree: [
            message ||
              DefaultErrorMessagesManager.getDefaultMessages().equals
                ?.notEqual ||
              "Input must be one of the allowed values",
          ],
        };
      }
    });
  }

  required(
    message?: string
  ): EqualsSchemaImpl<PossibleValues, Exclude<_Output, undefined | null>> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  notNull(
    message?: string
  ): EqualsSchemaImpl<PossibleValues, Exclude<_Output, null>> {
    this.markAsNotNullInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  defined(
    message?: string
  ): EqualsSchemaImpl<PossibleValues, Exclude<_Output, undefined>> {
    this.markAsDefinedInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class EqualsSchema<
  PossibleValues extends readonly unknown[]
> extends EqualsSchemaImpl<PossibleValues> {}

export function equals<PossibleValues extends readonly unknown[]>(
  possibleValues: PossibleValues,
  message?: string
): EqualsSchema<PossibleValues> {
  return new EqualsSchema<PossibleValues>(possibleValues, message);
}
